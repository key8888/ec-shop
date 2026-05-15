from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.share import ShareLinkCreate, ShareLinkResponse, ShareClickResponse
from app.services.share_service import ShareService

router = APIRouter()


@router.post("/create", response_model=ShareLinkResponse, status_code=201)
async def create_share_link(
    data: ShareLinkCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ShareService(session)
    return await service.create_share_link(current_user.id, data)


@router.get("/my-links", response_model=list[ShareLinkResponse])
async def get_my_links(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ShareService(session)
    return await service.get_user_share_links(current_user.id)


@router.get("/{share_code}", response_model=ShareLinkResponse)
async def get_share_link(share_code: str, session: AsyncSession = Depends(get_db)):
    service = ShareService(session)
    return await service.get_share_link(share_code)


@router.post("/{share_code}/click", response_model=ShareClickResponse)
async def click_share_link(
    share_code: str,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = ShareService(session)
    return await service.record_click(share_code, ip, user_agent)


@router.post("/{share_code}/claim")
async def claim_discount(
    share_code: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ShareService(session)
    result = await service.claim_discount(share_code, current_user.id)
    return {"claimed": True, "discount_percentage": result["discount_percentage"]}
