# Iteration 4: pricing/payment plan settings + referral (referred_by) on waitlist, admin search & CSV
import os, uuid, random, csv, io
import pytest, requests

BASE_URL = os.environ.get("EXPO_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "goldmindstrading@gmail.com", "password": "GoldHouse-ba673a84"}


def ip_h():
    return {"CF-Connecting-IP": f"10.{random.randint(1,250)}.{random.randint(1,250)}.{random.randint(1,250)}"}


@pytest.fixture(scope="module")
def h():
    r = requests.post(f"{API}/auth/login", json=ADMIN, headers=ip_h())
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture(scope="module")
def restore_settings(h):
    orig = requests.get(f"{API}/admin/settings", headers=h).json()
    yield orig
    keys = ["price", "price_note", "payment_plan", "show_price", "show_payment_plan"]
    requests.put(f"{API}/admin/settings", json={k: orig[k] for k in keys}, headers=h)
    requests.put(f"{API}/admin/settings", json={"show_price": True, "show_payment_plan": True}, headers=h)


# --- Public site pricing defaults
class TestPricingPublic:
    def test_site_pricing_defaults(self):
        s = requests.get(f"{API}/site").json()
        assert s["price"] == "$1,699"
        assert "$2,000" in s["price_note"]
        pp = s["payment_plan"]
        for frag in ["$300 down", "5 payments of $350", "every 2 weeks", "60-day", "1 month before", "agreement"]:
            assert frag in pp, frag
        assert s["show_price"] is True and s["show_payment_plan"] is True

    def test_faq_referral_and_cost(self):
        s = requests.get(f"{API}/site").json()
        faq = s.get("faq") or []
        qs = {f["q"]: f["a"] for f in faq}
        assert "Do you have a referral program?" in qs
        assert "$100" in qs["Do you have a referral program?"]
        assert "$1,699" in qs["How much does the intensive cost?"]


# --- Admin pricing settings & toggles
class TestPricingAdmin:
    def test_edit_and_toggles(self, h, restore_settings):
        r = requests.put(f"{API}/admin/settings", json={"price": "$1,799", "price_note": "TEST note", "payment_plan": "Line A\nLine B"}, headers=h)
        assert r.status_code == 200 and r.json()["price"] == "$1,799"
        s = requests.get(f"{API}/site").json()
        assert s["price"] == "$1,799" and s["price_note"] == "TEST note" and s["payment_plan"] == "Line A\nLine B"
        # hide plan only
        requests.put(f"{API}/admin/settings", json={"show_payment_plan": False}, headers=h)
        s = requests.get(f"{API}/site").json()
        assert s["price"] == "$1,799" and s["payment_plan"] == ""
        # hide price => all hidden
        requests.put(f"{API}/admin/settings", json={"show_price": False, "show_payment_plan": True}, headers=h)
        s = requests.get(f"{API}/site").json()
        assert s["price"] == "" and s["price_note"] == "" and s["payment_plan"] == ""
        # admin still sees values
        a = requests.get(f"{API}/admin/settings", headers=h).json()
        assert a["price"] == "$1,799" and a["show_price"] is False

    def test_settings_requires_auth(self):
        assert requests.put(f"{API}/admin/settings", json={"price": "$1"}).status_code == 401


# --- Referral on waitlist
class TestReferral:
    def test_referred_by_flow(self, h):
        email = f"test_ref_{uuid.uuid4().hex[:8]}@example.com"
        ref = f"TEST_Referrer_{uuid.uuid4().hex[:6]}"
        p = {"first_name": "TEST_Ref", "email": email, "experience": "Completely new", "email_consent": True,
             "sms_consent": False, "phone": f"602555{random.randint(1000,9999)}", "referred_by": f"  {ref}  ", "source_page": "/"}
        r = requests.post(f"{API}/waitlist", json=p, headers=ip_h())
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "created"
        try:
            leads = requests.get(f"{API}/admin/leads", params={"q": ref}, headers=h).json()
            assert len(leads) == 1 and leads[0]["email"] == email
            assert leads[0]["referred_by"] == ref
            assert "_id" not in leads[0]
            # CSV export
            tok = h["Authorization"].split()[1]
            c = requests.get(f"{API}/admin/leads/export", params={"token": tok, "q": ref}, headers=h)
            assert c.status_code == 200
            rows = list(csv.DictReader(io.StringIO(c.text)))
            assert "referred_by" in rows[0]
            row = [x for x in rows if x["email"] == email]
            assert row and row[0]["referred_by"] == ref
        finally:
            for l in requests.get(f"{API}/admin/leads", params={"q": email}, headers=h).json():
                requests.delete(f"{API}/admin/leads/{l['id']}", headers=h)

    def test_referred_by_too_long(self):
        p = {"first_name": "TEST_Ref", "email": f"test_{uuid.uuid4().hex[:8]}@example.com", "experience": "Completely new",
             "email_consent": True, "phone": "6025551234", "referred_by": "x" * 121}
        assert requests.post(f"{API}/waitlist", json=p, headers=ip_h()).status_code == 422
