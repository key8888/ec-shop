from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class ShareLinkCreate(BaseModel):
    product_id: UUID
    required_clicks: int = 3
    discount_percentage: int
    max_uses: int = 1
    expires_in_hours: int = 24

    @field_validator("discount_percentage")
    @classmethod
    def discount_percentage_range(cls, v: int) -> int:
        if v < 1 or v > 100:
            raise ValueError("discount_percentage must be between 1 and 100")
        return v


class ShareLinkResponse(BaseModel):
    id: UUID
    share_code: str
    product_id: UUID
    product_name: str
    sharer_name: str
    required_clicks: int
    current_clicks: int
    discount_percentage: int
    max_uses: int
    expires_at: datetime
    is_active: bool
    is_claimed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ShareClickResponse(BaseModel):
    success: bool
    current_clicks: int
    required_clicks: int
    discount_activated: bool
    remaining: int
    message: str


class ShareLinkAdminSettings(BaseModel):
    default_required_clicks: int = 3
    default_discount_percentage: int = 10
    default_expires_in_hours: int = 24
    max_discount_percentage: int = 50
    ip_duplicate_window_hours: int = 24
