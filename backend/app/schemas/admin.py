from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from typing import Optional
from app.schemas.booking import BookingInquiryResponse

class AdminDashboardSummary(BaseModel):
    total_members_count: int
    verified_members_count: int
    pending_bookings_count: int
    upcoming_events_count: int
    active_notices_count: int
    gallery_images_count: int
    committee_members_count: int
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_members_count": 150,
                "verified_members_count": 142,
                "pending_bookings_count": 3,
                "upcoming_events_count": 4,
                "active_notices_count": 6,
                "gallery_images_count": 120,
                "committee_members_count": 15
            }
        }
    )

class BookingReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    amount: Optional[Decimal] = Field(None, ge=0)
    payment_status: Optional[str] = Field(None, pattern="^(pending|paid|refunded)$")
    admin_remark: Optional[str] = Field(None, max_length=1000)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "approved",
                "amount": "15000.00",
                "payment_status": "paid",
                "admin_remark": "Booking confirmed. Cleaning deposit received."
            }
        }
    )

class AdminBookingResponse(BookingInquiryResponse):
    amount: Decimal
    payment_status: str
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 101,
                "profile_id": 5,
                "contact_name": "Ramesh Patel",
                "contact_phone": "9876543210",
                "booking_date": "2026-12-15",
                "status": "approved",
                "purpose": "Annual Family Reunion",
                "hall": "Main Hall",
                "event_name": "Patel Wedding Ceremony",
                "booking_type": "member",
                "member_count": 350,
                "admin_remark": "Booking confirmed. Cleaning deposit received.",
                "amount": "15000.00",
                "payment_status": "paid",
                "created_at": "2026-07-05T10:00:00Z",
                "updated_at": "2026-07-05T10:00:00Z"
            }
        }
    )

class UploadResponse(BaseModel):
    url: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "url": "/uploads/gallery/photo_2026_01.jpg"
            }
        }
    )


