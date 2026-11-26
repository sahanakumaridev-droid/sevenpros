import json
import os
import re
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.email import send_email
from app.core.otp import issue_otp, verify_otp
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import AuthProvider, User
from app.schemas.user import (
    DemoLoginIn,
    EmailLoginVerify,
    LoginEmail,
    PhoneOtpRequest,
    PhoneOtpVerify,
    CompanyRegisterIn,
    SignupEmail,
    TokenOut,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

_EMAIL_OTP_KEY = "email:{email}"
_PHONE_OTP_KEY = "phone:{phone}"


def _send_email_login_otp(email: str, code: str, name: str) -> dict:
    text = (
        f"Hi {name},\n\n"
        f"Your SevenPros sign-in code is {code}. It expires in 10 minutes.\n\n"
        "If you did not try to sign in, you can ignore this message.\n"
    )
    html = (
        f"<p>Hi {name},</p>"
        f"<p>Your SevenPros sign-in code is <strong>{code}</strong>. It expires in 10 minutes.</p>"
        "<p>If you did not try to sign in, you can ignore this message.</p>"
    )
    return send_email(to=email, subject="Your SevenPros sign-in code", text=text, html=html)


def _normalize_demo_user(db: Session, user: User) -> User:
    demo_names = {
        "claire@sevenpros-demo.com": "Claire",
        "lucas@sevenpros-demo.com": "Lucas",
    }
    wanted = demo_names.get(user.email or "")
    if wanted and user.full_name != wanted:
        user.full_name = wanted
        db.commit()
        db.refresh(user)
    return user


@router.post("/signup", response_model=TokenOut)
def signup(payload: SignupEmail, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    referrer = None
    if payload.referral_code:
        referrer = db.query(User).filter(User.referral_code == payload.referral_code).first()

    phone = (payload.phone or "").strip() or None
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=phone,
        hashed_password=hash_password(payload.password),
        auth_provider=AuthProvider.email,
        referred_by=referrer.id if referrer else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


def _issue(user: User) -> TokenOut:
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


def _move_demo_accounts(db: Session) -> None:
    """Move both demo logins in one save so a later copy cannot put the old emails back."""
    moves = (
        ("claire@sevenpros-demo.com", "maria.garcia@example.com", "Claire"),
        ("lucas@sevenpros-demo.com", "owner0@sevenpros-demo.com", "Lucas"),
    )
    changed = False
    for email, previous, name in moves:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = db.query(User).filter(User.email == previous).first()
            if user:
                user.email = email
                changed = True
        if user and user.full_name != name:
            user.full_name = name
            changed = True
    if changed:
        db.commit()


@router.post("/demo-login", response_model=TokenOut)
def demo_login(payload: DemoLoginIn, db: Session = Depends(get_db)):
    """Always-on demo accounts for the MVP walkthrough."""
    if payload.role == "admin":
        from app.main import ensure_admin

        ensure_admin()
        user = db.query(User).filter(User.email == "admin@sevenpros.com").first()
        return _issue(user)

    if payload.role == "provider":
        email = "lucas@sevenpros-demo.com"
        name = "Lucas"
        _move_demo_accounts(db)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password("password123"),
                auth_provider=AuthProvider.email,
                is_verified=True,
                is_provider=True,
                active_mode="provider",
                phone="+14155550148",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            from app.models.provider import Provider

            if not db.query(Provider).filter(Provider.user_id == user.id).first():
                db.add(Provider(user_id=user.id, business_name="Golden State Plumbing", tagline="Demo provider"))
                db.commit()
        else:
            user.full_name = name
            user.active_mode = "provider"
            user.is_provider = True
            if not user.phone:
                user.phone = "+14155550148"
            db.commit()
            db.refresh(user)
        return _issue(user)

    _move_demo_accounts(db)
    email = "claire@sevenpros-demo.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name="Claire",
            hashed_password=hash_password("password123"),
            auth_provider=AuthProvider.email,
            is_verified=True,
            active_mode="customer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.full_name != "Claire":
        user.full_name = "Claire"
        db.commit()
        db.refresh(user)
    return _issue(user)


@router.post("/login")
def login(payload: LoginEmail, db: Session = Depends(get_db)):
    """Password check + email OTP (step 1). Complete sign-in with /email/login-verify."""
    return email_login_start(payload, db)


@router.post("/email/login-start")
def email_login_start(payload: LoginEmail, db: Session = Depends(get_db)):
    _move_demo_accounts(db)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = _normalize_demo_user(db, user)
    key = _EMAIL_OTP_KEY.format(email=payload.email.lower())
    code = issue_otp(key)
    delivery = _send_email_login_otp(payload.email, code, user.full_name)
    body = {
        "otp_required": True,
        "message": f"We sent a verification code to {payload.email}",
        "email": payload.email,
    }
    if delivery.get("mode") in ("log", "log_fallback"):
        body["dev_otp"] = code
    else:
        body["email_sent"] = True
        body.pop("dev_otp", None)
    return body


@router.post("/email/login-verify", response_model=TokenOut)
def email_login_verify(payload: EmailLoginVerify, db: Session = Depends(get_db)):
    key = _EMAIL_OTP_KEY.format(email=payload.email.lower())
    if not verify_otp(key, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account not found")
    user = _normalize_demo_user(db, user)
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/phone/request-otp")
def request_otp(payload: PhoneOtpRequest):
    key = _PHONE_OTP_KEY.format(phone=payload.phone)
    code = issue_otp(key)
    # Mock SMS provider: log instead of sending. Swap in Twilio here.
    print(f"[mock SMS] OTP for {payload.phone}: {code}")
    return {"message": "OTP sent", "dev_otp": code}


@router.post("/phone/verify-otp", response_model=TokenOut)
def verify_phone_otp(payload: PhoneOtpVerify, db: Session = Depends(get_db)):
    key = _PHONE_OTP_KEY.format(phone=payload.phone)
    if not verify_otp(key, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        user = User(
            phone=payload.phone,
            full_name=payload.full_name or "New User",
            auth_provider=AuthProvider.phone,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


def _norm_name(value: str) -> set[str]:
    cleaned = re.sub(r"\b(inc|llc|co|company|corp|the|and)\b", " ", value.lower())
    return {part for part in re.sub(r"[^a-z0-9]+", " ", cleaned).split() if len(part) > 2}


def _match_public_company(name: str, city: str) -> dict | None:
    from app.routers.search import load_public_listings

    wanted = _norm_name(name)
    if not wanted:
        return None
    city_key = city.strip().lower()
    best = None
    best_score = 0.0
    for item in load_public_listings():
        item_city = (item.get("city") or "").strip().lower()
        if not item_city or item_city != city_key:
            continue
        have = _norm_name(item.get("name") or "")
        if not have:
            continue
        score = len(wanted & have) / len(wanted)
        if score > best_score:
            best_score = score
            best = item
    if best_score >= 0.6:
        return best
    return None


@router.post("/register-company")
def register_company(
    payload: CompanyRegisterIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a provider from company details and check them against public business records."""
    from app.models.provider import Provider

    match = _match_public_company(payload.business_name, payload.city)
    license_number = (payload.license_number or "").strip()
    license_ok = bool(re.fullmatch(r"\d{4,8}", re.sub(r"\s+", "", license_number)))
    provider = user.provider_profile
    if provider is None:
        provider = Provider(user_id=user.id, business_name=payload.business_name.strip())
        db.add(provider)
    provider.business_name = payload.business_name.strip()
    provider.city = payload.city.strip()
    provider.state = "CA"
    provider.website = (payload.website or "").strip() or (match or {}).get("website") or None
    provider.license_number = license_number or None
    provider.is_licensed = license_ok
    provider.kyc_status = "verified" if match else "pending"
    if payload.street:
        provider.about = f"Registered address: {payload.street.strip()}, {payload.city.strip()}, CA"
    pro_phone = (payload.phone or "").strip()
    if pro_phone:
        user.phone = pro_phone
    user.is_provider = True
    user.active_mode = "provider"
    db.commit()
    db.refresh(user)
    place = None
    if match:
        place = ", ".join(part for part in [match.get("street"), match.get("city"), match.get("state")] if part)
    return {
        "user": UserOut.model_validate(user).model_dump(mode="json"),
        "verification": {
            "status": provider.kyc_status,
            "licensed": provider.is_licensed,
            "matched_name": match.get("name") if match else None,
            "matched_address": place,
            "message": (
                "This company matches a free public business record."
                if match
                else "Company saved. No public record matched this name in that city yet, so verification stays pending."
            ),
        },
    }


class SocialIn(BaseModel):
    id_token: str
    full_name: str = ""


def _social_user(db: Session, email: str, name: str, provider: AuthProvider) -> TokenOut:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=name or email.split("@")[0],
            auth_provider=provider,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue(user)


@router.get("/google/config")
def google_config():
    """Lets the frontend confirm Google sign-in is configured in production."""
    ids = _google_client_ids()
    return {"configured": bool(ids), "client_id": ids[0] if ids else ""}


def _google_client_ids() -> list[str]:
    ids: list[str] = []
    for key in ("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_IDS"):
        raw = os.environ.get(key, "")
        ids.extend(part.strip() for part in raw.split(",") if part.strip())
    return ids


@router.post("/google", response_model=TokenOut)
def google_login(payload: SocialIn, db: Session = Depends(get_db)):
    client_ids = _google_client_ids()
    if not client_ids:
        raise HTTPException(status_code=503, detail="Google sign-in needs GOOGLE_CLIENT_ID on the API.")
    try:
        with urllib.request.urlopen(
            "https://oauth2.googleapis.com/tokeninfo?id_token=" + urllib.parse.quote(payload.id_token),
            timeout=8,
        ) as res:
            data = json.load(res)
    except Exception:
        raise HTTPException(status_code=401, detail="Google could not verify that sign-in.")
    aud = data.get("aud")
    if aud not in client_ids or str(data.get("email_verified")).lower() != "true":
        raise HTTPException(status_code=401, detail="Google sign-in was not issued for this app.")
    email = data.get("email") or ""
    if not email:
        raise HTTPException(status_code=400, detail="Google did not share an email address.")
    return _social_user(db, email, payload.full_name or data.get("name") or "", AuthProvider.google)


@router.post("/apple", response_model=TokenOut)
def apple_login(payload: SocialIn, db: Session = Depends(get_db)):
    client_id = os.environ.get("APPLE_CLIENT_ID", "")
    if not client_id:
        raise HTTPException(status_code=503, detail="Apple sign-in needs a Services ID on the server.")
    try:
        with urllib.request.urlopen("https://appleid.apple.com/auth/keys", timeout=8) as res:
            keys = json.load(res)["keys"]
        header = jwt.get_unverified_header(payload.id_token)
        key = next(item for item in keys if item["kid"] == header.get("kid"))
        claims = jwt.decode(payload.id_token, key, algorithms=["RS256"], audience=client_id, issuer="https://appleid.apple.com")
    except Exception:
        raise HTTPException(status_code=401, detail="Apple could not verify that sign-in.")
    email = claims.get("email") or ""
    if not email:
        raise HTTPException(status_code=400, detail="Apple did not share an email. Try again and allow email.")
    return _social_user(db, email, payload.full_name or email.split("@")[0], AuthProvider.apple)


@router.post("/become-provider")
def become_provider(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The 'Switch to Pro' action -- mirrors Fiverr's buyer/seller mode toggle."""
    from app.models.provider import Provider

    if not user.is_provider:
        user.is_provider = True
        provider = Provider(user_id=user.id, business_name=user.full_name)
        db.add(provider)
    user.active_mode = "provider"
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/switch-mode")
def switch_mode(mode: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if mode not in ("customer", "provider"):
        raise HTTPException(status_code=400, detail="mode must be 'customer' or 'provider'")
    if mode == "provider" and not user.is_provider:
        raise HTTPException(status_code=403, detail="Become a provider first")
    user.active_mode = mode
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)
