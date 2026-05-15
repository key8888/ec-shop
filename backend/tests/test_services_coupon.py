import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.coupon import Coupon
from app.services.coupon_service import CouponService


def _make_coupon(code="COUPON1", discount_type="percentage", discount_value=10,
                 min_order_amount=None, max_uses=0, current_uses=0,
                 starts_at=None, expires_at=None, is_active=True):
    return Coupon(
        id=uuid.uuid4(),
        code=code,
        discount_type=discount_type,
        discount_value=discount_value,
        min_order_amount=min_order_amount,
        max_uses=max_uses,
        current_uses=current_uses,
        starts_at=starts_at,
        expires_at=expires_at,
        is_active=is_active,
        created_by=None,
        created_at=datetime.now(timezone.utc),
    )


class TestCouponServiceValidate:
    @pytest.mark.asyncio
    async def test_valid_percentage(self, mock_session):
        coupon = _make_coupon(code="SAVE10", discount_type="percentage", discount_value=10)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("SAVE10", 5000)

        assert result.valid is True
        assert result.discount_amount == 500  # 10% of 5000
        assert result.discount_type == "percentage"

    @pytest.mark.asyncio
    async def test_valid_fixed(self, mock_session):
        coupon = _make_coupon(code="FLAT500", discount_type="fixed", discount_value=500)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("FLAT500", 1000)

        assert result.valid is True
        assert result.discount_amount == 500

    @pytest.mark.asyncio
    async def test_fixed_discount_does_not_exceed_order(self, mock_session):
        coupon = _make_coupon(code="FLAT500", discount_type="fixed", discount_value=500)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("FLAT500", 300)

        assert result.valid is True
        assert result.discount_amount == 300  # capped at order amount

    @pytest.mark.asyncio
    async def test_invalid_code(self, mock_session):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("INVALID", 5000)

        assert result.valid is False
        assert "not found" in result.message.lower()

    @pytest.mark.asyncio
    async def test_expired_coupon(self, mock_session):
        past_time = datetime.now(timezone.utc) - timedelta(days=10)
        coupon = _make_coupon(code="EXPIRED", expires_at=past_time)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("EXPIRED", 5000)

        assert result.valid is False
        assert "expired" in result.message.lower()

    @pytest.mark.asyncio
    async def test_min_order_not_met(self, mock_session):
        coupon = _make_coupon(code="MIN5000", discount_type="percentage",
                             discount_value=10, min_order_amount=5000)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("MIN5000", 1000)

        assert result.valid is False
        assert "minimum" in result.message.lower()

    @pytest.mark.asyncio
    async def test_max_uses_reached(self, mock_session):
        coupon = _make_coupon(code="MAXED", max_uses=5, current_uses=5)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("MAXED", 5000)

        assert result.valid is False
        assert "limit" in result.message.lower()

    @pytest.mark.asyncio
    async def test_not_yet_valid(self, mock_session):
        future_time = datetime.now(timezone.utc) + timedelta(days=10)
        coupon = _make_coupon(code="FUTURE", starts_at=future_time)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("FUTURE", 5000)

        assert result.valid is False
        assert "not yet valid" in result.message.lower()

    @pytest.mark.asyncio
    async def test_not_active(self, mock_session):
        coupon = _make_coupon(code="INACTIVE", is_active=False)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=coupon)))
        service = CouponService(mock_session)

        result = await service.validate_and_calculate("INACTIVE", 5000)

        assert result.valid is False
        assert "not active" in result.message.lower()
