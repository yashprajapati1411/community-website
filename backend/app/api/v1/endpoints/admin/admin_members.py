from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.member import MemberProfileResponse
from app.services.member_service import MemberService

router = APIRouter()

@router.get(
    "",
    response_model=List[MemberProfileResponse],
    status_code=200,
    summary="List All Member Profiles",
    description="Retrieve all community member profiles across the platform, optionally filtering by verification status."
)
async def list_member_profiles(
    verified: Optional[bool] = Query(None, description="Filter profiles by verification status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all registered member profiles (Admin only)."""
    return await MemberService.get_all_profiles_admin(db, current_user, is_verified=verified)

@router.post(
    "/{id}/verify",
    response_model=MemberProfileResponse,
    status_code=200,
    summary="Set Member Verification Status",
    description="Approve or revoke verification status for a community member profile."
)
async def verify_member_profile(
    id: int = Path(..., description="Unique profile ID of the member to verify/unverify"),
    is_verified: bool = Query(..., description="Target verification status to apply (true for verified, false to revoke)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set verification status on a member profile (Admin only)."""
    return await MemberService.verify_profile_admin(db, current_user, id, is_verified=is_verified)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Member Profile",
    description="Soft-delete a member profile and cascadingly soft-delete all registered family relatives under it."
)
async def delete_member_profile(
    id: int = Path(..., description="Unique ID of the member profile to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete a member profile and cascadingly soft-delete their family relatives (Admin only)."""
    await MemberService.delete_profile_admin(db, current_user, id)
    return None

