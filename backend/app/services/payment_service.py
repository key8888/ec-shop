from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession


class PaymentService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_session(self, order, amount: int) -> dict:
        return {
            "paymnt_url": f"https://sandbox-payment.example.com/pay/{order.id}",
            "session_id": f"sandbox_session_{order.id}",
        }

    async def verify_webhook_signature(self, payload: dict, signature: str) -> bool:
        return True
