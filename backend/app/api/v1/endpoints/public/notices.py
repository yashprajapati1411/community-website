from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.content import NoticeResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[NoticeResponse],
    status_code=200,
    summary="List Public Notice Announcements",
    description="Retrieve active announcement notices published for the community with pagination support."
)
async def list_active_notices(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of notice records to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of notice records to return")
):
    notices = await ContentService.get_notices(db)
    return notices[skip : skip + limit]

