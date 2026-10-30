from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Query
from fastapi.responses import Response, StreamingResponse
from fastapi.concurrency import run_in_threadpool
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from pathlib import Path
from datetime import datetime, timezone, timedelta
from collections import defaultdict, OrderedDict
import os, io, re, csv, uuid, time, logging, asyncio
import bcrypt, jwt, requests, httpx
from PIL import Image

from content_defaults import DEFAULT_SETTINGS, SEED_TESTIMONIALS, EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT, CONSENT_VERSION

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("goldhouse")

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].strip().lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
JWT_HOURS = 12

app = FastAPI(title="Gold House Trading API")


@app.get("/health", include_in_schema=False)
@app.head("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}

api = APIRouter(prefix="/api")
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean(doc: Optional[dict]) -> Optional[dict]:
    if doc is None:
        return None
    doc = dict(doc)
    doc.pop("_id", None)
    return doc

# ---------------------------------------------------------------- rate limiting
_hits: dict = defaultdict(list)


def rate_limit(request: Request, bucket: str, limit: int, window: int = 600):
    # last hop is appended by our ingress and can't be spoofed by the client
    xff = [x.strip() for x in (request.headers.get("x-forwarded-for") or "").split(",") if x.strip()]
    ip = request.headers.get("cf-connecting-ip") or (xff[-3] if len(xff) >= 3 else (xff[0] if xff else (request.client.host if request.client else "?")))
    key = f"{bucket}:{ip}"
    t = time.time()
    _hits[key] = [x for x in _hits[key] if t - x < window]
    if len(_hits[key]) >= limit:
        raise HTTPException(429, "Too many attempts. Please wait a few minutes and try again.")
    _hits[key].append(t)
    return ip

# ---------------------------------------------------------------- auth


def make_token(email: str) -> str:
    n = datetime.now(timezone.utc)
    return jwt.encode({"sub": email, "role": "admin", "iat": n, "exp": n + timedelta(hours=JWT_HOURS)}, JWT_SECRET, algorithm="HS256")


async def verify_token(token: Optional[str]) -> str:
    err = HTTPException(401, "Please sign in again.", headers={"WWW-Authenticate": "Bearer"})
    if not token:
        raise err
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise err
    if payload.get("role") != "admin":
        raise err
    if not await db.admins.find_one({"email": payload.get("sub")}, {"_id": 1}):
        raise err
    return payload["sub"]


async def current_admin(token: Optional[str] = Depends(oauth2)) -> str:
    return await verify_token(token)


class LoginIn(BaseModel):
    email: str
    password: str


@api.post("/auth/login")
async def login(body: LoginIn, request: Request):
    rate_limit(request, "login", 10)
    email = body.email.strip().lower()
    rec = await db.admins.find_one({"email": email})
    ok = rec is not None and bcrypt.checkpw(body.password.encode(), rec["password_hash"].encode())
    if not ok:
        raise HTTPException(401, "Incorrect email or password.")
    return {"access_token": make_token(email), "token_type": "bearer", "email": email}


@api.get("/auth/me")
async def me(admin: str = Depends(current_admin)):
    return {"email": admin}


class PasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=10)


@api.post("/auth/password")
async def change_password(body: PasswordIn, admin: str = Depends(current_admin)):
    rec = await db.admins.find_one({"email": admin})
    if not bcrypt.checkpw(body.current_password.encode(), rec["password_hash"].encode()):
        raise HTTPException(400, "Current password is incorrect.")
    h = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    await db.admins.update_one({"email": admin}, {"$set": {"password_hash": h, "updated_at": now_iso()}})
    return {"ok": True}

# ---------------------------------------------------------------- object storage
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "gold-house-trading"
_storage_key = None
_file_cache: "OrderedDict[str, tuple]" = OrderedDict()


def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    r.raise_for_status()
    _storage_key = r.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    global _storage_key
    for attempt in range(2):
        key = init_storage()
        r = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=180)
        if r.status_code == 503 and attempt == 0:
            _storage_key = None
            continue
        if r.status_code == 402:
            raise HTTPException(402, "Storage credits are exhausted. Please top up your balance and try again.")
        r.raise_for_status()
        return r.json()


