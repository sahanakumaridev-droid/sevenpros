from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
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
