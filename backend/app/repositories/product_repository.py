from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Product)

    async def list_filtered(
        self,
        skip: int = 0,
        limit: int = 20,
        category_id: UUID | None = None,
        keyword: str | None = None,
    ) -> tuple[list[Product], int]:
        stmt = select(Product)
        count_stmt = select(func.count(Product.id))

        if category_id is not None:
            stmt = stmt.where(Product.category_id == category_id)
            count_stmt = count_stmt.where(Product.category_id == category_id)

        if keyword:
            pattern = f"%{keyword}%"
            stmt = stmt.where(Product.name.ilike(pattern) | Product.description.ilike(pattern))
            count_stmt = count_stmt.where(
                Product.name.ilike(pattern) | Product.description.ilike(pattern)
            )

        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        result = await self.session.execute(stmt.offset(skip).limit(limit))
        items = list(result.scalars().all())

        return items, total
