import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Pet(Base, TimestampMixin):
    __tablename__ = "pets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    weight: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    body_length: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    front_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    side_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    angle45_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="pets")
