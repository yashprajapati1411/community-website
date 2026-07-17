from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config.settings import settings
from app.logs.logger import setup_logging
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.logging import LoggingMiddleware
from app.core.database import SessionLocal
from app.repositories.repo_user import UserRepository
from app.core.security import get_password_hash
from app.exceptions.common import CustomAppError
from app.api.router import router as api_router

logger = logging.getLogger("app")

# Initialize logger
setup_logging()

# Lifespan context manager to handle database seeding on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Establish local database session for seeding
    async with SessionLocal() as db:
        if settings.ENVIRONMENT == "development" and settings.FIRST_SUPERUSER:
            user = await UserRepository.get_by_email(db, settings.FIRST_SUPERUSER)
            if not user:
                hashed_pw = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
                admin_user = await UserRepository.create(
                    db,
                    email=settings.FIRST_SUPERUSER,
                    hashed_password=hashed_pw,
                    role="admin"
                )
                logger.info(f"Default administrator account seeded: {settings.FIRST_SUPERUSER}")
                
                # Seed corresponding MemberProfile for the admin user
                from app.repositories.repo_member import MemberRepository
                await MemberRepository.create_profile(
                    db,
                    user_id=admin_user.id,
                    full_name="System Administrator",
                    village="SSPV Mandala",
                    address="Admin Office Headquarters",
                    mobile="9999999999"
                )
                await db.commit()
                logger.info(f"Default admin profile seeded for user ID: {admin_user.id}")
            else:
                from app.core.security import verify_password
                if not verify_password(settings.FIRST_SUPERUSER_PASSWORD, user.hashed_password):
                    user.hashed_password = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
                    await db.commit()
                    logger.info(f"Updated default administrator password for: {settings.FIRST_SUPERUSER}")
                else:
                    logger.info(f"Administrator account already exists: {settings.FIRST_SUPERUSER}")
    yield

# OpenAPI tag descriptions for Swagger / Redoc documentation
tags_metadata = [
    {
        "name": "Health",
        "description": "System health check and status monitoring.",
    },
    {
        "name": "Auth",
        "description": "Authentication operations: Login, logout, token refresh, password updates, and RBAC testing.",
    },
    {
        "name": "Member Portal",
        "description": "Operations for verified community members: Profiles, family tree management, and personalized dashboard.",
    },
    {
        "name": "Hall Bookings",
        "description": "Public hall booking inquiries and reservation submissions.",
    },
    {
        "name": "Public APIs",
        "description": "Publicly accessible community data: Committee members, photo galleries, upcoming events, notices, regional history, and hall availability.",
    },
    {
        "name": "Admin Auth",
        "description": "Administrator authentication and token issuance.",
    },
    {
        "name": "Admin Dashboard",
        "description": "Administrator analytics and platform-wide statistical summaries.",
    },
    {
        "name": "Admin Members",
        "description": "Administrative member management, verification, and profile oversight.",
    },
    {
        "name": "Admin Bookings",
        "description": "Administrative booking management: Approvals, rejections, and remark updates.",
    },
    {
        "name": "Admin Committee",
        "description": "Administrative management of executive committee members.",
    },
    {
        "name": "Admin Events",
        "description": "Administrative creation, publishing, and scheduling of community events.",
    },
    {
        "name": "Admin Notices",
        "description": "Administrative management of community announcements and notices.",
    },
    {
        "name": "Admin Gallery",
        "description": "Administrative photo album and gallery image curation.",
    },
    {
        "name": "Admin Regional History",
        "description": "Administrative management of regional surname histories and archives.",
    },
    {
        "name": "Admin Uploads",
        "description": "Storage provider-agnostic file upload services for gallery, events, committee members, and profiles.",
    },
]

# Initialize FastAPI app with lifespan manager and comprehensive documentation metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="""
### SSPV Mandala Community Website Backend API

This API powers the **Shree Saurashtra Patel Samaj (SSPV Mandala)** platform, enabling member networking, hall bookings, event management, and regional heritage preservation.

#### Key Features
* **Authentication & RBAC**: Secure JWT access tokens, HttpOnly refresh cookies, and Role-Based Access Control (`admin`, `member`).
* **Member Portal**: Manage personal profiles, register family members, and view dashboard summaries.
* **Public APIs**: Browse active committee members, upcoming events, notices, gallery albums, surname histories, and check hall availability.
* **Hall Bookings**: Submit booking inquiries and track reservation status.
* **Admin Management**: Full CRUD oversight over members, bookings, events, announcements, and media assets.
* **Storage-Agnostic Uploads**: Integrated local file storage for media with extensible cloud provider abstractions.
""",
    terms_of_service="https://sspvmandala.com/terms/",
    contact={
        "name": "SSPV Mandala Technical Team",
        "url": "https://sspvmandala.com/support",
        "email": "support@sspvmandala.com",
    },
    license_info={
        "name": "Proprietary - SSPV Mandala",
        "url": "https://sspvmandala.com/license",
    },
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    openapi_tags=tags_metadata,
    lifespan=lifespan
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware stack configuration
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# Register global custom error handler for domain exceptions
@app.exception_handler(CustomAppError)
async def custom_app_error_handler(request: Request, exc: CustomAppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

# Mount StaticFiles middleware to serve uploaded image assets using absolute path resolving
from fastapi.staticfiles import StaticFiles
import os
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uploads_dir = os.path.join(base_dir, "uploads")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include core API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(
    "/health",
    tags=["Health"],
    status_code=200,
    summary="System Health Check",
    description="Verify API server liveness, project title, and active environment status."
)
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

