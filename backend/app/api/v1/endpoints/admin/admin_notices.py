from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import NoticeResponse, NoticeCreate, NoticeUpdate
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[NoticeResponse],
    status_code=200,
    summary="List All Notice Announcements",
    description="Retrieve all community notices, including inactive and expired records (Admin only)."
)
async def list_all_notices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all notices, including inactive and expired ones (Admin only)."""
    return await ContentService.get_all_notices_admin(db, current_user)

@router.post(
    "",
    response_model=NoticeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Announcement Notice",
    description="Publish a new community announcement notice with priority, publish dates, and homepage display toggles."
)
async def create_announcement_notice(
    notice_data: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new notice or announcement (Admin only)."""
    return await ContentService.create_notice(db, current_user, notice_data)

@router.put(
    "/{id}",
    response_model=NoticeResponse,
    status_code=200,
    summary="Update Announcement Notice",
    description="Update title, description, priority, dates, or publication status on an existing notice."
)
async def update_announcement_notice(
    notice_data: NoticeUpdate,
    id: int = Path(..., description="Unique ID of the notice announcement to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing notice (Admin only)."""
    return await ContentService.update_notice(db, current_user, id, notice_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Announcement Notice",
    description="Soft-delete a notice announcement from the active community noticeboard."
)
async def delete_announcement_notice(
    id: int = Path(..., description="Unique ID of the notice announcement to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete an announcement notice (Admin only)."""
    await ContentService.delete_notice(db, current_user, id)
    return None

