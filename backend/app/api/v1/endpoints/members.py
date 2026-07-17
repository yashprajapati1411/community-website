from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user, get_member_user
from app.models.user import User
from app.schemas.member import (
    MemberProfileResponse,
    MemberProfileUpdate,
    FamilyMemberResponse,
    FamilyMemberCreate,
    FamilyMemberUpdate,
    MemberDashboardSummary,
    DirectorySurnameGroupResponse
)
from app.schemas.content import NoticeResponse, EventResponse, MemberAnnouncementResponse
from app.services.member_service import MemberService
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "/me",
    response_model=MemberProfileResponse,
    status_code=200,
    summary="Get My Profile",
    description="Retrieve the profile details of the currently authenticated community member or target user (admin only)."
)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to query")
):
    """Retrieve the logged-in member's profile or target user profile (admin only)."""
    return await MemberService.get_profile(db, current_user, target_user_id=user_id)

@router.put(
    "/me",
    response_model=MemberProfileResponse,
    status_code=200,
    summary="Update My Profile",
    description="Update profile details (address, mobile, full name) for the logged-in community member."
)
async def update_my_profile(
    update_data: MemberProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to update")
):
    """Update member profile details. Members are restricted to their own profiles."""
    return await MemberService.update_profile(db, current_user, update_data, target_user_id=user_id)

@router.get(
    "/dashboard",
    response_model=MemberDashboardSummary,
    status_code=200,
    summary="Get Dashboard Summary",
    description="Retrieve aggregated dashboard counters, latest announcement notice, and next upcoming event for the member portal home."
)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to query")
):
    """Retrieve summary counts and latest announcement/events for portal home."""
    return await MemberService.get_dashboard_summary(db, current_user, target_user_id=user_id)

@router.get(
    "/family",
    response_model=List[FamilyMemberResponse],
    status_code=200,
    summary="List Family Members",
    description="Retrieve a paginated list of family members registered under the logged-in user profile."
)
async def get_family_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to query"),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of records to return")
):
    """Retrieve the family members associated with the profile (paginated)."""
    members = await MemberService.get_family_members(db, current_user, target_user_id=user_id)
    return members[skip : skip + limit]

@router.post(
    "/family",
    response_model=FamilyMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Family Member",
    description="Register a new family relative (child, spouse, parent) under the member's profile."
)
async def create_family_member(
    member_data: FamilyMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to add relative to")
):
    """Add a new relative to the profile."""
    return await MemberService.create_family_member(db, current_user, member_data, target_user_id=user_id)

@router.put(
    "/family/{id}",
    response_model=FamilyMemberResponse,
    status_code=200,
    summary="Update Family Member",
    description="Update details of an existing family relative record. Verifies ownership of the family member record."
)
async def update_family_member(
    update_data: FamilyMemberUpdate,
    id: int = Path(..., description="Unique ID of the family member record to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on a family relative record. Checks profile ownership."""
    return await MemberService.update_family_member(db, current_user, id, update_data)

@router.delete(
    "/family/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Family Member",
    description="Soft-delete a family relative record from the member's profile."
)
async def delete_family_member(
    id: int = Path(..., description="Unique ID of the family member record to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete a relative from the profile. Checks profile ownership."""
    await MemberService.delete_family_member(db, current_user, id)
    return None

@router.get(
    "/notices",
    response_model=List[NoticeResponse],
    status_code=200,
    summary="List Active Notices",
    description="Retrieve a paginated list of active community announcements and notices for members."
)
async def get_notices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_member_user),
    skip: int = Query(0, ge=0, description="Number of notices to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of notices to return")
):
    """Fetch active announcements board (paginated)."""
    notices = await ContentService.get_notices(db)
    return notices[skip : skip + limit]

@router.get(
    "/events",
    response_model=List[EventResponse],
    status_code=200,
    summary="List Upcoming Events",
    description="Retrieve a paginated list of upcoming community events and gatherings."
)
async def get_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_member_user),
    skip: int = Query(0, ge=0, description="Number of events to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of events to return")
):
    """Fetch active upcoming events board (paginated)."""
    events = await ContentService.get_events(db)
    return events[skip : skip + limit]

@router.get(
    "/directory",
    response_model=List[DirectorySurnameGroupResponse],
    status_code=200,
    summary="Get Digital Family Directory",
    description="Retrieve live hierarchical directory of approved community members grouped by Surname."
)
async def get_directory(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_member_user)
):
    """Fetch structured family directory grouped by surname -> head -> members."""
    return await MemberService.get_directory(db)

@router.get(
    "/announcements",
    response_model=List[MemberAnnouncementResponse],
    status_code=200,
    summary="Get Member Announcements",
    description="Retrieve live published portal announcements for logged-in members."
)
async def get_member_announcements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_member_user)
):
    """Fetch published member portal announcements."""
    return await ContentService.get_member_announcements(db)


