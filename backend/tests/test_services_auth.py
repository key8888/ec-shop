import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService
from app.utils.security import hash_password


def _make_user(email="test@example.com", name="Test User", plaintext_password="correctpass"):
    return User(
        id=uuid.uuid4(),
        email=email,
        name=name,
        password_hash=hash_password(plaintext_password),
        role="customer",
        created_at=datetime.now(timezone.utc),
    )


class TestAuthServiceRegister:
    @pytest.mark.asyncio
    async def test_register_success(self, mock_session):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = AuthService(mock_session)

        req = RegisterRequest(email="new@example.com", password="password123", name="New User")
        result = await service.register(req)

        assert result.email == "new@example.com"
        assert result.name == "New User"
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, mock_session):
        existing_user = _make_user(email="dup@example.com")
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=existing_user)))
        service = AuthService(mock_session)

        req = RegisterRequest(email="dup@example.com", password="password123", name="Dup User")
        with pytest.raises(HTTPException) as exc:
            await service.register(req)

        assert exc.value.status_code == 409
        assert "already registered" in exc.value.detail.lower()


class TestAuthServiceLogin:
    @pytest.mark.asyncio
    async def test_login_success(self, mock_session):
        user = _make_user(email="login@example.com")
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=user)))
        service = AuthService(mock_session)

        req = LoginRequest(email="login@example.com", password="correctpass")
        result = await service.login(req)

        assert result.access_token is not None
        assert result.token_type == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, mock_session):
        user = _make_user(email="login@example.com")
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=user)))
        service = AuthService(mock_session)

        req = LoginRequest(email="login@example.com", password="wrongpass")
        with pytest.raises(HTTPException) as exc:
            await service.login(req)

        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, mock_session):
        mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
        service = AuthService(mock_session)

        req = LoginRequest(email="nobody@example.com", password="whatever")
        with pytest.raises(HTTPException) as exc:
            await service.login(req)

        assert exc.value.status_code == 401
