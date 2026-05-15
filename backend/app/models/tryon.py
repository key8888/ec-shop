import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product
    from app.models.pet import Pet


class TryonImage(Base, TimestampMixin):
    __tablename__ = "tryon_images"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    pet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    angle: Mapped[str] = mapped_column(String(20), default="angle45")
    image_url: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship("User")
    pet: Mapped["Pet"] = relationship("Pet")
    product: Mapped["Product"] = relationship("Product")
