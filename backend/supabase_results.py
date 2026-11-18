"""
Shared Supabase REST persistence for the four separate assessment tables:
  - sebis_results
  - pmt_results
  - tpb_results
  - ttat_results
"""

import os
import time
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

TIMEOUT = httpx.Timeout(30.0, connect=15.0)


def _headers(extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    if not SUPABASE_URL or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def _request_with_retry(method: str, url: str, **kwargs) -> httpx.Response:
    last_exc = None
    for attempt in range(3):
        try:
            with httpx.Client(timeout=TIMEOUT, trust_env=False) as client:
                return client.request(method, url, **kwargs)
        except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.ConnectError) as exc:
            last_exc = exc
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Could not reach Supabase after 3 attempts: {last_exc}") from last_exc


def _row_to_record(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "assessment_id": row["assessment_id"],
        "user_id": row["user_id"],
        "timestamp": row.get("created_at") or "",
        "answers": row["answers"],
        "profile": row["profile"],
    }


def save_assessment_result(
    table_name: str,
    user_id: str,
    answers: Dict[str, int],
    profile: Dict[str, Any],
    assessment_id: Optional[str] = None,
    extra_columns: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    if assessment_id is None:
        assessment_id = f"{user_id}_{timestamp}"

    payload: Dict[str, Any] = {
        "assessment_id": assessment_id,
        "user_id": user_id,
        "overall_score": profile["overall_score"],
        "overall_level": profile["overall_level"],
        "weakest_area": profile["weakest_area"],
        "answers": answers,
        "profile": profile,
    }
    if extra_columns:
        payload.update(extra_columns)

    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    res = _request_with_retry(
        "POST",
        url,
        headers=_headers({"Prefer": "return=representation"}),
        json=payload,
    )
    if res.status_code >= 400:
        raise RuntimeError(f"Supabase insert into {table_name} failed ({res.status_code}): {res.text}")

    rows = res.json()
    saved_row = rows[0] if isinstance(rows, list) and rows else payload
    return _row_to_record(saved_row)


def get_latest_assessment_result(table_name: str, user_id: str) -> Optional[Dict[str, Any]]:
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    params = {
        "user_id": f"eq.{user_id}",
        "select": "assessment_id,user_id,answers,profile,created_at",
        "order": "created_at.desc",
        "limit": "1",
    }
    res = _request_with_retry("GET", url, params=params, headers=_headers())
    if res.status_code >= 400:
        raise RuntimeError(f"Supabase query on {table_name} failed ({res.status_code}): {res.text}")

    rows = res.json()
    if not rows:
        return None
    return _row_to_record(rows[0])


def get_assessment_result_by_id(table_name: str, assessment_id: str) -> Optional[Dict[str, Any]]:
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    params = {
        "assessment_id": f"eq.{assessment_id}",
        "select": "assessment_id,user_id,answers,profile,created_at",
        "limit": "1",
    }
    res = _request_with_retry("GET", url, params=params, headers=_headers())
    if res.status_code >= 400:
        raise RuntimeError(f"Supabase query on {table_name} failed ({res.status_code}): {res.text}")

    rows = res.json()
    if not rows:
        return None
    return _row_to_record(rows[0])