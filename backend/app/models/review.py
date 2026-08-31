from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    booking_id: Mapped[str] = mapped_column(ForeignKey("bookings.id"), unique=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"), index=True)

    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_urls: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON-encoded list
    provider_reply: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_reported: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="review")
    customer = relationship("User")
    provider = relationship("Provider", back_populates="reviews")
