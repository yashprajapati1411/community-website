from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from app.models.base import Base, TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.member import MemberProfile

class Booking(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("member_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # "pending", "approved", or "rejected"
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    hall: Mapped[str] = mapped_column(String(100), nullable=False)
    event_name: Mapped[str] = mapped_column(String(255), nullable=False)
    booking_type: Mapped[str] = mapped_column(String(50), default="member", nullable=False)  # "member" or "public"
    member_count: Mapped[int] = mapped_column(default=0, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # "pending", "paid", or "refunded"
    admin_remark: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    profile: Mapped["MemberProfile | None"] = relationship(back_populates="bookings")
