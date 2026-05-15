from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, req: RegisterRequest) -> UserResponse:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        user = User(
            email=req.email,
            password_hash=hash_password(req.password),
            name=req.name,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return UserResponse.model_validate(user)

    async def login(self, req: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token)

    async def get_current_user(self, token: str) -> User:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await self.user_repo.get(UUID(payload["sub"]))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    async def reset_password(self, email: str, new_password: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.password_hash = hash_password(new_password)
        await self.session.commit()
