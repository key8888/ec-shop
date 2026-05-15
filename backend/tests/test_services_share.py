import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.share_link import ShareLink, ShareClick
from app.schemas.share import ShareLinkCreate
from app.services.share_service import ShareService


def _make_share_link(share_code="abc123", required_clicks=3, current_clicks=0,
                     discount_percentage=10, max_uses=1, is_active=True, is_claimed=False,
                     product_id=None, sharer_id=None, clicks=None):
    if product_id is None:
        product_id = uuid.uuid4()
    if sharer_id is None:
        sharer_id = uuid.uuid4()
    return ShareLink(
        id=uuid.uuid4(),
        product_id=product_id,
        sharer_id=sharer_id,
        share_code=share_code,
        required_clicks=required_clicks,
        current_clicks=current_clicks,
        discount_percentage=discount_percentage,
        max_uses=max_uses,
        is_active=is_active,
        is_claimed=is_claimed,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        created_at=datetime.now(timezone.utc),
        clicks=clicks or [],
    )


class TestShareServiceCreateShareLink:
    @pytest.mark.asyncio
    async def test_create_share_link(self, mock_session, sample_user_id, sample_product_id):
        service = ShareService(mock_session)
        data = ShareLinkCreate(
            product_id=sample_product_id,
            required_clicks=5,
            discount_percentage=20,
            max_uses=2,
            expires_in_hours=48,
        )

        result = await service.create_share_link(sample_user_id, data)

        assert result.product_id == sample_product_id
        assert result.required_clicks == 5
        assert result.discount_percentage == 20
        assert result.max_uses == 2
        assert result.share_code is not None
        mock_session.commit.assert_awaited_once()


class TestShareServiceRecordClick:
    @pytest.mark.asyncio
    async def test_record_click_discount_not_yet_activated(self, mock_session):
        share_link = _make_share_link(share_code="SHARE1", required_clicks=3, current_clicks=0)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=share_link)))
        service = ShareService(mock_session)

        result = await service.record_click("SHARE1", "192.168.1.1", "Mozilla/5.0")

        assert result.success is True
        assert result.discount_activated is False
        assert result.remaining == 2
        assert "more clicks needed" in result.message.lower()
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_record_click_discount_activated(self, mock_session):
        share_link = _make_share_link(share_code="SHARE2", required_clicks=3, current_clicks=2)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=share_link)))
        service = ShareService(mock_session)

        result = await service.record_click("SHARE2", "192.168.1.2", "Mozilla/5.0")

        assert result.success is True
        assert result.discount_activated is True
        assert result.remaining == 0
        assert "activated" in result.message.lower()

    @pytest.mark.asyncio
    async def test_record_click_inactive_link(self, mock_session):
        share_link = _make_share_link(share_code="INACTIVE", is_active=False)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=share_link)))
        service = ShareService(mock_session)

        result = await service.record_click("INACTIVE", "192.168.1.3", "Mozilla/5.0")

        assert result.success is False
        assert result.discount_activated is False
        assert "no longer active" in result.message.lower()

    @pytest.mark.asyncio
    async def test_record_click_already_claimed(self, mock_session):
        share_link = _make_share_link(share_code="CLAIMED", is_claimed=True)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=share_link)))
        service = ShareService(mock_session)

        result = await service.record_click("CLAIMED", "192.168.1.4", "Mozilla/5.0")

        assert result.success is False
        assert "already been claimed" in result.message.lower()

    @pytest.mark.asyncio
    async def test_record_click_expired_link(self, mock_session):
        share_link = _make_share_link(share_code="OLD")
        share_link.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=share_link)))
        service = ShareService(mock_session)

        result = await service.record_click("OLD", "192.168.1.5", "Mozilla/5.0")

        assert result.success is False
        assert "expired" in result.message.lower()

    @pytest.mark.asyncio
    async def test_record_click_not_found(self, mock_session):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = ShareService(mock_session)

        with pytest.raises(HTTPException) as exc:
            await service.record_click("NONEXIST", "192.168.1.1", "Mozilla/5.0")

        assert exc.value.status_code == 404
