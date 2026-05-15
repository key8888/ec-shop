from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderHistoryResponse,
    PaymentSessionResponse,
)


class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_order(self, user_id: UUID, data: OrderCreate) -> OrderResponse:
        total_price = 0
        order_items = []

        for item_input in data.items:
            result = await self.session.execute(
                select(Product).where(Product.id == item_input.product_id)
            )
            product = result.scalar_one_or_none()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item_input.product_id} not found")
            if product.stock < item_input.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product {product.name}",
                )
            product.stock -= item_input.quantity
            total_price += product.price * item_input.quantity
            order_items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=item_input.quantity,
                    unit_price=product.price,
                    patches_config=item_input.patches_config,
                )
            )

        coupon_discount = data.coupon_discount or 0

        order = Order(
            user_id=user_id,
            total_price=max(total_price - coupon_discount, 0),
            status="pending",
            payment_status="unpaid",
            coupon_code=data.coupon_code,
            coupon_discount=coupon_discount,
            items=order_items,
        )
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)

        return OrderResponse.model_validate(order)

    async def get_order(self, order_id: UUID, user_id: UUID) -> OrderResponse:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return OrderResponse.model_validate(order)

    async def get_order_history(
        self, user_id: UUID, page: int, per_page: int
    ) -> OrderHistoryResponse:
        skip = (page - 1) * per_page
        count_result = await self.session.execute(
            select(func.count(Order.id)).where(Order.user_id == user_id)
        )
        total = count_result.scalar_one()

        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(per_page)
        )
        orders = result.scalars().all()
        return OrderHistoryResponse(
            items=[OrderResponse.model_validate(o) for o in orders],
            total=total,
            page=page,
            per_page=per_page,
        )

    async def create_payment_session(self, order_id: UUID) -> PaymentSessionResponse:
        result = await self.session.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment_url = f"https://sandbox-payment.example.com/pay/{order_id}"
        order.payment_status = "pending"
        order.komoju_session_id = f"sandbox_session_{order_id}"
        await self.session.commit()

        return PaymentSessionResponse(payment_url=payment_url)

    async def handle_webhook(self, payload: dict) -> None:
        order_id = payload.get("order_id") or payload.get("data", {}).get("order_id")
        status = payload.get("status") or payload.get("data", {}).get("status", "")
        if not order_id:
            return
        result = await self.session.execute(
            select(Order).where(Order.id == order_id)
            if isinstance(order_id, str) and len(order_id) == 36
            else select(Order).where(Order.komoju_session_id == str(order_id))
        )
        order = result.scalar_one_or_none()
        if not order:
            return
        if status in ("completed", "captured", "paid"):
            order.payment_status = "paid"
            order.status = "confirmed"
        elif status in ("failed", "expired", "cancelled"):
            order.payment_status = status
            order.status = "cancelled"
        await self.session.commit()
