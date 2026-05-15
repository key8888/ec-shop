from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.tryon import TryOnRequest, TryOnResponse, TryOnHistoryResponse
from app.services.tryon_service import TryOnService

router = APIRouter()


@router.post("/generate", response_model=TryOnResponse, status_code=201)
async def generate_tryon(
    request: TryOnRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TryOnService(session)
    return await service.generate(current_user.id, request)


@router.post("/generate-additional", response_model=list[TryOnResponse])
async def generate_additional(
    body: dict,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet_id = body.get("pet_id")
    product_id = body.get("product_id")
    angles = body.get("angles", [])
    if not pet_id or not product_id:
        raise HTTPException(status_code=400, detail="pet_id and product_id are required")
    service = TryOnService(session)
    return await service.generate_additional(
        current_user.id,
        UUID(pet_id) if isinstance(pet_id, str) else pet_id,
        UUID(product_id) if isinstance(product_id, str) else product_id,
        angles,
    )


@router.get("/history", response_model=TryOnHistoryResponse)
async def get_tryon_history(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TryOnService(session)
    items = await service.get_history(current_user.id)
    return TryOnHistoryResponse(items=items)
