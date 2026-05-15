from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_admin
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services.product_service import ProductService

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: UUID | None = Query(None),
    keyword: str | None = Query(None),
    session: AsyncSession = Depends(get_db),
):
    service = ProductService(session)
    return await service.list(page=page, per_page=per_page, category_id=category_id, keyword=keyword)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, session: AsyncSession = Depends(get_db)):
    service = ProductService(session)
    return await service.get(product_id)


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    session: AsyncSession = Depends(get_db),
    _current_user=Depends(require_admin),
):
    service = ProductService(session)
    return await service.create(data)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    session: AsyncSession = Depends(get_db),
    _current_user=Depends(require_admin),
):
    service = ProductService(session)
    return await service.update(product_id, data)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    session: AsyncSession = Depends(get_db),
    _current_user=Depends(require_admin),
):
    service = ProductService(session)
    await service.delete(product_id)
