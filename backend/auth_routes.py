import os
from typing import Optional
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

router = APIRouter(prefix="/api")


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
    async with httpx.AsyncClient(timeout=10.0) as client:
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
        async with httpx.AsyncClient(timeout=10.0) as client:
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


@router.post("/auth/register")
async def register(body: RegisterBody):
    clean_name = body.name.strip()
    clean_email = body.email.strip().lower()
    if len(clean_name) < 2:
        return fail(400, "VALIDATION_ERROR", "Name must be at least 2 characters.", {"name": "Name must be at least 2 characters."})
    if len(body.password) < 6:
        return fail(400, "VALIDATION_ERROR", "Password must be at least 6 characters.", {"password": "Password must be at least 6 characters."})

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers=_anon_headers(),
                json={"email": clean_email, "password": body.password, "data": {"full_name": clean_name}},
            )
        data = res.json()
        if res.status_code >= 400:
            msg = data.get("msg") or data.get("error_description") or data.get("message") or "Registration failed."
            code = "USER_ALREADY_EXISTS" if "already" in msg.lower() else "AUTH_ERROR"
            return fail(409 if code == "USER_ALREADY_EXISTS" else 400, code, msg)

        user_obj = data.get("user") or data
        identities = user_obj.get("identities")
        if isinstance(identities, list) and len(identities) == 0:
            return fail(409, "USER_ALREADY_EXISTS", "An account with this email already exists.")

        session = data.get("session") if "session" in data else (data if data.get("access_token") else None)
        return ok(
            {
                "user": {"id": user_obj.get("id"), "name": clean_name, "email": user_obj.get("email", clean_email)},
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
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
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
        async with httpx.AsyncClient(timeout=10.0) as client:
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
        async with httpx.AsyncClient(timeout=10.0) as client:
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
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.patch(url, params=params, headers=headers, json=changes)
    if res.status_code == 406:
        return fail(404, "PROFILE_NOT_FOUND", "Profile not found.")
    if res.status_code >= 400:
        return fail(500, "DATABASE_ERROR", "Could not process your profile request. Please try again.")
    return ok({"profile": to_api_profile(res.json())})