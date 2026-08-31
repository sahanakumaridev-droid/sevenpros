from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import gen_uuid


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("customer_id", "provider_id", name="uq_favorite_customer_provider"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    customer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    provider = relationship("Provider")
