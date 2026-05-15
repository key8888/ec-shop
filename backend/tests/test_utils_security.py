from datetime import timedelta

import pytest

from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token


class TestSecurity:
    def test_hash_and_verify_password(self):
        hashed = hash_password("testpass123")
        assert verify_password("testpass123", hashed)
        assert not verify_password("wrongpass", hashed)

    def test_create_and_decode_token(self):
        token = create_access_token({"sub": "test-user-id"})
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "test-user-id"

    def test_decode_invalid_token(self):
        assert decode_access_token("invalid-token") is None

    def test_token_with_custom_expiry(self):
        token = create_access_token({"sub": "user"}, expires_delta=timedelta(hours=1))
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "user"
