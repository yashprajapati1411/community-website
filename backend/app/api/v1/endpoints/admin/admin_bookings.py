from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.admin import BookingReviewRequest, AdminBookingResponse
from app.services.booking_service import BookingService

router = APIRouter()

@router.get(
    "/history",
    response_model=List[AdminBookingResponse],
    status_code=200,
    summary="List All Platform Bookings",
    description="Retrieve all hall booking inquiries across the entire community platform for administrative review."
)
async def list_all_booking_inquiries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all booking inquiries across the entire community platform (Admin only)."""
    return await BookingService.get_all_bookings_admin(db, current_user)

@router.put(
    "/{id}/review",
    response_model=AdminBookingResponse,
    status_code=200,
    summary="Review Booking Inquiry",
    description="Approve or reject a booking inquiry, update pricing quotes, set payment status, and attach admin remarks."
)
async def review_booking_inquiry(
    review_data: BookingReviewRequest,
    id: int = Path(..., description="Unique ID of the booking inquiry to review"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update status, quote, payment status, and admin remarks on a booking inquiry (Admin only)."""
    return await BookingService.review_booking_inquiry(db, current_user, id, review_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Booking Inquiry",
    description="Soft-delete a booking inquiry record from platform archives."
)
async def delete_booking_inquiry(
    id: int = Path(..., description="Unique ID of the booking inquiry to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete a booking inquiry record (Admin only)."""
    await BookingService.delete_booking_admin(db, current_user, id)
    return None

