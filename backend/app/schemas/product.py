from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    stock: int = 0
    category_id: Optional[UUID] = None
    thumbnail_url: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_gt_0(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("price must be > 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_ge_0(cls, v: int) -> int:
        if v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    stock: Optional[int] = None
    category_id: Optional[UUID] = None
    thumbnail_url: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_gt_0(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("price must be > 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_ge_0(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    price: int
    stock: int
    category_id: Optional[UUID] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    per_page: int
