from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TryOnRequest(BaseModel):
    pet_id: UUID
    product_id: UUID
    angle: Optional[str] = "angle45"


class TryOnResponse(BaseModel):
    id: UUID
    image_url: str
    angle: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TryOnHistoryResponse(BaseModel):
    items: list[TryOnResponse]
