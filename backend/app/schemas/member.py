from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from app.schemas.content import NoticeResponse, EventResponse
from app.schemas.booking import BookingInquiryResponse

class FamilyMemberBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of family member")
    relation: str = Field(..., min_length=2, max_length=50, description="Relation to family head")
    age: int = Field(..., ge=0, le=120, description="Age of family member")
    education: Optional[str] = Field(None, max_length=100)
    occupation: Optional[str] = Field(None, max_length=100)

class FamilyMemberCreate(FamilyMemberBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Suresh Patel",
                "relation": "Son",
                "age": 18,
                "education": "B.Tech Computer Science",
                "occupation": "Student"
            }
        }
    )

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    relation: Optional[str] = Field(None, min_length=2, max_length=50)
    age: Optional[int] = Field(None, ge=0, le=120)
    education: Optional[str] = Field(None, max_length=100)
    occupation: Optional[str] = Field(None, max_length=100)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "education": "M.Tech Computer Science",
                "occupation": "Software Engineer"
            }
        }
    )

class FamilyMemberResponse(FamilyMemberBase):
    id: int
    profile_id: int
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 10,
                "profile_id": 1,
                "name": "Suresh Patel",
                "relation": "Son",
                "age": 18,
                "education": "B.Tech Computer Science",
                "occupation": "Student"
            }
        }
    )


class MemberProfileBase(BaseModel):
    surname: str = Field("General", min_length=1, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    village: str = Field(..., min_length=2, max_length=100)
    city: str = Field("Ahmedabad", min_length=2, max_length=100)
    address: str = Field(..., min_length=5, max_length=255)
    mobile: str = Field(..., pattern=r"^\d{10}$")
    occupation: Optional[str] = Field(None, max_length=150)

class MemberProfileCreate(MemberProfileBase):
    user_id: int

class MemberProfileUpdate(BaseModel):
    surname: Optional[str] = Field(None, min_length=1, max_length=100)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    village: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, min_length=5, max_length=255)
    mobile: Optional[str] = Field(None, pattern=r"^\d{10}$")
    occupation: Optional[str] = Field(None, max_length=150)
    profile_completed: Optional[bool] = None

class MemberProfileResponse(MemberProfileBase):
    id: int
    user_id: int
    is_verified: bool
    profile_completed: bool = True
    email: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DirectoryFamilyMemberResponse(BaseModel):
    id: int
    name: str
    relation: str
    age: int
    occupation: Optional[str] = ""
    education: Optional[str] = ""

class DirectoryFamilyHeadResponse(BaseModel):
    id: str
    name: str
    surname: str
    city: str
    village: str
    contact: str
    email: str
    occupation: str
    address: str
    membersCount: int
    spouse: str
    members: List[DirectoryFamilyMemberResponse]

class DirectorySurnameGroupResponse(BaseModel):
    surname: str
    count: int
    heads: List[DirectoryFamilyHeadResponse]



# Sub-model for dashboard statistics counters
class MemberDashboardStats(BaseModel):
    family_members_count: int
    pending_inquiries_count: int
    approved_inquiries_count: int
    active_notices_count: int
    upcoming_events_count: int

# Aggregated landing page model
class MemberDashboardSummary(BaseModel):
    profile: Optional[MemberProfileResponse] = None
    statistics: MemberDashboardStats
    latest_notice: Optional[NoticeResponse] = None
    next_event: Optional[EventResponse] = None
    next_booking_inquiry: Optional[BookingInquiryResponse] = None
