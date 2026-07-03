from fastapi import APIRouter
from app.api.v1.router import api_router as v1_router

router = APIRouter()

# Include version 1 API router
router.include_router(v1_router, prefix="/v1")
