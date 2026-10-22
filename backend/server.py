from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
import bcrypt
import jwt

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(sub: str, role: str) -> str:
    # No expiration claim -> token never expires (session must not expire).
    return jwt.encode({"sub": sub, "role": role, "type": "access"}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return jwt.decode(auth_header[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(request: Request) -> dict:
    payload = decode_token(request)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="Admin not found")
    return user


async def get_current_user(request: Request) -> dict:
    payload = decode_token(request)
    if payload.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")
    acc = await db.accounts.find_one({"_id": ObjectId(payload["sub"])})
    if not acc:
        raise HTTPException(status_code=401, detail="Account not found")
    return acc


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginInput(BaseModel):
    identifier: str
    password: str


class DeviceInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    device_name: Optional[str] = None
    model_name: Optional[str] = None
    model_number: Optional[str] = None
    part_number: Optional[str] = None
    color: Optional[str] = None
    ios_version: Optional[str] = None
    build_version: Optional[str] = None
    capacity: Optional[str] = None
    available: Optional[str] = None
    songs: Optional[str] = None
    videos: Optional[str] = None
    photos: Optional[str] = None
    applications: Optional[str] = None
    warranty_status: Optional[str] = None
    coverage_type: Optional[str] = None
    carrier: Optional[str] = None
    carrier_version: Optional[str] = None
    carrier_lock: Optional[str] = None
    serial_number: Optional[str] = None
    imei: Optional[str] = None
    imei2: Optional[str] = None
    meid: Optional[str] = None
    iccid: Optional[str] = None
    eid: Optional[str] = None
    seeid: Optional[str] = None
    modem_firmware: Optional[str] = None
    wifi_address: Optional[str] = None
    bluetooth: Optional[str] = None
    certificate_trust_store: Optional[str] = None
    region: Optional[str] = None
    purchase_date: Optional[str] = None
    activation_status: Optional[str] = None
    find_my_iphone: Optional[str] = None
    icloud_lock: Optional[str] = None
    blacklist_status: Optional[str] = None
    battery_max_capacity: Optional[str] = None
    battery_charge_cycles: Optional[str] = None


class AccountCreate(BaseModel):
    username: str
    password: str
    label: Optional[str] = None
    device: Optional[DeviceInput] = None


class AccountUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    label: Optional[str] = None
    device: Optional[DeviceInput] = None


DEFAULT_DEVICE = {
    "device_name": "iPhone",
    "model_name": "iPhone 16 Pro Max",
    "model_number": "MYWX3LL/A",
    "part_number": "MYWX3ID/A",
    "color": "Desert Titanium",
    "ios_version": "18.5",
    "build_version": "22F76",
    "capacity": "256 GB",
    "available": "128.4 GB",
    "songs": "1,204",
    "videos": "86",
    "photos": "9,431",
    "applications": "142",
    "warranty_status": "AppleCare+ — expires 12 Aug 2026",
    "coverage_type": "AppleCare+ Coverage",
    "carrier": "Telkomsel",
    "carrier_version": "60.2",
    "carrier_lock": "No SIM restrictions",
    "serial_number": "F2LWX3K9Q1MN",
    "imei": "356789104532198",
    "imei2": "356789104532206",
    "meid": "35678910453219",
    "iccid": "8962011512345678901F",
    "eid": "89049032004008882600033501234567",
    "seeid": "04A1B2C3D4E5F6",
    "modem_firmware": "2.80.06",
    "wifi_address": "A4:83:E7:2C:9F:1B",
    "bluetooth": "A4:83:E7:2C:9F:1C",
    "certificate_trust_store": "2024082700",
    "region": "Indonesia (ID)",
    "purchase_date": "12 Aug 2024",
    "activation_status": "Activated",
    "find_my_iphone": "On",
    "icloud_lock": "Clean",
    "blacklist_status": "Clean",
    "battery_max_capacity": "98%",
    "battery_charge_cycles": "142",
}


def serialize_account(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "label": doc.get("label", ""),
        "device": doc.get("device", {}),
        "created_at": doc.get("created_at"),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "iPhone Settings Simulator API"}


@api_router.post("/auth/login")
async def login(body: LoginInput):
    ident = body.identifier.strip().lower()
    admin = await db.users.find_one({"email": ident})
    if admin and verify_password(body.password, admin["password_hash"]):
        return {
            "token": create_token(str(admin["_id"]), "admin"),
            "role": "admin",
            "email": admin["email"],
            "name": admin.get("name", "Admin"),
        }
    acc = await db.accounts.find_one({"username": ident})
    if acc and verify_password(body.password, acc["password_hash"]):
        return {
            "token": create_token(str(acc["_id"]), "user"),
            "role": "user",
            "username": acc["username"],
            "label": acc.get("label", ""),
        }
    raise HTTPException(status_code=401, detail="Username/email atau password salah")


@api_router.get("/auth/me")
async def me(request: Request):
    payload = decode_token(request)
    role = payload.get("role")
    if role == "admin":
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Admin not found")
        return {"role": "admin", "email": user["email"], "name": user.get("name", "Admin")}
    if role == "user":
        acc = await db.accounts.find_one({"_id": ObjectId(payload["sub"])})
        if not acc:
            raise HTTPException(status_code=401, detail="Account not found")
        return {"role": "user", "username": acc["username"], "label": acc.get("label", "")}
    raise HTTPException(status_code=401, detail="Invalid token")


# ---- Admin: manage accounts (one account per iPhone device) ----
@api_router.get("/admin/accounts")
async def list_accounts(admin: dict = Depends(get_current_admin)):
    docs = await db.accounts.find({}).to_list(500)
    return [serialize_account(d) for d in docs]


@api_router.post("/admin/accounts")
async def create_account(body: AccountCreate, admin: dict = Depends(get_current_admin)):
    username = body.username.strip().lower()
    if not username or not body.password:
        raise HTTPException(status_code=400, detail="Username & password wajib diisi")
    if await db.accounts.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username sudah dipakai")
    device = dict(DEFAULT_DEVICE)
    if body.device:
        device.update({k: v for k, v in body.device.model_dump().items() if v is not None})
    doc = {
        "username": username,
        "password_hash": hash_password(body.password),
        "label": body.label or username,
        "device": device,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.accounts.insert_one(doc)
    return serialize_account(await db.accounts.find_one({"_id": res.inserted_id}))


@api_router.put("/admin/accounts/{account_id}")
async def update_account(account_id: str, body: AccountUpdate, admin: dict = Depends(get_current_admin)):
    updates = {}
    if body.username is not None:
        u = body.username.strip().lower()
        clash = await db.accounts.find_one({"username": u, "_id": {"$ne": ObjectId(account_id)}})
        if clash:
            raise HTTPException(status_code=400, detail="Username sudah dipakai")
        updates["username"] = u
    if body.label is not None:
        updates["label"] = body.label
    if body.password:
        updates["password_hash"] = hash_password(body.password)
    if body.device is not None:
        for k, v in body.device.model_dump().items():
            if v is not None:
                updates[f"device.{k}"] = v
    if updates:
        await db.accounts.update_one({"_id": ObjectId(account_id)}, {"$set": updates})
    doc = await db.accounts.find_one({"_id": ObjectId(account_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Account not found")
    return serialize_account(doc)


@api_router.delete("/admin/accounts/{account_id}")
async def delete_account(account_id: str, admin: dict = Depends(get_current_admin)):
    await db.accounts.delete_one({"_id": ObjectId(account_id)})
    return {"deleted": True}


# ---- User: read/update ONLY their own device ----
@api_router.get("/me/device")
async def get_my_device(request: Request):
    acc = await get_current_user(request)
    return acc.get("device", {})


@api_router.put("/me/device")
async def update_my_device(body: DeviceInput, request: Request):
    acc = await get_current_user(request)
    updates = {f"device.{k}": v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.accounts.update_one({"_id": acc["_id"]}, {"$set": updates})
    doc = await db.accounts.find_one({"_id": acc["_id"]})
    return doc.get("device", {})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@iphone.local").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed one demo user account so login works out of the box
    if await db.accounts.count_documents({}) == 0:
        await db.accounts.insert_one({
            "username": "user1",
            "password_hash": hash_password("user123"),
            "label": "Andi's iPhone",
            "device": dict(DEFAULT_DEVICE),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded demo account user1")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