def get_object(path: str):
    global _storage_key
    for attempt in range(2):
        key = init_storage()
        r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
        if r.status_code == 503 and attempt == 0:
            _storage_key = None
            continue
        r.raise_for_status()
        return r.content, r.headers.get("Content-Type", "application/octet-stream")


@api.post("/admin/upload")
async def upload(file: UploadFile = File(...), folder: str = Form("general"), admin: str = Depends(current_admin)):
    if folder not in {"general", "headshots", "lifestyle", "students", "brand"}:
        folder = "general"
    data = await file.read()
    ctype = file.content_type or "application/octet-stream"
    if len(data) > 150 * 1024 * 1024:
        raise HTTPException(413, "File is too large (150 MB max).")
    is_image = ctype.startswith("image/")
    is_video = ctype.startswith("video/") or (file.filename or "").lower().endswith((".mov", ".mp4", ".m4v"))
    if not (is_image or is_video):
        raise HTTPException(400, "Please upload an image or a video.")
    ext = (file.filename or "file").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ("jpg" if is_image else "mp4")
    mid = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{folder}/{mid}.{ext}"
    width = height = None
    thumb_path = None
    if is_image:
        try:
            im = Image.open(io.BytesIO(data))
            width, height = im.size
            # lightweight version for fast mobile loading; original kept for the lightbox
            t = im.convert("RGB")
            if t.width > 1000:
                t = t.resize((1000, int(t.height * 1000 / t.width)), Image.LANCZOS)
            buf = io.BytesIO()
            t.save(buf, "JPEG", quality=82, optimize=True)
            thumb_path = f"{APP_NAME}/uploads/{folder}/{mid}_web.jpg"
            await run_in_threadpool(put_object, thumb_path, buf.getvalue(), "image/jpeg")
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"thumbnail failed: {e}")
    if is_video and ext == "mov":
        ctype = "video/quicktime"
    res = await run_in_threadpool(put_object, path, data, ctype)
    doc = {
        "id": mid, "kind": "image" if is_image else "video", "folder": folder,
        "filename": file.filename, "content_type": ctype, "size": len(data),
        "path": res["path"], "thumb_path": thumb_path,
        "url": f"/api/files/{res['path']}",
        "thumb_url": f"/api/files/{thumb_path}" if thumb_path else f"/api/files/{res['path']}",
        "width": width, "height": height, "is_deleted": False, "created_at": now_iso(),
    }
    await db.media.insert_one(dict(doc))
    return doc


@api.get("/files/{path:path}")
async def serve_file(path: str):
    # Website media (photos, published screenshots) are public assets by design.
    rec = await db.media.find_one({"$or": [{"path": path}, {"thumb_path": path}], "is_deleted": False}, {"_id": 0, "content_type": 1, "path": 1})
    if not rec:
        raise HTTPException(404, "Not found")
    if path in _file_cache:
        data, ctype = _file_cache[path]
        _file_cache.move_to_end(path)
    else:
        try:
            data, ctype = await run_in_threadpool(get_object, path)
        except Exception:
            raise HTTPException(404, "Not found")
        if len(data) < 8 * 1024 * 1024:
            _file_cache[path] = (data, ctype)
            while len(_file_cache) > 60:
                _file_cache.popitem(last=False)
    return Response(content=data, media_type=ctype, headers={"Cache-Control": "public, max-age=86400"})


@api.get("/admin/media")
async def list_media(folder: Optional[str] = None, admin: str = Depends(current_admin)):
    q = {"is_deleted": False}
    if folder:
        q["folder"] = folder
    return [clean(d) for d in await db.media.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)]


class MediaPatch(BaseModel):
    folder: str


@api.patch("/admin/media/{mid}")
async def move_media(mid: str, body: MediaPatch, admin: str = Depends(current_admin)):
    await db.media.update_one({"id": mid}, {"$set": {"folder": body.folder}})
    return {"ok": True}


