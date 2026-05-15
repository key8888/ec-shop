import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService


def _make_product(product_id=None, name="Test Product", price=1000, stock=10):
    if product_id is None:
        product_id = uuid.uuid4()
    return Product(
        id=product_id,
        name=name,
        description="A test product",
        price=price,
        stock=stock,
        category_id=None,
        thumbnail_url=None,
        created_at=datetime.now(timezone.utc),
    )


class TestProductServiceCreate:
    @pytest.mark.asyncio
    async def test_create_success(self, mock_session):
        service = ProductService(mock_session)
        data = ProductCreate(name="New Product", price=500, stock=5)

        result = await service.create(data)

        assert result.name == "New Product"
        assert result.price == 500
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()


class TestProductServiceGet:
    @pytest.mark.asyncio
    async def test_get_success(self, mock_session, sample_product_id):
        product = _make_product(product_id=sample_product_id, name="Found Product")
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=product)))
        service = ProductService(mock_session)

        result = await service.get(sample_product_id)

        assert result.name == "Found Product"

    @pytest.mark.asyncio
    async def test_get_not_found(self, mock_session, sample_product_id):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = ProductService(mock_session)

        with pytest.raises(HTTPException) as exc:
            await service.get(sample_product_id)

        assert exc.value.status_code == 404


class TestProductServiceList:
    @pytest.mark.asyncio
    async def test_list(self, mock_session):
        products = [_make_product(name=f"Product {i}") for i in range(2)]

        mock_count_result = MagicMock()
        mock_count_result.scalar_one = MagicMock(return_value=2)

        mock_items_result = MagicMock()
        mock_items_result.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=products)))

        mock_session.execute = AsyncMock(side_effect=[mock_count_result, mock_items_result])
        service = ProductService(mock_session)

        result = await service.list(page=1, per_page=10)

        assert result.total == 2
        assert len(result.items) == 2
        assert result.page == 1


class TestProductServiceUpdate:
    @pytest.mark.asyncio
    async def test_update_success(self, mock_session, sample_product_id):
        product = _make_product(product_id=sample_product_id, name="Old Name")
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=product)))
        service = ProductService(mock_session)

        data = ProductUpdate(name="New Name", price=1500)
        result = await service.update(sample_product_id, data)

        assert result.name == "New Name"
        assert result.price == 1500
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_update_not_found(self, mock_session, sample_product_id):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = ProductService(mock_session)

        data = ProductUpdate(name="New Name")
        with pytest.raises(HTTPException) as exc:
            await service.update(sample_product_id, data)

        assert exc.value.status_code == 404


class TestProductServiceDelete:
    @pytest.mark.asyncio
    async def test_delete_success(self, mock_session, sample_product_id):
        product = _make_product(product_id=sample_product_id)
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=product)))
        service = ProductService(mock_session)

        result = await service.delete(sample_product_id)

        assert result is None
        mock_session.delete.assert_awaited_once()
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_delete_not_found(self, mock_session, sample_product_id):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = ProductService(mock_session)

        with pytest.raises(HTTPException) as exc:
            await service.delete(sample_product_id)

        assert exc.value.status_code == 404
