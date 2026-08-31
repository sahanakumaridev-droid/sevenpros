import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import AuthProvider, User
from app.schemas.user import (
    DemoLoginIn,
    LoginEmail,
    PhoneOtpRequest,
    PhoneOtpVerify,
    SignupEmail,
    TokenOut,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory OTP store for the mock phone-auth flow. A real deployment would
# send the code via Twilio/SNS and store it in Redis with a TTL.
_otp_store: dict[str, str] = {}


@router.post("/signup", response_model=TokenOut)
def signup(payload: SignupEmail, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    referrer = None
    if payload.referral_code:
        referrer = db.query(User).filter(User.referral_code == payload.referral_code).first()

    user = User(
        email=payload.email,
        full_name=payload.full_name,
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


@router.post("/demo-login", response_model=TokenOut)
def demo_login(payload: DemoLoginIn, db: Session = Depends(get_db)):
    """Always-on demo accounts for the MVP walkthrough."""
    if payload.role == "provider":
        email = "owner0@sevenpros-demo.com"
        name = "Demo Pro"
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
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            from app.models.provider import Provider

            if not db.query(Provider).filter(Provider.user_id == user.id).first():
                db.add(Provider(user_id=user.id, business_name="Golden State Plumbing", tagline="Demo provider"))
                db.commit()
        else:
            user.active_mode = "provider"
            user.is_provider = True
            db.commit()
            db.refresh(user)
        return _issue(user)

    email = "maria.garcia@example.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name="Maria Garcia",
            hashed_password=hash_password("password123"),
            auth_provider=AuthProvider.email,
            is_verified=True,
            active_mode="customer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue(user)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginEmail, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/phone/request-otp")
def request_otp(payload: PhoneOtpRequest):
    code = f"{random.randint(0, 999999):06d}"
    _otp_store[payload.phone] = code
    # Mock SMS provider: log instead of sending. Swap in Twilio here.
    print(f"[mock SMS] OTP for {payload.phone}: {code}")
    return {"message": "OTP sent", "dev_otp": code}


@router.post("/phone/verify-otp", response_model=TokenOut)
def verify_otp(payload: PhoneOtpVerify, db: Session = Depends(get_db)):
    expected = _otp_store.get(payload.phone)
    if not expected or expected != payload.code:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    del _otp_store[payload.phone]

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
