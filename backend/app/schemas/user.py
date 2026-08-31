from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    id: str
    email: str | None
    phone: str | None
    full_name: str
    avatar_url: str | None
    is_provider: bool
    active_mode: str
    is_verified: bool
    language: str
    dark_mode: bool
    notifications_enabled: bool
    referral_code: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SignupEmail(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    referral_code: str | None = None


class LoginEmail(BaseModel):
    email: EmailStr
    password: str


class DemoLoginIn(BaseModel):
    role: str = "customer"


class PhoneOtpRequest(BaseModel):
    phone: str


class PhoneOtpVerify(BaseModel):
    phone: str
    code: str
    full_name: str | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    language: str | None = None
    dark_mode: bool | None = None
    notifications_enabled: bool | None = None


class AddressIn(BaseModel):
    label: str = "Home"
    line1: str
    city: str
    state: str = "CA"
    zip_code: str
    latitude: float | None = None
    longitude: float | None = None
    is_default: bool = False


class AddressOut(AddressIn):
    id: str
    model_config = {"from_attributes": True}
