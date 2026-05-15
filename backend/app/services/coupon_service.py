from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon
from app.repositories.coupon_repository import CouponRepository
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponValidateResponse,
    CouponListResponse,
)


class CouponService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = CouponRepository(session)

    async def validate_and_calculate(
        self, code: str, order_amount: int
    ) -> CouponValidateResponse:
        coupon = await self.repo.get_by_code(code.upper())
        if not coupon:
            return CouponValidateResponse(
                valid=False,
                discount_type="fixed",
                discount_value=0,
                discount_amount=0,
                message="Coupon not found",
            )
        if not coupon.is_active:
            return CouponValidateResponse(
                valid=False,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                discount_amount=0,
                message="Coupon is not active",
            )
        now = datetime.now(timezone.utc)
        if coupon.starts_at and now < coupon.starts_at:
            return CouponValidateResponse(
                valid=False,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                discount_amount=0,
                message="Coupon is not yet valid",
            )
        if coupon.expires_at and now > coupon.expires_at:
            return CouponValidateResponse(
                valid=False,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                discount_amount=0,
                message="Coupon has expired",
            )
        if coupon.max_uses > 0 and coupon.current_uses >= coupon.max_uses:
            return CouponValidateResponse(
                valid=False,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                discount_amount=0,
                message="Coupon usage limit reached",
            )
        if coupon.min_order_amount and order_amount < coupon.min_order_amount:
            return CouponValidateResponse(
                valid=False,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                discount_amount=0,
                message=f"Minimum order amount is {coupon.min_order_amount}",
            )

        if coupon.discount_type == "percentage":
            discount_amount = int(order_amount * coupon.discount_value / 100)
        else:
            discount_amount = min(coupon.discount_value, order_amount)

        return CouponValidateResponse(
            valid=True,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            discount_amount=discount_amount,
            message="Coupon applied successfully",
        )

    async def apply(self, code: str) -> None:
        coupon = await self.repo.get_by_code(code.upper())
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        coupon.current_uses += 1
        await self.session.commit()

    async def create(self, data: CouponCreate, created_by: UUID) -> CouponResponse:
        existing = await self.repo.get_by_code(data.code.upper())
        if existing:
            raise HTTPException(status_code=409, detail="Coupon code already exists")
        coupon = Coupon(
            code=data.code.upper(),
            discount_type=data.discount_type,
            discount_value=data.discount_value,
            min_order_amount=data.min_order_amount,
            max_uses=data.max_uses or 0,
            starts_at=data.starts_at,
            expires_at=data.expires_at,
            created_by=created_by,
        )
        self.session.add(coupon)
        await self.session.commit()
        await self.session.refresh(coupon)
        return CouponResponse.model_validate(coupon)

    async def list(self) -> CouponListResponse:
        items, total = await self.repo.list_all()
        return CouponListResponse(
            items=[CouponResponse.model_validate(c) for c in items],
            total=total,
        )

    async def update(self, coupon_id: UUID, data: CouponUpdate) -> CouponResponse:
        coupon = await self.repo.get(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            if key == "code" and value:
                value = value.upper()
            setattr(coupon, key, value)
        await self.session.commit()
        await self.session.refresh(coupon)
        return CouponResponse.model_validate(coupon)

    async def delete(self, coupon_id: UUID) -> None:
        coupon = await self.repo.get(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        await self.session.delete(coupon)
        await self.session.commit()

    async def get_by_code(self, code: str) -> CouponResponse:
        coupon = await self.repo.get_by_code(code.upper())
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return CouponResponse.model_validate(coupon)
