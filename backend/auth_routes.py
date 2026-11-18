import os
import re
from typing import Optional

import dns.resolver
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Header
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

import training_drill

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
EMAIL_REPUTATION_API_KEY = os.getenv("EMAIL_REPUTATION_API_KEY", "").strip()

router = APIRouter(prefix="/api")

EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

BLOCKED_DOMAINS = {
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "fake.com",
    "invalid.com",
    "mailinator.com",
    "tempmail.com",
    "temp-mail.org",
    "guerrillamail.com",
    "10minutemail.com",
    "yopmail.com",
    "throwawaymail.com",
    "trashmail.com",
    "getnada.com",
    "sharklasers.com",
}


async def is_authentic_email(email: str) -> bool:
    """Checks syntax, blocks fake domains, verifies DNS MX, and verifies mailbox deliverability."""
    if not email or not EMAIL_PATTERN.match(email):
        return False

    domain = email.rsplit("@", 1)[1].lower().strip()
    if domain in BLOCKED_DOMAINS:
        return False

    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 3.0
        resolver.lifetime = 3.0
        answers = resolver.resolve(domain, "MX")
        if len(answers) == 0:
            return False
    except Exception:
        return False

    if EMAIL_REPUTATION_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=8.0, trust_env=False) as client:
                resp = await client.get(
                    "https://emailreputation.abstractapi.com/v1/",
                    params={"api_key": EMAIL_REPUTATION_API_KEY, "email": email},
                )
            if resp.status_code == 200:
                data = resp.json()
                deliverability = data.get("email_deliverability", {})
                quality = data.get("email_quality", {})

                status = str(deliverability.get("status", "")).lower()
                is_disposable = quality.get("is_disposable", False)

                if status != "deliverable" or is_disposable:
                    return False
        except httpx.RequestError:
            pass

    return True


def ok(data: dict, status_code: int = 200):
    return JSONResponse(status_code=status_code, content={"success": True, "data": data})


def fail(status_code: int, code: str, message: str, fields: Optional[dict] = None):
    err = {"code": code, "message": message}
    if fields:
        err["fields"] = fields
    return JSONResponse(status_code=status_code, content={"success": False, "error": err})


def to_api_session(session: Optional[dict]):
    if not session:
        return None
    return {
        "accessToken": session.get("access_token"),
        "refreshToken": session.get("refresh_token"),
        "tokenType": session.get("token_type", "bearer"),
        "expiresIn": session.get("expires_in"),
        "expiresAt": session.get("expires_at"),
    }


