from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

from pydantic import BaseModel, field_validator


class CouponCreate(BaseModel):
    code: str
    discount_type: Literal["percentage", "fixed"]
    discount_value: int
    min_order_amount: Optional[int] = None
    max_uses: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    @field_validator("code")
    @classmethod
    def code_min_length(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("code must be at least 3 characters")
        return v

    @field_validator("discount_value")
    @classmethod
    def discount_value_gt_0(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("discount_value must be > 0")
        return v


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[Literal["percentage", "fixed"]] = None
    discount_value: Optional[int] = None
    min_order_amount: Optional[int] = None
    max_uses: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

    @field_validator("code")
    @classmethod
    def code_min_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) < 3:
            raise ValueError("code must be at least 3 characters")
        return v

    @field_validator("discount_value")
    @classmethod
    def discount_value_gt_0(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("discount_value must be > 0")
        return v


class CouponResponse(BaseModel):
    id: UUID
    code: str
    discount_type: str
    discount_value: int
    min_order_amount: Optional[int] = None
    max_uses: int
    current_uses: int
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponValidateRequest(BaseModel):
    code: str
    order_amount: int


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_type: str
    discount_value: int
    discount_amount: int
    message: Optional[str] = None


class CouponListResponse(BaseModel):
    items: list[CouponResponse]
    total: int
