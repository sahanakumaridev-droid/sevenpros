from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    group: Mapped[str] = mapped_column(String, index=True)  # top-level group, e.g. "Home Services"
    icon: Mapped[str] = mapped_column(String, default="🔧")
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)

    services = relationship("Service", back_populates="category")
