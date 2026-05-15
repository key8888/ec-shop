import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.share_link import ShareLink, ShareClick
from app.repositories.share_link_repository import ShareLinkRepository
from app.schemas.share import (
    ShareLinkCreate,
    ShareLinkResponse,
    ShareClickResponse,
    ShareLinkAdminSettings,
)


def _generate_share_code() -> str:
    return secrets.token_urlsafe(8)


def _format_share_response(link: ShareLink) -> ShareLinkResponse:
    return ShareLinkResponse(
        id=link.id,
        share_code=link.share_code,
        product_id=link.product_id,
        product_name=getattr(link.product, "name", ""),
        sharer_name=getattr(link.sharer, "name", ""),
        required_clicks=link.required_clicks,
        current_clicks=link.current_clicks,
        discount_percentage=link.discount_percentage,
        max_uses=link.max_uses,
        expires_at=link.expires_at,
        is_active=link.is_active,
        is_claimed=link.is_claimed,
        created_at=link.created_at,
    )


class ShareService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ShareLinkRepository(session)

    async def create_share_link(
        self, user_id: UUID, data: ShareLinkCreate
    ) -> ShareLinkResponse:
        discount_pct = min(data.discount_percentage, settings.SHARE_MAX_DISCOUNT_PERCENTAGE)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=data.expires_in_hours)

        share_link = ShareLink(
            product_id=data.product_id,
            sharer_id=user_id,
            share_code=_generate_share_code(),
            required_clicks=data.required_clicks,
            discount_percentage=discount_pct,
            max_uses=data.max_uses,
            expires_at=expires_at,
        )
        self.session.add(share_link)
        await self.session.commit()
        await self.session.refresh(share_link)
        return _format_share_response(share_link)

    async def record_click(
        self, share_code: str, ip: str | None, user_agent: str | None
    ) -> ShareClickResponse:
        link = await self.repo.get_by_share_code(share_code)
        if not link:
            raise HTTPException(status_code=404, detail="Share link not found")
        if not link.is_active:
            return ShareClickResponse(
                success=False,
                current_clicks=link.current_clicks,
                required_clicks=link.required_clicks,
                discount_activated=False,
                remaining=link.required_clicks - link.current_clicks,
                message="Share link is no longer active",
            )
        if link.is_claimed:
            return ShareClickResponse(
                success=False,
                current_clicks=link.current_clicks,
                required_clicks=link.required_clicks,
                discount_activated=False,
                remaining=0,
                message="Discount has already been claimed",
            )
        if datetime.now(timezone.utc) > link.expires_at:
            link.is_active = False
            await self.session.commit()
            return ShareClickResponse(
                success=False,
                current_clicks=link.current_clicks,
                required_clicks=link.required_clicks,
                discount_activated=False,
                remaining=link.required_clicks - link.current_clicks,
                message="Share link has expired",
            )

        is_unique = True
        if ip:
            cutoff = datetime.now(timezone.utc) - timedelta(
                hours=settings.SHARE_IP_DUPLICATE_WINDOW_HOURS
            )
            for existing_click in link.clicks:
                if existing_click.clicker_ip == ip and existing_click.created_at > cutoff:
                    is_unique = False
                    break

        click = ShareClick(
            share_link_id=link.id,
            clicker_ip=ip,
            clicker_user_agent=user_agent,
            is_unique=is_unique,
        )
        self.session.add(click)
        if is_unique:
            link.current_clicks += 1
        await self.session.commit()

        discount_activated = link.current_clicks >= link.required_clicks
        remaining = max(link.required_clicks - link.current_clicks, 0)

        return ShareClickResponse(
            success=True,
            current_clicks=link.current_clicks,
            required_clicks=link.required_clicks,
            discount_activated=discount_activated,
            remaining=remaining,
            message="Discount activated!" if discount_activated else f"{remaining} more clicks needed",
        )

    async def get_user_share_links(self, user_id: UUID) -> list[ShareLinkResponse]:
        links = await self.repo.get_by_sharer(user_id)
        return [_format_share_response(link) for link in links]

    async def get_share_link(self, share_code: str) -> ShareLinkResponse:
        link = await self.repo.get_by_share_code(share_code)
        if not link:
            raise HTTPException(status_code=404, detail="Share link not found")
        return _format_share_response(link)

    async def claim_discount(self, share_code: str, user_id: UUID) -> dict:
        link = await self.repo.get_by_share_code(share_code)
        if not link:
            raise HTTPException(status_code=404, detail="Share link not found")
        if link.is_claimed:
            raise HTTPException(status_code=400, detail="Discount already claimed")
        if link.current_clicks < link.required_clicks:
            raise HTTPException(status_code=400, detail="Required clicks not met")
        link.is_claimed = True
        await self.session.commit()
        return {
            "product_id": str(link.product_id),
            "discount_percentage": link.discount_percentage,
            "message": "Discount claimed successfully",
        }

    async def get_admin_settings(self) -> ShareLinkAdminSettings:
        return ShareLinkAdminSettings(
            default_required_clicks=settings.SHARE_DEFAULT_CLICKS,
            default_discount_percentage=settings.SHARE_DEFAULT_DISCOUNT_PERCENTAGE,
            default_expires_in_hours=settings.SHARE_DEFAULT_EXPIRES_HOURS,
            max_discount_percentage=settings.SHARE_MAX_DISCOUNT_PERCENTAGE,
            ip_duplicate_window_hours=settings.SHARE_IP_DUPLICATE_WINDOW_HOURS,
        )

    async def update_admin_settings(
        self, admin_settings: ShareLinkAdminSettings
    ) -> ShareLinkAdminSettings:
        # Settings are read-only from env; return current settings
        return await self.get_admin_settings()
