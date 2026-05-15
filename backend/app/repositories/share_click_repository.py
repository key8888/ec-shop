from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.share_link import ShareClick
from app.repositories.base import BaseRepository


class ShareClickRepository(BaseRepository[ShareClick]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ShareClick)

    async def count_unique_clicks(
        self, share_link_id: UUID, ip: str, ua: str, window_hours: int
    ) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
        result = await self.session.execute(
            select(func.count()).select_from(ShareClick).where(
                and_(
                    ShareClick.share_link_id == share_link_id,
                    ShareClick.clicker_ip == ip,
                    ShareClick.clicker_user_agent == ua,
                    ShareClick.created_at >= cutoff,
                )
            )
        )
        return result.scalar_one()
