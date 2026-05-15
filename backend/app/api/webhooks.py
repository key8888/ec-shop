from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/komoju")
async def komoju_webhook(payload: dict, session: AsyncSession = Depends(get_db)):
    service = OrderService(session)
    await service.handle_webhook(payload)
    return {"status": "ok"}
