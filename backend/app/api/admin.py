from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.auth import require_admin
from app.models.order import Order
from app.models.share_link import ShareLink
from app.models.user import User
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponListResponse,
)
from app.schemas.order import OrderResponse, OrderHistoryResponse
from app.schemas.share import ShareLinkAdminSettings
from app.services.admin_service import AdminService
from app.services.coupon_service import CouponService
from app.services.share_service import ShareService

router = APIRouter()


@router.get("/dashboard")
async def dashboard(
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = AdminService(session)
    return await service.get_dashboard_data()


@router.get("/orders", response_model=OrderHistoryResponse)
async def admin_get_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    skip = (page - 1) * per_page
    count_stmt = select(func.count(Order.id))
    if status:
        count_stmt = count_stmt.where(Order.status == status)
    total_result = await session.execute(count_stmt)
    total = total_result.scalar_one()

    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(per_page)
    )
    if status:
        stmt = stmt.where(Order.status == status)

    result = await session.execute(stmt)
    orders = result.scalars().all()
    return OrderHistoryResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def admin_update_order_status(
    order_id: UUID,
    body: dict,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    result = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = body.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="status is required")
    order.status = new_status
    await session.commit()
    await session.refresh(order)
    return OrderResponse.model_validate(order)


@router.get("/customers")
async def admin_get_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = AdminService(session)
    return await service.get_customers(page, per_page)


@router.get("/customers/{customer_id}")
async def admin_get_customer_detail(
    customer_id: UUID,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = AdminService(session)
    return await service.get_customer_detail(customer_id)


@router.get("/analytics")
async def admin_get_analytics(
    _current_user: User = Depends(require_admin),
):
    return {
        "daily_sales": [],
        "category_breakdown": [],
        "conversion_rate": 0.0,
        "average_order_value": 0,
        "top_products": [],
    }


@router.get("/coupons", response_model=CouponListResponse)
async def admin_get_coupons(
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = CouponService(session)
    return await service.list()


@router.post("/coupons", response_model=CouponResponse, status_code=201)
async def admin_create_coupon(
    data: CouponCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = CouponService(session)
    return await service.create(data, current_user.id)


@router.put("/coupons/{coupon_id}", response_model=CouponResponse)
async def admin_update_coupon(
    coupon_id: UUID,
    data: CouponUpdate,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = CouponService(session)
    return await service.update(coupon_id, data)


@router.delete("/coupons/{coupon_id}", status_code=204)
async def admin_delete_coupon(
    coupon_id: UUID,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = CouponService(session)
    await service.delete(coupon_id)


@router.get("/share/settings", response_model=ShareLinkAdminSettings)
async def admin_get_share_settings(
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = ShareService(session)
    return await service.get_admin_settings()


@router.put("/share/settings", response_model=ShareLinkAdminSettings)
async def admin_update_share_settings(
    settings: ShareLinkAdminSettings,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = ShareService(session)
    return await service.update_admin_settings(settings)


@router.get("/share/links")
async def admin_get_share_links(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None),
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    service = AdminService(session)
    return await service.get_share_links(page, per_page, status_filter)


@router.delete("/share/links/{link_id}", status_code=204)
async def admin_delete_share_link(
    link_id: UUID,
    session: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    result = await session.execute(select(ShareLink).where(ShareLink.id == link_id))
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Share link not found")
    link.is_active = False
    await session.commit()
