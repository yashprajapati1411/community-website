from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.schemas.content import (
    MemberAnnouncementCreate,
    MemberAnnouncementUpdate,
    MemberAnnouncementResponse
)
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[MemberAnnouncementResponse],
    status_code=200,
    summary="Admin List All Member Announcements"
)
async def list_member_announcements_admin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """List all member portal announcements (including unpublished)."""
    return await ContentService.get_all_member_announcements_admin(db)

@router.post(
    "",
    response_model=MemberAnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Member Announcement"
)
async def create_member_announcement_admin(
    payload: MemberAnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new member portal announcement."""
    return await ContentService.create_member_announcement_admin(db, payload)

@router.put(
    "/{ann_id}",
    response_model=MemberAnnouncementResponse,
    status_code=200,
    summary="Update Member Announcement"
)
async def update_member_announcement_admin(
    payload: MemberAnnouncementUpdate,
    ann_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Update a member portal announcement."""
    return await ContentService.update_member_announcement_admin(db, ann_id, payload)

@router.delete(
    "/{ann_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Member Announcement"
)
async def delete_member_announcement_admin(
    ann_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Soft delete a member portal announcement."""
    await ContentService.delete_member_announcement_admin(db, ann_id)
    return None
