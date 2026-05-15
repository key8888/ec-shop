from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.user import User
from app.models.product import Product
from app.models.share_link import ShareLink


class AdminService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_dashboard_data(self) -> dict:
        revenue_result = await self.session.execute(
            select(func.coalesce(func.sum(Order.total_price), 0)).where(
                Order.payment_status == "paid"
            )
        )
        total_revenue = revenue_result.scalar_one()

        orders_result = await self.session.execute(
            select(func.count(Order.id))
        )
        total_orders = orders_result.scalar_one()

        users_result = await self.session.execute(
            select(func.count(User.id))
        )
        total_users = users_result.scalar_one()

        out_of_stock_result = await self.session.execute(
            select(func.count(Product.id)).where(Product.stock == 0)
        )
        out_of_stock = out_of_stock_result.scalar_one()

        return {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_users": total_users,
            "out_of_stock": out_of_stock,
        }

    async def get_customers(self, page: int, per_page: int) -> dict:
        skip = (page - 1) * per_page
        count_result = await self.session.execute(
            select(func.count(User.id))
        )
        total = count_result.scalar_one()

        result = await self.session.execute(
            select(User).offset(skip).limit(per_page).order_by(User.created_at.desc())
        )
        users = result.scalars().all()

        return {
            "items": [
                {
                    "id": u.id,
                    "email": u.email,
                    "name": u.name,
                    "role": u.role,
                    "created_at": u.created_at,
                }
                for u in users
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    async def get_customer_detail(self, customer_id: UUID) -> dict:
        result = await self.session.execute(
            select(User).where(User.id == customer_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return {}

        orders_result = await self.session.execute(
            select(func.count(Order.id)).where(Order.user_id == customer_id)
        )
        order_count = orders_result.scalar_one()

        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "created_at": user.created_at,
            "order_count": order_count,
        }

    async def get_share_links(
        self, page: int, per_page: int, status_filter: str | None
    ) -> dict:
        skip = (page - 1) * per_page
        count_stmt = select(func.count(ShareLink.id))

        if status_filter == "active":
            count_stmt = count_stmt.where(ShareLink.is_active == True)
        elif status_filter == "claimed":
            count_stmt = count_stmt.where(ShareLink.is_claimed == True)

        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = select(ShareLink).order_by(ShareLink.created_at.desc())
        if status_filter == "active":
            stmt = stmt.where(ShareLink.is_active == True)
        elif status_filter == "claimed":
            stmt = stmt.where(ShareLink.is_claimed == True)

        result = await self.session.execute(stmt.offset(skip).limit(per_page))
        links = result.scalars().all()

        return {
            "items": [
                {
                    "id": link.id,
                    "share_code": link.share_code,
                    "product_id": link.product_id,
                    "sharer_id": link.sharer_id,
                    "current_clicks": link.current_clicks,
                    "required_clicks": link.required_clicks,
                    "discount_percentage": link.discount_percentage,
                    "is_active": link.is_active,
                    "is_claimed": link.is_claimed,
                    "expires_at": link.expires_at,
                    "created_at": link.created_at,
                }
                for link in links
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        }
