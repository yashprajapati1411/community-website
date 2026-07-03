from sqlalchemy import String, Text, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import List, TYPE_CHECKING
from app.models.base import Base, TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.user import User

class CommitteeMember(Base, TimestampMixin):
    __tablename__ = "committee_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    designation: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    term_start: Mapped[date] = mapped_column(Date, nullable=False)
    term_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    display_order: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

class Event(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)  # "draft", "published", "cancelled"
    cover_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    is_featured: Mapped[bool] = mapped_column(default=False, nullable=False)
    registration_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    max_capacity: Mapped[int | None] = mapped_column(nullable=True)

    # Relationships
    creator: Mapped["User | None"] = relationship()

class Notice(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notices"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)  # "low", "medium", "high"
    publish_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    attachment: Mapped[str | None] = mapped_column(String(512), nullable=True)
    published_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    show_on_homepage: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # Relationships
    publisher: Mapped["User | None"] = relationship()

class GalleryAlbum(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "gallery_albums"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
    display_order: Mapped[int] = mapped_column(default=0, nullable=False)

    # Relationships
    images: Mapped[List["GalleryImage"]] = relationship(
        back_populates="album",
        cascade="all, delete-orphan"
    )

class GalleryImage(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "gallery_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    album_id: Mapped[int] = mapped_column(
        ForeignKey("gallery_albums.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)

    # Relationships
    album: Mapped["GalleryAlbum"] = relationship(back_populates="images")

class SurnameHistory(Base, TimestampMixin):
    __tablename__ = "surnames_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    surname: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    native_region: Mapped[str] = mapped_column(String(255), nullable=False)
    history: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
