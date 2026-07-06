from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import date, datetime
from typing import Optional, List

# --- NOTICE SCHEMAS ---
class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5)
    priority: str = Field("medium", pattern="^(low|medium|high)$")
    publish_date: date
    expiry_date: Optional[date] = None
    attachment: Optional[str] = Field(None, max_length=512)
    show_on_homepage: bool = True
    is_pinned: bool = False
    is_active: bool = True
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Annual General Meeting 2026",
                "description": "The AGM of SSPV Mandala will be held at Main Hall on Sunday, 10th August.",
                "priority": "high",
                "publish_date": "2026-07-01",
                "expiry_date": "2026-08-11",
                "show_on_homepage": True,
                "is_pinned": True,
                "is_active": True
            }
        }
    )

class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=5)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    publish_date: Optional[date] = None
    expiry_date: Optional[date] = None
    attachment: Optional[str] = Field(None, max_length=512)
    show_on_homepage: Optional[bool] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None

class NoticeResponse(NoticeCreate):
    id: int
    published_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "title": "Annual General Meeting 2026",
                "description": "The AGM of SSPV Mandala will be held at Main Hall on Sunday, 10th August.",
                "priority": "high",
                "publish_date": "2026-07-01",
                "expiry_date": "2026-08-11",
                "attachment": None,
                "show_on_homepage": True,
                "is_pinned": True,
                "is_active": True,
                "published_by": 1,
                "created_at": "2026-07-01T10:00:00Z",
                "updated_at": "2026-07-01T10:00:00Z"
            }
        }
    )



# --- EVENT SCHEMAS ---
class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5)
    event_date: date
    location: str = Field(..., min_length=2, max_length=255)
    status: str = Field("draft", pattern="^(draft|published|cancelled)$")
    cover_image: Optional[str] = Field(None, max_length=512)
    is_featured: bool = False
    registration_deadline: Optional[date] = None
    max_capacity: Optional[int] = Field(None, ge=1)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Navratri Mahotsav 2026",
                "description": "Grand celebration of Navratri with traditional Garba and Dandiya Raas.",
                "event_date": "2026-10-15",
                "location": "SSPV Mandala Community Hall Grounds",
                "status": "published",
                "is_featured": True,
                "registration_deadline": "2026-10-10",
                "max_capacity": 1000
            }
        }
    )

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, min_length=5)
    event_date: Optional[date] = None
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    status: Optional[str] = Field(None, pattern="^(draft|published|cancelled)$")
    cover_image: Optional[str] = Field(None, max_length=512)
    is_featured: Optional[bool] = None
    registration_deadline: Optional[date] = None
    max_capacity: Optional[int] = Field(None, ge=1)

class EventResponse(EventCreate):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 5,
                "title": "Navratri Mahotsav 2026",
                "description": "Grand celebration of Navratri with traditional Garba and Dandiya Raas.",
                "event_date": "2026-10-15",
                "location": "SSPV Mandala Community Hall Grounds",
                "status": "published",
                "cover_image": "/uploads/events/navratri2026.jpg",
                "is_featured": True,
                "registration_deadline": "2026-10-10",
                "max_capacity": 1000,
                "created_by": 1,
                "created_at": "2026-07-01T10:00:00Z",
                "updated_at": "2026-07-01T10:00:00Z"
            }
        }
    )



# --- COMMITTEE MEMBER SCHEMAS ---
class CommitteeMemberCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    designation: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    term_start: date
    term_end: Optional[date] = None
    image_url: Optional[str] = Field(None, max_length=512)
    display_order: int = 0
    is_active: bool = True
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Shri Bhavesh Patel",
                "designation": "President",
                "phone": "+91 9876543210",
                "email": "president@sspvmandala.com",
                "term_start": "2025-01-01",
                "term_end": "2027-12-31",
                "display_order": 1,
                "is_active": True
            }
        }
    )

class CommitteeMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    designation: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    term_start: Optional[date] = None
    term_end: Optional[date] = None
    image_url: Optional[str] = Field(None, max_length=512)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CommitteeMemberResponse(CommitteeMemberCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Shri Bhavesh Patel",
                "designation": "President",
                "phone": "+91 9876543210",
                "email": "president@sspvmandala.com",
                "term_start": "2025-01-01",
                "term_end": "2027-12-31",
                "image_url": "/uploads/committee/bhavesh.jpg",
                "display_order": 1,
                "is_active": True,
                "created_at": "2025-01-01T10:00:00Z",
                "updated_at": "2025-01-01T10:00:00Z"
            }
        }
    )



# --- GALLERY SCHEMAS ---
class GalleryImageCreate(BaseModel):
    caption: Optional[str] = Field(None, max_length=255)
    image_url: str = Field(..., min_length=2, max_length=512)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "caption": "Cultural Program Opening Ceremony",
                "image_url": "/uploads/gallery/cultural_opening.jpg"
            }
        }
    )

class GalleryImageResponse(GalleryImageCreate):
    id: int
    album_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "album_id": 1,
                "caption": "Cultural Program Opening Ceremony",
                "image_url": "/uploads/gallery/cultural_opening.jpg",
                "created_at": "2026-07-01T10:00:00Z",
                "updated_at": "2026-07-01T10:00:00Z"
            }
        }
    )


class GalleryAlbumCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=512)
    display_order: int = 0
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Annual Gathering 2025",
                "description": "Photos from our annual community get-together and cultural awards night.",
                "cover_image": "/uploads/gallery/cover_2025.jpg",
                "display_order": 1
            }
        }
    )

class GalleryAlbumUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=512)
    display_order: Optional[int] = None

class GalleryAlbumResponse(GalleryAlbumCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "title": "Annual Gathering 2025",
                "description": "Photos from our annual community get-together and cultural awards night.",
                "cover_image": "/uploads/gallery/cover_2025.jpg",
                "display_order": 1,
                "created_at": "2025-12-01T10:00:00Z",
                "updated_at": "2025-12-01T10:00:00Z"
            }
        }
    )


class GalleryAlbumWithImagesResponse(GalleryAlbumResponse):
    images: List[GalleryImageResponse] = []



# --- SURNAME HISTORY SCHEMAS ---
class SurnameHistoryCreate(BaseModel):
    surname: str = Field(..., min_length=2, max_length=100)
    native_region: str = Field(..., min_length=2, max_length=255)
    history: str = Field(..., min_length=5)
    description: Optional[str] = None
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "surname": "Patel",
                "native_region": "Saurashtra (Rajkot / Jamnagar)",
                "history": "Historical origins tracing back to traditional agricultural leadership in Saurashtra.",
                "description": "Overview of the prominent lineages residing in Mandala."
            }
        }
    )

class SurnameHistoryUpdate(BaseModel):
    surname: Optional[str] = Field(None, min_length=2, max_length=100)
    native_region: Optional[str] = Field(None, min_length=2, max_length=255)
    history: Optional[str] = Field(None, min_length=5)
    description: Optional[str] = None

class SurnameHistoryResponse(SurnameHistoryCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "surname": "Patel",
                "native_region": "Saurashtra (Rajkot / Jamnagar)",
                "history": "Historical origins tracing back to traditional agricultural leadership in Saurashtra.",
                "description": "Overview of the prominent lineages residing in Mandala.",
                "created_at": "2026-01-01T10:00:00Z",
                "updated_at": "2026-01-01T10:00:00Z"
            }
        }
    )


