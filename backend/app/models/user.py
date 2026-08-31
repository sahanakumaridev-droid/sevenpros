import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AuthProvider(str, enum.Enum):
    email = "email"
    phone = "phone"
    google = "google"
    apple = "apple"
    facebook = "facebook"


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    email: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    full_name: Mapped[str] = mapped_column(String)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(Enum(AuthProvider), default=AuthProvider.email)

    # "Switch to Pro" toggle, mirrors Fiverr's buyer/seller mode switch
    is_provider: Mapped[bool] = mapped_column(Boolean, default=False)
    active_mode: Mapped[str] = mapped_column(String, default="customer")  # customer | provider

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    language: Mapped[str] = mapped_column(String, default="en")
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    referral_code: Mapped[str] = mapped_column(String, unique=True, default=lambda: uuid.uuid4().hex[:8])
    referred_by: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    provider_profile = relationship("Provider", back_populates="user", uselist=False)
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
