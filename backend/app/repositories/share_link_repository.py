from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.share_link import ShareLink
from app.repositories.base import BaseRepository


class ShareLinkRepository(BaseRepository[ShareLink]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ShareLink)

    async def get_by_share_code(self, share_code: str) -> ShareLink | None:
        result = await self.session.execute(
            select(ShareLink)
            .options(selectinload(ShareLink.clicks))
            .where(ShareLink.share_code == share_code)
        )
        return result.scalar_one_or_none()

    async def get_by_sharer(self, sharer_id, skip: int = 0, limit: int = 20):
        result = await self.session.execute(
            select(ShareLink)
            .options(selectinload(ShareLink.clicks))
            .where(ShareLink.sharer_id == sharer_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
