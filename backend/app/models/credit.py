from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.user import gen_uuid


class CreditWallet(Base):
    __tablename__ = "credit_wallets"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CreditUnlock(Base):
    """One row means this customer already spent a credit on that pro or listing."""

    __tablename__ = "credit_unlocks"
    __table_args__ = (UniqueConstraint("user_id", "target_id", name="uq_credit_target"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    target_id: Mapped[str] = mapped_column(String, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    kind: Mapped[str] = mapped_column(String)
    note: Mapped[str] = mapped_column(String, default="")
    balance_after: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProSubscription(Base):
    __tablename__ = "pro_subscriptions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    status: Mapped[str] = mapped_column(String, default="none")
    price_cents: Mapped[int] = mapped_column(Integer, default=4900)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class JobBid(Base):
    __tablename__ = "job_bids"
    __table_args__ = (UniqueConstraint("job_id", "pro_user_id", name="uq_job_bid"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    job_id: Mapped[str] = mapped_column(String, index=True)
    pro_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    amount_cents: Mapped[int] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default="pending")  # pending | accepted | rejected
    booking_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class JobPost(Base):
    __tablename__ = "job_posts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String, default="General")
    city: Mapped[str] = mapped_column(String, default="")
    zip_code: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ListingExtra(Base):
    __tablename__ = "listing_extras"

    job_id: Mapped[str] = mapped_column(String, primary_key=True)
    kind: Mapped[str] = mapped_column(String, default="request")
    price_cents: Mapped[int] = mapped_column(Integer, default=0)
    image_data: Mapped[str] = mapped_column(Text, default="")


class ThreadSeen(Base):
    __tablename__ = "thread_seen"

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    job_id: Mapped[str] = mapped_column(String, primary_key=True)
    seen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ListingMessage(Base):
    __tablename__ = "listing_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    job_id: Mapped[str] = mapped_column(String, index=True)
    sender_id: Mapped[str] = mapped_column(String, index=True)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
