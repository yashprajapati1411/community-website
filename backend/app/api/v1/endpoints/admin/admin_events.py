from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import EventResponse, EventCreate, EventUpdate
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[EventResponse],
    status_code=200,
    summary="List All Community Events",
    description="Retrieve all community events, including draft, published, and cancelled records (Admin only)."
)
async def list_all_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all events, including drafts and cancelled ones (Admin only)."""
    return await ContentService.get_all_events_admin(db, current_user)

@router.post(
    "",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Community Event",
    description="Create a new community event or gathering with registration deadlines, capacities, and cover image."
)
async def create_community_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new community event (Admin only)."""
    return await ContentService.create_event(db, current_user, event_data)

@router.put(
    "/{id}",
    response_model=EventResponse,
    status_code=200,
    summary="Update Community Event",
    description="Update fields on an existing community event record."
)
async def update_community_event(
    event_data: EventUpdate,
    id: int = Path(..., description="Unique ID of the event record to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing community event (Admin only)."""
    return await ContentService.update_event(db, current_user, id, event_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Community Event",
    description="Soft-delete a community event record from active publication boards."
)
async def delete_community_event(
    id: int = Path(..., description="Unique ID of the event record to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete a community event (Admin only)."""
    await ContentService.delete_event(db, current_user, id)
    return None

