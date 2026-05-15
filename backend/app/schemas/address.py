from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class AddressCreate(BaseModel):
    postal_code: str
    prefecture: str
    city: str
    address1: str
    address2: Optional[str] = None
    phone: Optional[str] = None
    is_default: bool = False

    @field_validator("postal_code")
    @classmethod
    def postal_code_length(cls, v: str) -> str:
        if len(v) < 7 or len(v) > 8:
            raise ValueError("postal_code must be between 7 and 8 characters")
        return v


class AddressUpdate(BaseModel):
    postal_code: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None
    address1: Optional[str] = None
    address2: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None

    @field_validator("postal_code")
    @classmethod
    def postal_code_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (len(v) < 7 or len(v) > 8):
            raise ValueError("postal_code must be between 7 and 8 characters")
        return v


class AddressResponse(BaseModel):
    id: UUID
    user_id: UUID
    postal_code: str
    prefecture: str
    city: str
    address1: str
    address2: Optional[str] = None
    phone: Optional[str] = None
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PostalCodeLookupResponse(BaseModel):
    prefecture: str
    city: str
    address1: str
