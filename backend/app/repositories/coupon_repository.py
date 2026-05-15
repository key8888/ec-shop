from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon
from app.repositories.base import BaseRepository


class CouponRepository(BaseRepository[Coupon]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Coupon)

    async def get_by_code(self, code: str) -> Coupon | None:
        result = await self.session.execute(
            select(Coupon).where(Coupon.code == code)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> tuple[list[Coupon], int]:
        count_result = await self.session.execute(select(func.count(Coupon.id)))
        total = count_result.scalar_one()
        result = await self.session.execute(select(Coupon))
        items = list(result.scalars().all())
        return items, total
