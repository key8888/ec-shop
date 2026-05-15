from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PetCreate(BaseModel):
    name: str
    species: Optional[str] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    body_length: Optional[float] = None


class PetResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    species: Optional[str] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    body_length: Optional[float] = None
    front_image_url: Optional[str] = None
    side_image_url: Optional[str] = None
    angle45_image_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PetImageUploadResponse(BaseModel):
    image_url: str
