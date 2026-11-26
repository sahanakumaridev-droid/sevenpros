"""Short-lived OTP codes (in-memory; use Redis in production)."""

from __future__ import annotations

import random
import time

_STORE: dict[str, dict] = {}
_TTL_SEC = 600


def issue_otp(key: str) -> str:
    code = f"{random.randint(0, 999999):06d}"
    _STORE[key.lower()] = {"code": code, "expires": time.time() + _TTL_SEC}
    return code


def verify_otp(key: str, code: str) -> bool:
    row = _STORE.get(key.lower())
    if not row:
        return False
    if time.time() > row["expires"]:
        del _STORE[key.lower()]
        return False
    if row["code"] != code.strip():
        return False
    del _STORE[key.lower()]
    return True