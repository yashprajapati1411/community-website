from fastapi import APIRouter
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import members
from app.api.v1.endpoints import booking_inquiries
from app.api.v1.endpoints.admin import admin_router
from app.api.v1.endpoints.public import public_router

api_router = APIRouter()

# Include authentication, member, booking inquiry, public, and administrative endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(members.router, prefix="/members", tags=["Member Portal"])
api_router.include_router(booking_inquiries.router, prefix="/bookings", tags=["Booking Inquiries"])
api_router.include_router(admin_router, prefix="/admin")
api_router.include_router(public_router, prefix="/public")

