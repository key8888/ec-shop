import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemInput
from app.services.order_service import OrderService


def _make_product(product_id=None, name="Product", price=1000, stock=10):
    if product_id is None:
        product_id = uuid.uuid4()
    return Product(
        id=product_id,
        name=name,
        description="desc",
        price=price,
        stock=stock,
        created_at=datetime.now(timezone.utc),
    )


def _make_order(order_id=None, user_id=None, total_price=2000, items=None):
    if order_id is None:
        order_id = uuid.uuid4()
    if user_id is None:
        user_id = uuid.uuid4()
    if items is None:
        items = []
    order = Order(
        id=order_id,
        user_id=user_id,
        status="pending",
        total_price=total_price,
        payment_status="unpaid",
        coupon_discount=0,
        items=items,
        created_at=datetime.now(timezone.utc),
    )
    return order


def _make_order_item(product_id=None, product_name="Test Product", quantity=1, unit_price=1000):
    if product_id is None:
        product_id = uuid.uuid4()
    item = OrderItem(
        id=uuid.uuid4(),
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
    )
    item.product_name = product_name
    return item


class TestOrderServiceCreateOrder:
    @pytest.mark.asyncio
    async def test_create_order_success(self, mock_session, sample_user_id):
        product = _make_product(product_id=uuid.UUID("22345678-1234-1234-1234-123456789abc"), stock=5)
        mock_execute_result = MagicMock(scalar_one_or_none=MagicMock(return_value=product))
        mock_session.execute = AsyncMock(return_value=mock_execute_result)
        service = OrderService(mock_session)

        item = OrderItemInput(product_id=product.id, quantity=2)
        data = OrderCreate(items=[item])
        result = await service.create_order(sample_user_id, data)

        assert result.total_price == 2000
        assert result.status == "pending"
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_order_insufficient_stock(self, mock_session, sample_user_id):
        product = _make_product(product_id=uuid.UUID("22345678-1234-1234-1234-123456789abc"), stock=1)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=product)))
        service = OrderService(mock_session)

        item = OrderItemInput(product_id=product.id, quantity=5)
        data = OrderCreate(items=[item])
        with pytest.raises(HTTPException) as exc:
            await service.create_order(sample_user_id, data)

        assert exc.value.status_code == 400
        assert "stock" in exc.value.detail.lower()

    @pytest.mark.asyncio
    async def test_create_order_product_not_found(self, mock_session, sample_user_id):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = OrderService(mock_session)

        item = OrderItemInput(product_id=uuid.uuid4(), quantity=1)
        data = OrderCreate(items=[item])
        with pytest.raises(HTTPException) as exc:
            await service.create_order(sample_user_id, data)

        assert exc.value.status_code == 404


class TestOrderServiceGetOrder:
    @pytest.mark.asyncio
    async def test_get_order_success(self, mock_session, sample_user_id, sample_order_id):
        item = _make_order_item()
        order = _make_order(order_id=sample_order_id, user_id=sample_user_id, items=[item])
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=order)))
        service = OrderService(mock_session)

        result = await service.get_order(sample_order_id, sample_user_id)

        assert result.id == sample_order_id

    @pytest.mark.asyncio
    async def test_get_order_not_found(self, mock_session, sample_user_id, sample_order_id):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = OrderService(mock_session)

        with pytest.raises(HTTPException) as exc:
            await service.get_order(sample_order_id, sample_user_id)

        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_get_order_wrong_user(self, mock_session, sample_order_id):
        other_user_id = uuid.uuid4()
        item = _make_order_item()
        order = _make_order(order_id=sample_order_id, user_id=uuid.UUID("12345678-1234-1234-1234-123456789abc"), items=[item])
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=order)))
        service = OrderService(mock_session)

        with pytest.raises(HTTPException) as exc:
            await service.get_order(sample_order_id, other_user_id)

        assert exc.value.status_code == 403
