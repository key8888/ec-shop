from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_db)):
    service = AuthService(session)
    return await service.register(req)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, response: Response, session: AsyncSession = Depends(get_db)):
    service = AuthService(session)
    result = await service.login(req)
    response.set_cookie(
        key="access_token",
        value=result.access_token,
        httponly=True,
        path="/",
        max_age=1800,
    )
    return result


@router.post("/logout")
async def logout(
    response: Response,
    current_user=Depends(get_current_user),
):
    response.delete_cookie(key="access_token", path="/")
    return {"status": "ok"}


@router.post("/reset-password")
async def reset_password(
    body: dict,
    session: AsyncSession = Depends(get_db),
):
    email = body.get("email")
    new_password = body.get("new_password")
    if not email or not new_password:
        raise HTTPException(status_code=400, detail="email and new_password are required")
    service = AuthService(session)
    await service.reset_password(email, new_password)
    return {"status": "ok"}
