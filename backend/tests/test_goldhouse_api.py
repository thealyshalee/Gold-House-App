# Gold House Trading backend regression tests (waitlist, auth, leads, testimonials, site settings, media)
import os, uuid, random, io
import pytest, requests

BASE_URL = os.environ.get("EXPO_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "goldmindstrading@gmail.com", "password": "GoldHouse-ba673a84"}


def xff():
    return {"X-Forwarded-For": f"10.{random.randint(1,250)}.{random.randint(1,250)}.{random.randint(1,250)}"}


def lead_payload(**kw):
    p = {"first_name": "TEST_Ann", "email": f"test_{uuid.uuid4().hex[:8]}@example.com", "experience": "Completely new",
         "email_consent": True, "sms_consent": False, "phone": f"602555{random.randint(1000,9999)}", "source_page": "/"}
    p.update(kw)
    return p


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json=ADMIN, headers=xff())
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def h(token):
    return {"Authorization": f"Bearer {token}"}


created_leads = []


@pytest.fixture(scope="session", autouse=True)
def cleanup(request):
    yield
    try:
        t = requests.post(f"{API}/auth/login", json=ADMIN, headers=xff()).json()["access_token"]
        for e in created_leads:
            for l in requests.get(f"{API}/admin/leads", params={"q": e}, headers={"Authorization": f"Bearer {t}"}).json():
                requests.delete(f"{API}/admin/leads/{l['id']}", headers={"Authorization": f"Bearer {t}"})
    except Exception:
        pass


# --- Waitlist validation
class TestWaitlist:
    @pytest.mark.parametrize("override", [
        {"first_name": ""}, {"email": "bad"}, {"experience": "Expert"}, {"email_consent": False},
        {"sms_consent": True, "phone": ""}, {"phone": "12345"},
    ])
    def test_validation_422(self, override):
        r = requests.post(f"{API}/waitlist", json=lead_payload(**override), headers=xff())
        assert r.status_code == 422, r.text

    # iteration 2: phone is required
    def test_phone_required_message(self):
        r = requests.post(f"{API}/waitlist", json=lead_payload(phone="  "), headers=xff())
        assert r.status_code == 422 and r.json()["detail"] == "Please enter your mobile number.", r.text
        p = lead_payload(); p.pop("phone")
        assert requests.post(f"{API}/waitlist", json=p, headers=xff()).status_code == 422

    def test_e164_variants(self, h):
        for raw, exp in [("+44 7911 123456", "+447911123456"), ("1-602-555-0177", "+16025550177")]:
            p = lead_payload(phone=raw); created_leads.append(p["email"])
            assert requests.post(f"{API}/waitlist", json=p, headers=xff()).status_code == 200
            l = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()[0]
            assert l["phone"] == exp and l["sms_status"] == "none"

    def test_all_experiences_accepted(self):
        for exp in ["Completely new", "I've started learning", "I've traded before", "I'm actively trading"]:
            p = lead_payload(experience=exp); created_leads.append(p["email"])
            r = requests.post(f"{API}/waitlist", json=p, headers=xff())
            assert r.status_code == 200 and r.json()["status"] == "created", r.text

    def test_create_sms_normalize_and_duplicate(self, h):
        p = lead_payload(phone="(602) 555-0199", sms_consent=True); created_leads.append(p["email"])
        r = requests.post(f"{API}/waitlist", json=p, headers=xff())
        assert r.json()["status"] == "created"
        leads = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()
        assert len(leads) == 1
        l = leads[0]
        assert l["phone"] == "+16025550199" and l["sms_status"] == "opted_in" and l["email_status"] == "subscribed"
        assert "_id" not in l
        sms = [c for c in l["consent_log"] if c["channel"] == "sms"][0]
        for k in ("text", "version", "timestamp", "source_page"):
            assert sms.get(k), k
        # duplicate
        r2 = requests.post(f"{API}/waitlist", json={**p, "first_name": "TEST_Updated", "sms_consent": False}, headers=xff())
        assert r2.json()["status"] == "updated"
        leads = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()
        assert len(leads) == 1 and leads[0]["first_name"] == "TEST_Updated" and leads[0]["submissions"] == 2

    def test_phone_without_sms_consent_not_opted_in(self, h):
        p = lead_payload(phone="602-555-0111"); created_leads.append(p["email"])
        requests.post(f"{API}/waitlist", json=p, headers=xff())
        l = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()[0]
        assert l["sms_status"] == "none" and l["phone"] == "+16025550111"
        assert all(c["channel"] != "sms" for c in l["consent_log"])

    def test_honeypot(self, h):
        p = lead_payload(website="http://spam")
        r = requests.post(f"{API}/waitlist", json=p, headers=xff())
        assert r.status_code == 200
        assert requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json() == []

    def test_rate_limit(self):
        hdr = xff(); codes = []
        for _ in range(8):
            codes.append(requests.post(f"{API}/waitlist", json=lead_payload(website="x"), headers=hdr).status_code)
        assert 429 in codes and codes[:6] == [200] * 6, codes


