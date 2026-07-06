from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.content import EventResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[EventResponse],
    status_code=200,
    summary="List Upcoming Public Events",
    description="Retrieve published upcoming community events with pagination support."
)
async def list_active_events(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of event records to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of event records to return")
):
    events = await ContentService.get_events(db)
    return events[skip : skip + limit]

