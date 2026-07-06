from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import CommitteeMemberResponse, CommitteeMemberCreate, CommitteeMemberUpdate
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[CommitteeMemberResponse],
    status_code=200,
    summary="List All Committee Profiles",
    description="Retrieve all committee profiles, including both active and inactive leadership records (Admin only)."
)
async def list_committee_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all committee profiles, both active and inactive (Admin only)."""
    return await ContentService.get_all_committee_members_admin(db, current_user)

@router.post(
    "",
    response_model=CommitteeMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Committee Profile",
    description="Create and publish a new executive committee profile with designation, term dates, and display order."
)
async def create_committee_member(
    member_data: CommitteeMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new committee profile (Admin only)."""
    return await ContentService.create_committee_member(db, current_user, member_data)

@router.put(
    "/{id}",
    response_model=CommitteeMemberResponse,
    status_code=200,
    summary="Update Committee Profile",
    description="Update fields on an existing committee profile record."
)
async def update_committee_member(
    member_data: CommitteeMemberUpdate,
    id: int = Path(..., description="Unique ID of the committee profile to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing committee profile (Admin only)."""
    return await ContentService.update_committee_member(db, current_user, id, member_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Committee Profile",
    description="Permanently remove a committee member profile from platform archives."
)
async def delete_committee_member(
    id: int = Path(..., description="Unique ID of the committee profile to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hard-delete a committee profile (Admin only)."""
    await ContentService.delete_committee_member(db, current_user, id)
    return None