# --- Auth
class TestAuth:
    def test_bad_login(self):
        assert requests.post(f"{API}/auth/login", json={**ADMIN, "password": "nope"}, headers=xff()).status_code == 401

    def test_me(self, h):
        assert requests.get(f"{API}/auth/me", headers=h).json()["email"] == ADMIN["email"]

    @pytest.mark.parametrize("m,path", [("get", "/admin/leads"), ("get", "/admin/stats"), ("get", "/admin/settings"),
                                        ("put", "/admin/settings"), ("get", "/admin/testimonials"), ("get", "/admin/media"),
                                        ("post", "/admin/testimonials"), ("get", "/admin/leads/export"), ("get", "/auth/me")])
    def test_401(self, m, path):
        assert getattr(requests, m)(f"{API}{path}").status_code == 401


# --- Leads admin
class TestLeads:
    def test_filters_patch_delete_export(self, h, token):
        p = lead_payload(phone="6025550123", sms_consent=True, experience="I've traded before"); created_leads.append(p["email"])
        requests.post(f"{API}/waitlist", json=p, headers=xff())
        l = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()[0]
        assert any(x["id"] == l["id"] for x in requests.get(f"{API}/admin/leads", params={"experience": "I've traded before", "sms_status": "opted_in"}, headers=h).json())
        assert any(x["id"] == l["id"] for x in requests.get(f"{API}/admin/leads", params={"q": "5550123"}, headers=h).json())
        csv_sms = requests.get(f"{API}/admin/leads/export", params={"type": "sms", "token": token})
        assert csv_sms.status_code == 200 and "text/csv" in csv_sms.headers["content-type"] and p["email"] in csv_sms.text
        # admin cannot opt-in sms
        assert requests.patch(f"{API}/admin/leads/{l['id']}", json={"sms_status": "opted_in"}, headers=h).status_code == 422
        r = requests.patch(f"{API}/admin/leads/{l['id']}", json={"email_status": "unsubscribed", "sms_status": "opted_out"}, headers=h).json()
        assert r["email_status"] == "unsubscribed" and r["sms_status"] == "opted_out"
        assert p["email"] not in requests.get(f"{API}/admin/leads/export", params={"type": "sms", "token": token}).text
        assert p["email"] in requests.get(f"{API}/admin/leads/export", params={"type": "all", "token": token}).text
        assert requests.delete(f"{API}/admin/leads/{l['id']}", headers=h).status_code == 200
        assert requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json() == []
        assert p["email"] not in requests.get(f"{API}/admin/leads/export", params={"type": "all", "token": token}).text

    # iteration 2: rejoin after soft-delete restores lead; stats exclude deleted
    def test_rejoin_after_delete_and_stats(self, h, token):
        base = requests.get(f"{API}/admin/stats", headers=h).json()
        p = lead_payload(); created_leads.append(p["email"])
        requests.post(f"{API}/waitlist", json=p, headers=xff())
        assert requests.get(f"{API}/admin/stats", headers=h).json()["total"] == base["total"] + 1
        lid = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()[0]["id"]
        requests.delete(f"{API}/admin/leads/{lid}", headers=h)
        assert requests.get(f"{API}/admin/stats", headers=h).json()["total"] == base["total"]
        r = requests.post(f"{API}/waitlist", json=p, headers=xff())
        assert r.json()["status"] == "updated"
        leads = requests.get(f"{API}/admin/leads", params={"q": p["email"]}, headers=h).json()
        assert len(leads) == 1 and leads[0]["id"] == lid and leads[0]["email_status"] == "subscribed"
        assert p["email"] in requests.get(f"{API}/admin/leads/export", params={"type": "all", "token": token}).text
        assert requests.get(f"{API}/admin/stats", headers=h).json()["total"] == base["total"] + 1

    def test_export_bad_token(self):
        assert requests.get(f"{API}/admin/leads/export", params={"token": "bad"}).status_code == 401


