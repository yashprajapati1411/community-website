from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.booking import BookingInquiryResponse, BookingInquiryCreate, BookingAvailabilityResponse
from app.services.booking_service import BookingService

router = APIRouter()

@router.get(
    "/availability",
    response_model=BookingAvailabilityResponse,
    status_code=200,
    summary="Check Hall Availability",
    description="Check if the given community hall is available for reservation on a specific target date."
)
async def check_booking_availability(
    date: date = Query(..., description="Target date to check availability (YYYY-MM-DD)"),
    hall: str = Query(..., min_length=2, description="Target hall name"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if the given hall is available on the target date."""
    is_available = await BookingService.check_hall_availability(db, date, hall)
    return {"available": is_available}

@router.post(
    "/inquiry",
    response_model=BookingInquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Booking Inquiry",
    description="Submit a new hall booking reservation request. Initial status is set to pending until admin review."
)
async def submit_booking_inquiry(
    booking_data: BookingInquiryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: submit inquiry on behalf of user ID")
):
    """Submit a new hall booking inquiry (pending status)."""
    return await BookingService.create_booking_inquiry(
        db=db,
        current_user=current_user,
        booking_data=booking_data,
        target_user_id=user_id
    )

@router.get(
    "/history",
    response_model=List[BookingInquiryResponse],
    status_code=200,
    summary="List My Booking Inquiries",
    description="Retrieve a paginated, sorted, and filtered history of booking inquiries submitted by the member."
)
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Admin only: target user ID to query"),
    status: Optional[str] = Query(None, description="Filter by status (pending, approved, rejected)"),
    sort_by: str = Query("booking_date", description="Field to sort by (booking_date, created_at)"),
    order: str = Query("desc", description="Sort order (asc, desc)"),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of records to return")
):
    """Retrieve non-deleted bookings history registered under the profile with filtering, sorting, and pagination."""
    return await BookingService.get_member_bookings(
        db=db,
        current_user=current_user,
        target_user_id=user_id,
        status=status,
        sort_by=sort_by,
        order=order,
        skip=skip,
        limit=limit
    )

