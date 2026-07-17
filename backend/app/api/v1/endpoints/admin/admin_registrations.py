from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.admin import RegistrationRequestResponse, RegistrationReviewRequest
from app.services.registration_service import RegistrationService

router = APIRouter()

@router.get(
    "",
    response_model=List[RegistrationRequestResponse],
    status_code=200,
    summary="List Registration Requests",
    description="Retrieve all member registration requests, optionally filtering by status."
)
async def list_registration_requests(
    status: Optional[str] = Query(None, description="Filter requests by status (pending, approved, rejected)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List registration requests."""
    return await RegistrationService.list_requests(db, current_user, status=status)

@router.post(
    "/{id}/approve",
    response_model=RegistrationRequestResponse,
    status_code=200,
    summary="Approve Registration Request",
    description="Approve a pending member registration request."
)
async def approve_registration_request(
    id: int = Path(..., description="Registration Request ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a registration request."""
    return await RegistrationService.approve_request(db, current_user, id)

@router.post(
    "/{id}/reject",
    response_model=RegistrationRequestResponse,
    status_code=200,
    summary="Reject Registration Request",
    description="Reject a pending member registration request."
)
async def reject_registration_request(
    id: int = Path(..., description="Registration Request ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a registration request."""
    return await RegistrationService.reject_request(db, current_user, id)

@router.put(
    "/{id}/review",
    response_model=RegistrationRequestResponse,
    status_code=200,
    summary="Review Registration Request",
    description="Approve or reject a member registration request with optional remarks."
)
async def review_registration_request(
    review_data: RegistrationReviewRequest,
    id: int = Path(..., description="Registration Request ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Review a registration request."""
    return await RegistrationService.review_request(db, current_user, id, review_data)
