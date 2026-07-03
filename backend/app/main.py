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
                await UserRepository.create(
                    db,
                    email=settings.FIRST_SUPERUSER,
                    hashed_password=hashed_pw,
                    role="admin"
                )
                logger.info(f"Default administrator account seeded: {settings.FIRST_SUPERUSER}")
            else:
                logger.info(f"Administrator account already exists: {settings.FIRST_SUPERUSER}")
    yield

# Initialize FastAPI app with lifespan manager
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend API services for SSPV Mandala Community Website",
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

# Include core API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }
