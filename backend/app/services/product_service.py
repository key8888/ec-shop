from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse


class ProductService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ProductRepository(session)

    async def create(self, data: ProductCreate) -> ProductResponse:
        product = Product(**data.model_dump())
        self.session.add(product)
        await self.session.commit()
        await self.session.refresh(product)
        return ProductResponse.model_validate(product)

    async def get(self, product_id: UUID) -> ProductResponse:
        product = await self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse.model_validate(product)

    async def list(
        self,
        page: int,
        per_page: int,
        category_id: UUID | None = None,
        keyword: str | None = None,
    ) -> ProductListResponse:
        skip = (page - 1) * per_page
        items, total = await self.repo.list_filtered(
            skip=skip, limit=per_page, category_id=category_id, keyword=keyword
        )
        return ProductListResponse(
            items=[ProductResponse.model_validate(p) for p in items],
            total=total,
            page=page,
            per_page=per_page,
        )

    async def update(self, product_id: UUID, data: ProductUpdate) -> ProductResponse:
        product = await self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        await self.session.commit()
        await self.session.refresh(product)
        return ProductResponse.model_validate(product)

    async def delete(self, product_id: UUID) -> None:
        product = await self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        await self.session.delete(product)
        await self.session.commit()
