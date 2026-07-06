from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.core.database import get_db
from app.schemas.booking import BookingAvailabilityResponse
from app.services.booking_service import BookingService

router = APIRouter()

@router.get(
    "/availability",
    response_model=BookingAvailabilityResponse,
    status_code=200,
    summary="Check Hall Booking Availability",
    description="Check if a specific community hall is available for booking on a target date."
)
async def check_booking_availability(
    date: date = Query(..., description="Target date to check availability (YYYY-MM-DD)"),
    hall: str = Query(..., min_length=2, description="Target hall name"),
    db: AsyncSession = Depends(get_db)
):
    is_available = await BookingService.check_hall_availability(db, date, hall)
    return {"available": is_available}