# --- Testimonials
class TestTestimonials:
    def test_public_only_published(self, h):
        pub = requests.get(f"{API}/testimonials").json()
        assert all(t["status"] == "published" for t in pub)
        assert all("permission_confirmed" not in t for t in pub)
        print("published count", len(pub))
        allt = requests.get(f"{API}/admin/testimonials", headers=h).json()
        print("admin total", len(allt), "drafts", sum(t["status"] == "draft" for t in allt))

    def test_crud_and_permission(self, h):
        base = {"kind": "quote", "quote": "TEST_ great", "student_name": "TEST_S", "status": "published", "permission_confirmed": False}
        assert requests.post(f"{API}/admin/testimonials", json=base, headers=h).status_code == 400
        t = requests.post(f"{API}/admin/testimonials", json={**base, "status": "draft"}, headers=h).json()
        assert t["status"] == "draft" and "_id" not in t
        assert requests.put(f"{API}/admin/testimonials/{t['id']}", json=base, headers=h).status_code == 400
        u = requests.put(f"{API}/admin/testimonials/{t['id']}", json={**base, "permission_confirmed": True}, headers=h).json()
        assert u["status"] == "published"
        assert any(x["id"] == t["id"] for x in requests.get(f"{API}/testimonials").json())
        allt = requests.get(f"{API}/admin/testimonials", headers=h).json()
        ids = [x["id"] for x in allt]
        assert requests.post(f"{API}/admin/testimonials/reorder", json={"ids": ids}, headers=h).status_code == 200
        assert requests.delete(f"{API}/admin/testimonials/{t['id']}", headers=h).status_code == 200
        assert not any(x["id"] == t["id"] for x in requests.get(f"{API}/testimonials").json())
        assert not any(x["id"] == t["id"] for x in requests.get(f"{API}/admin/testimonials", headers=h).json())
        assert requests.put(f"{API}/admin/testimonials/nonexistent", json={**base, "status": "draft"}, headers=h).status_code == 404


# --- Site settings
class TestSite:
    def test_toggles(self, h):
        orig = requests.get(f"{API}/admin/settings", headers=h).json()
        try:
            requests.put(f"{API}/admin/settings", json={"price": "$TEST", "show_price": False, "webhook_url": "", "cohort_dates": "TEST_Mar", "show_cohort_dates": False}, headers=h)
            s = requests.get(f"{API}/site").json()
            assert s["price"] == "" and s["cohort_dates"] == "" and "webhook_url" not in s and "consent" in s
            requests.put(f"{API}/admin/settings", json={"show_price": True, "show_cohort_dates": True}, headers=h)
            s = requests.get(f"{API}/site").json()
            assert s["price"] == "$TEST" and s["cohort_dates"] == "TEST_Mar"
            assert requests.get(f"{API}/admin/settings", headers=h).json()["price"] == "$TEST"
        finally:
            restore = {k: orig.get(k) for k in ("price", "show_price", "cohort_dates", "show_cohort_dates", "webhook_url")}
            requests.put(f"{API}/admin/settings", json=restore, headers=h)


# --- Media / files
class TestMedia:
    def test_upload_and_serve(self, h):
        from PIL import Image
        buf = io.BytesIO(); Image.new("RGB", (1200, 600), (200, 160, 40)).save(buf, "PNG")
        r = requests.post(f"{API}/admin/upload", files={"file": ("TEST_img.png", buf.getvalue(), "image/png")}, data={"folder": "test"}, headers=h, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json(); assert d["width"] == 1200 and d["kind"] == "image"
        f = requests.get(f"{BASE_URL}{d['url']}", timeout=60)
        assert f.status_code == 200 and f.headers["content-type"].startswith("image/") and len(f.content) > 100
        t = requests.get(f"{BASE_URL}{d['thumb_url']}", timeout=60)
        assert t.status_code == 200 and t.headers["content-type"] == "image/jpeg"
        assert any(m["id"] == d["id"] for m in requests.get(f"{API}/admin/media", headers=h).json())
        requests.delete(f"{API}/admin/media/{d['id']}", headers=h)
        assert requests.get(f"{BASE_URL}{d['url']}").status_code == 404

    def test_non_media_rejected(self, h):
        r = requests.post(f"{API}/admin/upload", files={"file": ("a.txt", b"hello", "text/plain")}, headers=h)
        assert r.status_code == 400

    def test_seed_range(self):
        r = requests.get(f"{API}/static/seed/v1.mp4", headers={"Range": "bytes=0-1023"})
        assert r.status_code == 206 and len(r.content) == 1024 and r.headers["content-range"].startswith("bytes 0-1023/")
        assert requests.get(f"{API}/static/seed/../server.py").status_code == 404
        # iteration 2: suffix range returns last N bytes
        r = requests.get(f"{API}/static/seed/v1.mp4", headers={"Range": "bytes=-100"})
        size = int(r.headers["content-range"].split("/")[1])
        assert r.status_code == 206 and len(r.content) == 100 and r.headers["content-range"] == f"bytes {size-100}-{size-1}/{size}"

    # iteration 2: upload folder whitelisted
    def test_upload_folder_whitelist(self, h):
        from PIL import Image
        buf = io.BytesIO(); Image.new("RGB", (50, 50), (1, 2, 3)).save(buf, "PNG")
        d = requests.post(f"{API}/admin/upload", files={"file": ("TEST_w.png", buf.getvalue(), "image/png")}, data={"folder": "../../evil"}, headers=h, timeout=120).json()
        assert d["folder"] == "general" and "evil" not in d["url"]
        requests.delete(f"{API}/admin/media/{d['id']}", headers=h)
