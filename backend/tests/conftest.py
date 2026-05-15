import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


def _populate_model_defaults(instance):
    if instance.id is None:
        instance.id = uuid.uuid4()
    if hasattr(instance, "created_at") and instance.created_at is None:
        instance.created_at = datetime.now(timezone.utc)
    if hasattr(instance, "updated_at") and instance.updated_at is None:
        instance.updated_at = datetime.now(timezone.utc)
    if hasattr(instance, "role") and instance.role is None:
        instance.role = "customer"
    if hasattr(instance, "coupon_discount") and instance.coupon_discount is None:
        instance.coupon_discount = 0
    if hasattr(instance, "current_clicks") and instance.current_clicks is None:
        instance.current_clicks = 0
    if hasattr(instance, "is_active") and instance.is_active is None:
        instance.is_active = True
    if hasattr(instance, "is_claimed") and instance.is_claimed is None:
        instance.is_claimed = False
    if hasattr(instance, "items"):
        for item in instance.items:
            _populate_model_defaults(item)
            if not hasattr(item, "product_name"):
                product = getattr(item, "product", None)
                if product and hasattr(product, "name"):
                    item.product_name = product.name
                else:
                    item.product_name = "Test Product"


@pytest.fixture
def mock_session():
    session = AsyncMock()
    session.add = MagicMock()
    session.delete = AsyncMock()
    session.flush = AsyncMock()

    async def _mock_commit():
        pass

    async def _mock_refresh(instance, attribute_names=None):
        _populate_model_defaults(instance)

    session.commit = AsyncMock(side_effect=_mock_commit)
    session.refresh = AsyncMock(side_effect=_mock_refresh)
    session.execute = AsyncMock()
    return session


@pytest.fixture
def sample_user_id():
    return uuid.UUID("12345678-1234-1234-1234-123456789abc")


@pytest.fixture
def sample_product_id():
    return uuid.UUID("22345678-1234-1234-1234-123456789abc")


@pytest.fixture
def sample_order_id():
    return uuid.UUID("32345678-1234-1234-1234-123456789abc")


@pytest.fixture
def sample_coupon_id():
    return uuid.UUID("42345678-1234-1234-1234-123456789abc")


@pytest.fixture
def sample_pet_id():
    return uuid.UUID("52345678-1234-1234-1234-123456789abc")
