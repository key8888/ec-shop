from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.categories import router as categories_router
from app.api.orders import router as orders_router
from app.api.webhooks import router as webhooks_router
from app.api.pets import router as pets_router
from app.api.tryon import router as tryon_router
from app.api.addresses import router as addresses_router
from app.api.postal_code import router as postal_code_router
from app.api.coupons import router as coupons_router
from app.api.share import router as share_router
from app.api.admin import router as admin_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(orders_router, prefix="/orders", tags=["orders"])
api_router.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(pets_router, prefix="/pets", tags=["pets"])
api_router.include_router(tryon_router, prefix="/tryon", tags=["tryon"])
api_router.include_router(addresses_router, prefix="/addresses", tags=["addresses"])
api_router.include_router(postal_code_router, prefix="/postal-code", tags=["postal-code"])
api_router.include_router(coupons_router, prefix="/coupons", tags=["coupons"])
api_router.include_router(share_router, prefix="/share", tags=["share"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
