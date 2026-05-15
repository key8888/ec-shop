from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class OrderItemInput(BaseModel):
    product_id: UUID
    quantity: int = 1
    patches_config: Optional[dict] = None

    @field_validator("quantity")
    @classmethod
    def quantity_ge_1(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be >= 1")
        return v


class OrderCreate(BaseModel):
    items: list[OrderItemInput]
    coupon_code: Optional[str] = None
    coupon_discount: Optional[int] = None


class OrderItemResponse(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: int
    patches_config: Optional[dict] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    total_price: int
    payment_status: str
    komoju_session_id: Optional[str] = None
    coupon_code: Optional[str] = None
    coupon_discount: int = 0
    patches_config: Optional[dict] = None
    items: list[OrderItemResponse]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderHistoryResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    per_page: int


class PaymentSessionResponse(BaseModel):
    payment_url: str
