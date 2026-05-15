import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.schemas.auth import UserResponse, TokenResponse
from app.models.user import User


def _make_user(email="test@example.com", name="Test User", password_hash="hashedpass"):
    return User(
        id=uuid.uuid4(),
        email=email,
        name=name,
        password_hash=password_hash,
        role="customer",
        created_at=datetime.now(timezone.utc),
    )


class TestAuthAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        from app.main import app
        from app.database import get_db
        from app.middleware.auth import get_current_user

        self.app = app
        # Override get_db to avoid real database
        async def override_get_db():
            session = AsyncMock()
            yield session

        app.dependency_overrides[get_db] = override_get_db

        yield

        app.dependency_overrides.clear()

    def test_register_201(self):
        user = _make_user()
        response_mock = UserResponse.model_validate(user)

        with patch("app.api.auth.AuthService") as mock_svc:
            mock_svc.return_value.register = AsyncMock(return_value=response_mock)
            client = TestClient(self.app)
            response = client.post("/api/auth/register", json={
                "email": "new@example.com",
                "password": "password123",
                "name": "New User",
            })

        assert response.status_code == 201
        assert "email" in response.json()

    def test_register_409_duplicate(self):
        from fastapi import HTTPException

        with patch("app.api.auth.AuthService") as mock_svc:
            mock_svc.return_value.register = AsyncMock(
                side_effect=HTTPException(status_code=409, detail="Email already registered")
            )
            client = TestClient(self.app)
            response = client.post("/api/auth/register", json={
                "email": "dup@example.com",
                "password": "password123",
                "name": "Dup User",
            })

        assert response.status_code == 409

    def test_login_200_with_cookie(self):
        with patch("app.api.auth.AuthService") as mock_svc:
            mock_svc.return_value.login = AsyncMock(
                return_value=TokenResponse(access_token="test-token-123")
            )
            client = TestClient(self.app)
            response = client.post("/api/auth/login", json={
                "email": "user@example.com",
                "password": "correctpass",
            })

        assert response.status_code == 200
        assert "access_token" in response.json()
        assert "access_token" in response.cookies

    def test_login_401_wrong_credentials(self):
        from fastapi import HTTPException

        with patch("app.api.auth.AuthService") as mock_svc:
            mock_svc.return_value.login = AsyncMock(
                side_effect=HTTPException(status_code=401, detail="Invalid email or password")
            )
            client = TestClient(self.app)
            response = client.post("/api/auth/login", json={
                "email": "user@example.com",
                "password": "wrongpass",
            })

        assert response.status_code == 401

    def test_logout_200(self):
        from app.middleware.auth import get_current_user

        user = _make_user()
        self.app.dependency_overrides[get_current_user] = lambda: user

        client = TestClient(self.app)
        response = client.post("/api/auth/logout")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
