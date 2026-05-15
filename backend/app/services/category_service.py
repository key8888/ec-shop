from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: CategoryCreate) -> CategoryResponse:
        category = Category(**data.model_dump())
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        return CategoryResponse.model_validate(category)

    async def list(self) -> list[CategoryResponse]:
        result = await self.session.execute(select(Category))
        categories = result.scalars().all()
        return [CategoryResponse.model_validate(c) for c in categories]

    async def delete(self, category_id: UUID) -> None:
        result = await self.session.execute(
            select(Category).where(Category.id == category_id)
        )
        category = result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        await self.session.delete(category)
        await self.session.commit()
