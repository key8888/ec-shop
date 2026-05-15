from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from app.services.coupon_service import CouponService

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    req: CouponValidateRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CouponService(session)
    return await service.validate_and_calculate(req.code, req.order_amount)


@router.post("/apply")
async def apply_coupon(
    body: dict,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    code = body.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="code is required")
    service = CouponService(session)
    await service.apply(code)
    return {"status": "ok"}
