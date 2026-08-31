import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class BookingStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    customer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"), index=True)
    service_id: Mapped[str] = mapped_column(ForeignKey("services.id"), index=True)

    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.pending)

    scheduled_date: Mapped[str] = mapped_column(String)  # ISO date, e.g. 2026-07-25
    scheduled_time: Mapped[str] = mapped_column(String)  # e.g. 14:00
    is_emergency: Mapped[bool] = mapped_column(default=False)

    address_line: Mapped[str] = mapped_column(String)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_urls: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON-encoded list

    quoted_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    payment_status: Mapped[str] = mapped_column(String, default="unpaid")  # unpaid | partial | paid | refunded

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id])
    provider = relationship("Provider")
    service = relationship("Service")
    review = relationship("Review", back_populates="booking", uselist=False)
    payments = relationship("Payment", back_populates="booking")
    messages = relationship("Message", back_populates="booking")