@api.delete("/admin/media/{mid}")
async def delete_media(mid: str, admin: str = Depends(current_admin)):
    await db.media.update_one({"id": mid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------------------------------------------------------------- site settings
PRIVATE_SETTINGS = {"webhook_url"}


async def get_settings() -> dict:
    doc = await db.settings.find_one({"key": "site"}, {"_id": 0})
    merged = {**DEFAULT_SETTINGS, **(doc or {})}
    merged["legal"] = {**DEFAULT_SETTINGS["legal"], **(doc or {}).get("legal", {})}
    return merged


@api.get("/site")
async def public_site():
    s = await get_settings()
    out = {k: v for k, v in s.items() if k not in PRIVATE_SETTINGS and k != "key"}
    if not s.get("show_price"):
        out["price"] = ""
        out["price_note"] = ""
    if not s.get("show_price") or not s.get("show_payment_plan"):
        out["payment_plan"] = ""
    if not s.get("show_cohort_dates"):
        out["cohort_dates"] = ""
    if not s.get("show_announcement"):
        out["announcement"] = ""
    if not s.get("featured_published"):
        out["featured_quote"] = ""
        out["featured_name"] = ""
    out["consent"] = {"email": EMAIL_CONSENT_TEXT, "sms": SMS_CONSENT_TEXT, "version": CONSENT_VERSION}
    return out


@api.get("/admin/settings")
async def admin_settings(admin: str = Depends(current_admin)):
    s = await get_settings()
    s.pop("key", None)
    return s


@api.put("/admin/settings")
async def update_settings(body: dict, admin: str = Depends(current_admin)):
    allowed = set(DEFAULT_SETTINGS.keys())
    upd = {k: v for k, v in body.items() if k in allowed}
    for k, v in list(upd.items()):
        if isinstance(DEFAULT_SETTINGS[k], bool):
            upd[k] = v is True
    upd["updated_at"] = now_iso()
    await db.settings.update_one({"key": "site"}, {"$set": upd}, upsert=True)
    return await admin_settings(admin)

# ---------------------------------------------------------------- testimonials


class TestimonialIn(BaseModel):
    kind: Literal["image", "video", "quote"] = "image"
    category: Literal["trading", "testimonial", "progress"] = "testimonial"
    media_url: str = ""
    thumb_url: str = ""
    width: Optional[int] = None
    height: Optional[int] = None
    caption: str = ""
    student_name: str = ""
    quote: str = ""
    description: str = ""
    featured: bool = False
    highlighted: bool = False
    status: Literal["draft", "published"] = "draft"
    permission_confirmed: bool = False


def check_publishable(t: dict):
    if t.get("status") == "published":
        if not t.get("permission_confirmed"):
            raise HTTPException(400, "Please confirm you have the student's permission before publishing.")
        if t.get("kind") in ("image", "video") and not t.get("media_url"):
            raise HTTPException(400, "Please attach a screenshot or video before publishing.")
        if t.get("kind") == "quote" and not t.get("quote", "").strip():
            raise HTTPException(400, "Please add the student's quote before publishing.")


@api.get("/testimonials")
async def public_testimonials():
    docs = await db.testimonials.find({"status": "published"}, {"_id": 0, "permission_confirmed": 0}).sort([("featured", -1), ("order", 1)]).to_list(500)
    return docs


@api.get("/admin/testimonials")
async def admin_testimonials(admin: str = Depends(current_admin)):
    return await db.testimonials.find({"deleted": {"$ne": True}}, {"_id": 0}).sort("order", 1).to_list(1000)


@api.post("/admin/testimonials")
async def create_testimonial(body: TestimonialIn, admin: str = Depends(current_admin)):
    doc = body.model_dump()
    check_publishable(doc)
    first = await db.testimonials.find_one({}, {"order": 1}, sort=[("order", 1)])
    doc.update({"id": str(uuid.uuid4()), "order": (first["order"] - 1) if first else 0, "created_at": now_iso(), "updated_at": now_iso()})
    await db.testimonials.insert_one(dict(doc))
    return clean(doc)


@api.put("/admin/testimonials/{tid}")
async def update_testimonial(tid: str, body: TestimonialIn, admin: str = Depends(current_admin)):
    doc = body.model_dump()
    check_publishable(doc)
    doc["updated_at"] = now_iso()
    r = await db.testimonials.update_one({"id": tid}, {"$set": doc})
    if not r.matched_count:
        raise HTTPException(404, "Not found")
    return clean(await db.testimonials.find_one({"id": tid}, {"_id": 0}))


@api.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin: str = Depends(current_admin)):
    await db.testimonials.update_one({"id": tid}, {"$set": {"deleted": True, "status": "draft", "updated_at": now_iso()}})
    return {"ok": True}


class ReorderIn(BaseModel):
    ids: List[str]


@api.post("/admin/testimonials/reorder")
async def reorder(body: ReorderIn, admin: str = Depends(current_admin)):
    for i, tid in enumerate(body.ids):
        await db.testimonials.update_one({"id": tid}, {"$set": {"order": i}})
    return {"ok": True}

# ---------------------------------------------------------------- waitlist / leads
EXPERIENCE = ["Completely new", "I've started learning", "I've traded before", "I'm actively trading"]


def normalize_phone(raw: str) -> Optional[str]:
    raw = (raw or "").strip()
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if raw.startswith("+"):
        if 8 <= len(digits) <= 15:
            return "+" + digits
        return "invalid"
    if len(digits) == 10:
        return "+1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return "invalid"


class WaitlistIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    experience: str
    email_consent: bool
    sms_consent: bool = False
    source_page: str = Field(default="/", max_length=200)
    referred_by: str = Field(default="", max_length=120)
    website: str = ""  # honeypot – must stay empty


async def send_webhook(url: str, payload: dict):
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(url, json=payload)
    except Exception as e:
        logger.warning(f"webhook failed: {e}")


@api.post("/waitlist")
async def join_waitlist(body: WaitlistIn, request: Request):
    ip = rate_limit(request, "waitlist", 6)
    if body.website.strip():
        return {"status": "created"}  # silently drop bots
    if not body.first_name.strip():
        raise HTTPException(422, "Please enter your first name.")
    if body.experience not in EXPERIENCE:
        raise HTTPException(422, "Please choose your trading experience.")
    if not body.email_consent:
        raise HTTPException(422, "Please agree to the Privacy Policy to join the waitlist.")
    phone = normalize_phone(body.phone)
    if not phone:
        raise HTTPException(422, "Please enter your mobile number.")
    if phone == "invalid":
        raise HTTPException(422, "Please enter a valid mobile number (US numbers: 10 digits).")
    if body.sms_consent and not phone:
        raise HTTPException(422, "Please add your mobile number to receive text updates, or uncheck the text option.")

    ts = now_iso()
    email = body.email.strip().lower()
    ua = request.headers.get("user-agent", "")[:300]
    log = [{"channel": "email", "action": "opt_in", "text": EMAIL_CONSENT_TEXT, "version": CONSENT_VERSION,
            "timestamp": ts, "source_page": body.source_page, "ip": ip, "user_agent": ua}]
    if body.sms_consent and phone:
        log.append({"channel": "sms", "action": "opt_in", "text": SMS_CONSENT_TEXT, "version": CONSENT_VERSION,
                    "timestamp": ts, "source_page": body.source_page, "ip": ip, "user_agent": ua, "phone": phone})

    existing = await db.leads.find_one({"email": email})
    upd = {"first_name": body.first_name.strip(), "experience": body.experience, "updated_at": ts,
           "email_status": "subscribed", "email_consent_at": ts, "deleted": False}
    if body.last_name.strip():
        upd["last_name"] = body.last_name.strip()
    if phone:
        upd["phone"] = phone
    if body.referred_by.strip():
        upd["referred_by"] = body.referred_by.strip()
    if body.sms_consent and phone:
        upd.update({"sms_status": "opted_in", "sms_consent_at": ts, "sms_phone": phone})

    if existing:
        await db.leads.update_one({"email": email}, {"$set": upd, "$push": {"consent_log": {"$each": log}}, "$inc": {"submissions": 1}})
        status = "updated"
    else:
        doc = {"id": str(uuid.uuid4()), "email": email, "last_name": "", "phone": "", "sms_status": "none",
               "sms_consent_at": None, "created_at": ts, "submissions": 1, "source_page": body.source_page,
               "consent_log": log, **upd}
        try:
            await db.leads.insert_one(doc)
            status = "created"
        except Exception:
            await db.leads.update_one({"email": email}, {"$set": upd, "$push": {"consent_log": {"$each": log}}})
            status = "updated"

    s = await get_settings()
    if s.get("webhook_url"):
        lead = await db.leads.find_one({"email": email}, {"_id": 0, "consent_log": 0})
        asyncio.create_task(send_webhook(s["webhook_url"], {"event": f"waitlist.{status}", "lead": lead}))
    return {"status": status}


@api.get("/admin/leads")
async def list_leads(q: str = "", experience: str = "", email_status: str = "", sms_status: str = "", admin: str = Depends(current_admin)):
    return await db.leads.find(lead_query(q, experience, email_status, sms_status), {"_id": 0}).sort("created_at", -1).to_list(5000)


def lead_query(q, experience, email_status, sms_status):
    query: dict = {"deleted": {"$ne": True}}
    if q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        digits = re.sub(r"\D", "", q)
        ors = [{"first_name": rx}, {"last_name": rx}, {"email": rx}, {"phone": rx}, {"referred_by": rx}]
        if len(digits) >= 3:
            ors.append({"phone": {"$regex": digits}})
        query["$or"] = ors
    if experience:
        query["experience"] = experience
    if email_status:
        query["email_status"] = email_status
    if sms_status:
        query["sms_status"] = sms_status
    return query


@api.get("/admin/stats")
async def stats(admin: str = Depends(current_admin)):
    week = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    return {
        "total": await db.leads.count_documents({"deleted": {"$ne": True}}),
        "email_subscribed": await db.leads.count_documents({"email_status": "subscribed", "deleted": {"$ne": True}}),
        "sms_opted_in": await db.leads.count_documents({"sms_status": "opted_in", "deleted": {"$ne": True}}),
        "last_7_days": await db.leads.count_documents({"created_at": {"$gte": week}, "deleted": {"$ne": True}}),
        "testimonials_published": await db.testimonials.count_documents({"status": "published", "deleted": {"$ne": True}}),
        "testimonials_draft": await db.testimonials.count_documents({"status": "draft", "deleted": {"$ne": True}}),
    }


class LeadPatch(BaseModel):
    email_status: Optional[Literal["subscribed", "unsubscribed"]] = None
    sms_status: Optional[Literal["opted_out"]] = None  # admins can opt out, never opt in


@api.patch("/admin/leads/{lid}")
async def patch_lead(lid: str, body: LeadPatch, admin: str = Depends(current_admin)):
    lead = await db.leads.find_one({"id": lid})
    if not lead:
        raise HTTPException(404, "Not found")
    ts = now_iso()
    upd, log = {"updated_at": ts}, []
    if body.email_status == "unsubscribed":
        upd["email_status"] = "unsubscribed"
        log.append({"channel": "email", "action": "opt_out", "timestamp": ts, "source_page": "admin", "by": admin})
    elif body.email_status == "subscribed" and lead.get("email_status") != "unsubscribed":
        upd["email_status"] = "subscribed"
    if body.sms_status == "opted_out":
        upd["sms_status"] = "opted_out"
        log.append({"channel": "sms", "action": "opt_out", "timestamp": ts, "source_page": "admin", "by": admin})
    op = {"$set": upd}
    if log:
        op["$push"] = {"consent_log": {"$each": log}}
    await db.leads.update_one({"id": lid}, op)
    return clean(await db.leads.find_one({"id": lid}, {"_id": 0}))


@api.delete("/admin/leads/{lid}")
async def delete_lead(lid: str, admin: str = Depends(current_admin)):
    ts = now_iso()
    await db.leads.update_one({"id": lid}, {"$set": {"deleted": True, "email_status": "unsubscribed", "sms_status": "opted_out", "updated_at": ts},
                                            "$push": {"consent_log": {"channel": "all", "action": "removed_by_admin", "timestamp": ts, "by": admin}}})
    return {"ok": True}


@api.get("/admin/leads/export")
async def export_leads(type: str = "all", token: str = Query(""), bearer: Optional[str] = Depends(oauth2)):
    await verify_token(bearer or token)
    query = {"sms_status": "opted_in", "deleted": {"$ne": True}} if type == "sms" else {"deleted": {"$ne": True}}
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", 1).to_list(20000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["first_name", "last_name", "email", "phone_e164", "experience", "email_status", "email_consent_at",
                "sms_status", "sms_consent_at", "consent_version", "referred_by", "source_page", "created_at", "updated_at"])
    for l in leads:
        version = next((c.get("version") for c in reversed(l.get("consent_log", [])) if c.get("version")), "")
        w.writerow([l.get("first_name", ""), l.get("last_name", ""), l.get("email", ""),
                    (l.get("sms_phone") or l.get("phone", "")) if type == "sms" else l.get("phone", ""),
                    l.get("experience", ""), l.get("email_status", ""), l.get("email_consent_at", ""),
                    l.get("sms_status", ""), l.get("sms_consent_at") or "", version, l.get("referred_by", ""), l.get("source_page", ""),
                    l.get("created_at", ""), l.get("updated_at", "")])
    name = "goldhouse-sms-opted-in.csv" if type == "sms" else "goldhouse-waitlist.csv"
    return Response(content=buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{name}"'})


app.include_router(api)
SEED_DIR = ROOT_DIR / "static" / "seed"


@app.get("/api/static/seed/{name}")
async def seed_media(name: str, request: Request):
    # Range-aware file serving so iPhone Safari can stream the testimonial videos.
    if "/" in name or ".." in name:
        raise HTTPException(404, "Not found")
    path = SEED_DIR / name
    if not path.is_file():
        raise HTTPException(404, "Not found")
    ctype = "video/mp4" if name.endswith(".mp4") else "image/jpeg"
    size = path.stat().st_size
    rng = request.headers.get("range")
    headers = {"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400"}
    if rng and rng.startswith("bytes="):
        s, _, e = rng[6:].partition("-")
        if not (s.isdigit() or s == "") or not (e.isdigit() or e == "") or (s and int(s) >= size):
            return Response(status_code=416, headers={"Content-Range": f"bytes */{size}"})
        if not s:  # suffix range: last N bytes
            start, end = max(0, size - int(e or 0)), size - 1
        else:
            start, end = int(s), min(int(e) if e else size - 1, size - 1)
        with open(path, "rb") as f:
            f.seek(start)
            data = f.read(end - start + 1)
        headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        return Response(content=data, status_code=206, media_type=ctype, headers=headers)
    return Response(content=path.read_bytes(), media_type=ctype, headers=headers)
app.add_middleware(CORSMiddleware, allow_credentials=False, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    await db.leads.create_index("email", unique=True)
    await db.leads.create_index("id", unique=True)
    await db.admins.create_index("email", unique=True)
    await db.testimonials.create_index("id", unique=True)
    await db.media.create_index("path")
    await db.admins.update_one(
        {"email": ADMIN_EMAIL},
        {"$setOnInsert": {"email": ADMIN_EMAIL, "role": "admin", "created_at": now_iso(),
                          "password_hash": bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode()}},
        upsert=True)
    for i, t in enumerate(SEED_TESTIMONIALS):
        doc = {"id": str(uuid.uuid4()), "order": i, "created_at": now_iso(), "updated_at": now_iso(),
               "thumb_url": t.get("media_url", ""), "student_name": "", "quote": "", "description": "",
               "featured": False, "highlighted": False, "permission_confirmed": True, **t}
        await db.testimonials.update_one({"seed_key": t["seed_key"]}, {"$setOnInsert": doc}, upsert=True)
    try:
        await run_in_threadpool(init_storage)
        logger.info("Object storage ready")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
