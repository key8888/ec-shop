from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.repositories.base import BaseRepository


class AddressRepository(BaseRepository[Address]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Address)

    async def get_by_user(self, user_id: UUID) -> list[Address]:
        result = await self.session.execute(
            select(Address).where(Address.user_id == user_id)
        )
        return list(result.scalars().all())

    async def count_by_user(self, user_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Address).where(Address.user_id == user_id)
        )
        return result.scalar_one()
