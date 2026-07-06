from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import date, datetime
from typing import Optional

class BookingInquiryCreate(BaseModel):
    contact_name: str = Field(..., min_length=2, max_length=255)
    contact_phone: str = Field(..., pattern=r"^\d{10}$", description="Exactly 10 digit phone number")
    booking_date: date
    purpose: str = Field(..., min_length=5, max_length=1000)
    hall: str = Field(..., min_length=2, max_length=100)
    event_name: str = Field(..., min_length=2, max_length=255)
    member_count: int = Field(..., ge=1, description="Expected number of attendees")
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "contact_name": "Ramesh Patel",
                "contact_phone": "9876543210",
                "booking_date": "2026-12-15",
                "purpose": "Annual Family Reunion and Wedding Reception",
                "hall": "Main Hall",
                "event_name": "Patel Wedding Ceremony",
                "member_count": 350
            }
        }
    )

    @field_validator("booking_date")
    @classmethod
    def validate_future_date(cls, value: date) -> date:
        if value <= date.today():
            raise ValueError("Booking date must be in the future")
        return value

class BookingInquiryResponse(BaseModel):
    id: int
    profile_id: Optional[int] = None
    contact_name: str
    contact_phone: str
    booking_date: date
    status: str  # "pending", "approved", or "rejected"
    purpose: str
    hall: str
    event_name: str
    booking_type: str  # "member" or "public"
    member_count: int
    admin_remark: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 101,
                "profile_id": 5,
                "contact_name": "Ramesh Patel",
                "contact_phone": "9876543210",
                "booking_date": "2026-12-15",
                "status": "pending",
                "purpose": "Annual Family Reunion and Wedding Reception",
                "hall": "Main Hall",
                "event_name": "Patel Wedding Ceremony",
                "booking_type": "member",
                "member_count": 350,
                "admin_remark": None,
                "created_at": "2026-07-05T10:00:00Z",
                "updated_at": "2026-07-05T10:00:00Z"
            }
        }
    )


class BookingAvailabilityResponse(BaseModel):
    available: bool
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "available": True
            }
        }
    )


