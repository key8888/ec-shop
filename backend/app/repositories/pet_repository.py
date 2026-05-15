from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.repositories.base import BaseRepository


class PetRepository(BaseRepository[Pet]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Pet)

    async def get_by_user(self, user_id: UUID) -> list[Pet]:
        result = await self.session.execute(
            select(Pet).where(Pet.user_id == user_id)
        )
        return list(result.scalars().all())
