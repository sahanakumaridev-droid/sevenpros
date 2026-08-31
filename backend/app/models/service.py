from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)

    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price_type: Mapped[str] = mapped_column(String, default="fixed")  # fixed | hourly | quote
    price_min: Mapped[float] = mapped_column(Float, default=0.0)
    price_max: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_instant_booking: Mapped[bool] = mapped_column(Boolean, default=True)
    offers_free_estimate: Mapped[bool] = mapped_column(Boolean, default=False)
    is_emergency: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    provider = relationship("Provider", back_populates="services")
    category = relationship("Category", back_populates="services")
