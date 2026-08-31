from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True, index=True)

    business_name: Mapped[str] = mapped_column(String)
    tagline: Mapped[str | None] = mapped_column(String, nullable=True)
    about: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_photo_url: Mapped[str | None] = mapped_column(String, nullable=True)

    years_experience: Mapped[int] = mapped_column(Integer, default=0)

    # Verification & trust signals
    is_licensed: Mapped[bool] = mapped_column(Boolean, default=False)
    license_number: Mapped[str | None] = mapped_column(String, nullable=True)
    is_insured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_background_checked: Mapped[bool] = mapped_column(Boolean, default=False)
    kyc_status: Mapped[str] = mapped_column(String, default="pending")  # pending | verified | rejected

    # Location / service area
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, default="CA")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    service_radius_km: Mapped[float] = mapped_column(Float, default=25.0)

    response_time_minutes: Mapped[int] = mapped_column(Integer, default=60)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True)  # false = vacation mode
    subscription_plan: Mapped[str] = mapped_column(String, default="free")  # free | pro | premium

    website: Mapped[str | None] = mapped_column(String, nullable=True)
    social_links: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON-encoded

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="provider_profile")
    services = relationship("Service", back_populates="provider", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="provider")

    @property
    def is_verified(self) -> bool:
        return self.is_licensed and self.is_insured and self.is_background_checked
