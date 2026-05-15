import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product


class ShareLink(Base):
    __tablename__ = "share_links"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    sharer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    share_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    required_clicks: Mapped[int] = mapped_column(Integer, default=3)
    current_clicks: Mapped[int] = mapped_column(Integer, default=0)
    discount_percentage: Mapped[int] = mapped_column(Integer, nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, default=1)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_claimed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    product: Mapped["Product"] = relationship("Product")
    sharer: Mapped["User"] = relationship("User")
    clicks: Mapped[list["ShareClick"]] = relationship(
        "ShareClick", back_populates="share_link", cascade="all, delete-orphan"
    )


class ShareClick(Base):
    __tablename__ = "share_clicks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    share_link_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("share_links.id", ondelete="CASCADE"), nullable=False
    )
    clicker_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    clicker_user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_unique: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    share_link: Mapped["ShareLink"] = relationship("ShareLink", back_populates="clicks")
