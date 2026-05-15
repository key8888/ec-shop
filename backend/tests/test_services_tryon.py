import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.services.tryon_service import TryOnService
from app.schemas.tryon import TryOnRequest


class TestTryOnServiceGenerate:
    @pytest.mark.asyncio
    async def test_generate_success(self, mock_session, sample_user_id, sample_product_id, sample_pet_id):
        mock_count_result = MagicMock(scalar_one=MagicMock(return_value=0))
        mock_session.execute = AsyncMock(return_value=mock_count_result)
        service = TryOnService(mock_session)

        request = TryOnRequest(pet_id=sample_pet_id, product_id=sample_product_id, angle="angle45")
        result = await service.generate(sample_user_id, request)

        assert result.image_url is not None
        assert result.angle == "angle45"
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_generate_at_limit(self, mock_session, sample_user_id, sample_product_id, sample_pet_id):
        mock_count_result = MagicMock(scalar_one=MagicMock(return_value=3))
        mock_session.execute = AsyncMock(return_value=mock_count_result)
        service = TryOnService(mock_session)

        request = TryOnRequest(pet_id=sample_pet_id, product_id=sample_product_id, angle="angle45")
        result = await service.generate(sample_user_id, request)

        assert result.angle == "angle45"

    @pytest.mark.asyncio
    async def test_generate_exceeds_limit(self, mock_session, sample_user_id, sample_product_id, sample_pet_id):
        mock_count_result = MagicMock(scalar_one=MagicMock(return_value=4))
        mock_session.execute = AsyncMock(return_value=mock_count_result)
        service = TryOnService(mock_session)

        request = TryOnRequest(pet_id=sample_pet_id, product_id=sample_product_id, angle="angle45")
        with pytest.raises(HTTPException) as exc:
            await service.generate(sample_user_id, request)

        assert exc.value.status_code == 400
        assert "maximum" in exc.value.detail.lower()
