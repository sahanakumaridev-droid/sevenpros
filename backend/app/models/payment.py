from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class Payment(Base):
    """Mock payment record. No real card processor is called; see
    app/routers/payments.py for the Stripe integration point."""

    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    booking_id: Mapped[str] = mapped_column(ForeignKey("bookings.id"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    tip: Mapped[float] = mapped_column(Float, default=0.0)
    coupon_code: Mapped[str | None] = mapped_column(String, nullable=True)
    method: Mapped[str] = mapped_column(String, default="mock_card")  # mock_card | mock_wallet
    status: Mapped[str] = mapped_column(String, default="succeeded")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")


class CheckoutOrder(Base):
    """One review-and-confirm order. Confirming it delivers the purchase once."""

    __tablename__ = "checkout_orders"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True)
    purpose: Mapped[str] = mapped_column(String)
    pack: Mapped[str] = mapped_column(String, default="")
    booking_id: Mapped[str] = mapped_column(String, default="")
    amount_cents: Mapped[int] = mapped_column(Integer, default=0)
    label: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
