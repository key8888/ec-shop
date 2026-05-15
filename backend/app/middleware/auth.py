from fastapi import Request, HTTPException, Depends
from app.services.auth_service import AuthService
from app.database import get_db
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


async def get_current_user(request: Request, session: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    auth_service = AuthService(session)
    return await auth_service.get_current_user(token)


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