def to_api_profile(row: dict):
    return {
        "id": row.get("id"),
        "name": row.get("full_name"),
        "email": row.get("email"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def _anon_headers(bearer: Optional[str] = None):
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    if bearer:
        headers["Authorization"] = f"Bearer {bearer}"
    return headers


async def _fetch_profile(access_token: str, user_id: str):
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {
        "id": f"eq.{user_id}",
        "select": "id,full_name,email,created_at,updated_at",
    }
    headers = {**_anon_headers(access_token), "Accept": "application/vnd.pgrst.object+json"}
    async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
        res = await client.get(url, params=params, headers=headers)
    if res.status_code == 200:
        return res.json(), None
    if res.status_code == 406:
        return None, "NOT_FOUND"
    return None, "DB_ERROR"


async def _verify_token(authorization: Optional[str]):
    if not authorization or not authorization.startswith("Bearer "):
        return None, None, fail(401, "UNAUTHORIZED", "Authentication required.")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None, None, fail(401, "UNAUTHORIZED", "Authentication required.")
    try:
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            res = await client.get(f"{SUPABASE_URL}/auth/v1/user", headers=_anon_headers(token))
        if res.status_code != 200:
            return None, None, fail(401, "UNAUTHORIZED", "Your session is invalid or has expired. Please log in again.")
        return res.json(), token, None
    except httpx.RequestError:
        return None, None, fail(503, "SERVICE_UNAVAILABLE", "The authentication service is unavailable. Please try again shortly.")


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class RefreshBody(BaseModel):
    refreshToken: Optional[str] = None


class ProfileUpdateBody(BaseModel):
    name: Optional[str] = None


@router.get("/auth/verified", response_class=HTMLResponse)
async def email_verified_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f6f9; }
        .card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); text-align: center; max-width: 380px; }
        h2 { color: #16a34a; margin-bottom: 10px; }
        p { color: #4b5563; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card" id="box">
        <h2>Email Verified!</h2>
        <p>Your email address has been confirmed. You can now return to the mobile app and log in.</p>
      </div>
      <script>
        if (window.location.hash.includes("error=")) {
          document.getElementById("box").innerHTML =
            '<h2 style="color:#dc2626;">Link Expired or Already Used</h2>' +
            '<p>This confirmation link has already been used or expired. Try logging in on the mobile app—if your account is already verified, login will work right away.</p>';
        }
      </script>
    </body>
    </html>
    """


@router.post("/auth/register")
async def register(body: RegisterBody):
    clean_name = body.name.strip()
    clean_email = body.email.strip().lower()
    if len(clean_name) < 2:
        return fail(400, "VALIDATION_ERROR", "Name must be at least 2 characters.", {"name": "Name must be at least 2 characters."})
    if not await is_authentic_email(clean_email):
        return fail(400, "INVALID_EMAIL", "Invalid email address", {"email": "Invalid email address"})
    if len(body.password) < 6:
        return fail(400, "VALIDATION_ERROR", "Password must be at least 6 characters.", {"password": "Password must be at least 6 characters."})

    try:
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            res = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers=_anon_headers(),
                json={"email": clean_email, "password": body.password, "data": {"full_name": clean_name}},
            )
        data = res.json()
        if res.status_code >= 400:
            msg = data.get("msg") or data.get("error_description") or data.get("message") or "Registration failed."
            if "invalid" in msg.lower() and "email" in msg.lower():
                return fail(400, "INVALID_EMAIL", "Invalid email address", {"email": "Invalid email address"})
            code = "USER_ALREADY_EXISTS" if "already" in msg.lower() else "AUTH_ERROR"
            return fail(409 if code == "USER_ALREADY_EXISTS" else 400, code, msg)

        user_obj = data.get("user") or data
        identities = user_obj.get("identities")
        if isinstance(identities, list) and len(identities) == 0:
            return fail(409, "USER_ALREADY_EXISTS", "An account with this email already exists.")

        user_id = user_obj.get("id")
        saved_email = user_obj.get("email", clean_email)
        if user_id and saved_email:
            try:
                training_drill.set_contact(user_id, email=saved_email)
            except Exception:
                pass

        session = data.get("session") if "session" in data else (data if data.get("access_token") else None)
        return ok(
            {
                "user": {"id": user_id, "name": clean_name, "email": saved_email},
                "session": to_api_session(session),
                "requiresEmailConfirmation": session is None,
            },
            status_code=201,
        )
    except httpx.RequestError:
        return fail(503, "SERVICE_UNAVAILABLE", "Authentication service unavailable.")


@router.post("/auth/login")
async def login(body: LoginBody):
    clean_email = body.email.strip().lower()
    if not await is_authentic_email(clean_email):
        return fail(400, "INVALID_EMAIL", "Invalid email address", {"email": "Invalid email address"})

    try:
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            res = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers=_anon_headers(),
                json={"email": clean_email, "password": body.password},
            )
        data = res.json()
        if res.status_code >= 400:
            msg = data.get("error_description") or data.get("msg") or "Invalid email or password."
            return fail(401, "INVALID_CREDENTIALS", msg)

        user_raw = data.get("user") or {}
        user = {"id": user_raw.get("id"), "email": user_raw.get("email", clean_email)}
        if user["id"] and user["email"]:
            try:
                training_drill.set_contact(user["id"], email=user["email"])
            except Exception:
                pass

        access_token = data.get("access_token")
        if access_token and user["id"]:
            profile, _ = await _fetch_profile(access_token, user["id"])
            if profile and profile.get("full_name"):
                user["name"] = profile["full_name"]

        return ok({"user": user, "session": to_api_session(data)})
    except httpx.RequestError:
        return fail(503, "SERVICE_UNAVAILABLE", "Authentication service unavailable.")


@router.post("/auth/refresh")
async def refresh(body: RefreshBody):
    if not body.refreshToken:
        return fail(400, "VALIDATION_ERROR", "refreshToken is required.", {"refreshToken": "refreshToken is required."})
    try:
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            res = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=refresh_token",
                headers=_anon_headers(),
                json={"refresh_token": body.refreshToken},
            )
        data = res.json()
        if res.status_code >= 400:
            return fail(401, "UNAUTHORIZED", "Could not refresh session. Please log in again.")
        return ok({"session": to_api_session(data)})
    except httpx.RequestError:
        return fail(503, "SERVICE_UNAVAILABLE", "Authentication service unavailable.")


@router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(default=None)):
    _, token, err = await _verify_token(authorization)
    if err:
        return err
    try:
        async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
            await client.post(
                f"{SUPABASE_URL}/auth/v1/logout?scope=local",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token}",
                },
            )
    except httpx.RequestError:
        pass
    return ok({"message": "Logged out successfully."})


@router.get("/profile")
async def get_profile(authorization: Optional[str] = Header(default=None)):
    user, token, err = await _verify_token(authorization)
    if err:
        return err
    profile, db_err = await _fetch_profile(token, user["id"])
    if db_err == "NOT_FOUND":
        return fail(404, "PROFILE_NOT_FOUND", "Profile not found.")
    if db_err:
        return fail(500, "DATABASE_ERROR", "Could not process your profile request. Please try again.")
    return ok({"profile": to_api_profile(profile)})


@router.patch("/profile")
async def update_profile(body: ProfileUpdateBody, authorization: Optional[str] = Header(default=None)):
    user, token, err = await _verify_token(authorization)
    if err:
        return err
    changes = {}
    if body.name is not None:
        changes["full_name"] = body.name.strip()

    url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {"id": f"eq.{user['id']}", "select": "id,full_name,email,created_at,updated_at"}
    headers = {
        **_anon_headers(token),
        "Prefer": "return=representation",
        "Accept": "application/vnd.pgrst.object+json",
    }
    async with httpx.AsyncClient(timeout=15.0, trust_env=False) as client:
        res = await client.patch(url, params=params, headers=headers, json=changes)
    if res.status_code == 406:
        return fail(404, "PROFILE_NOT_FOUND", "Profile not found.")
    if res.status_code >= 400:
        return fail(500, "DATABASE_ERROR", "Could not process your profile request. Please try again.")
    return ok({"profile": to_api_profile(res.json())})