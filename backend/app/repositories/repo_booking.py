from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from app.models.booking import Booking

class BookingRepository:
    @staticmethod
    async def get_booking_inquiries_by_profile_id(
        db: AsyncSession,
        profile_id: int,
        status: str | None = None,
        sort_by: str = "booking_date",
        order: str = "desc",
        skip: int = 0,
        limit: int = 100
    ) -> list[Booking]:
        """Fetch bookings made by a specific profile that are not soft-deleted, with filtering, sorting, and pagination."""
        stmt = (
            select(Booking)
            .where(Booking.profile_id == profile_id)
            .where(Booking.deleted_at == None)
        )
        
        if status:
            stmt = stmt.where(Booking.status == status)
            
        sort_column = Booking.booking_date
        if sort_by == "created_at":
            sort_column = Booking.created_at
            
        if order == "asc":
            stmt = stmt.order_by(sort_column.asc())
        else:
            stmt = stmt.order_by(sort_column.desc())
            
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_bookings(db: AsyncSession) -> list[Booking]:
        """Fetch all bookings across the platform that are not soft-deleted."""
        stmt = (
            select(Booking)
            .where(Booking.deleted_at == None)
            .order_by(Booking.booking_date.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_bookings_count_by_status(db: AsyncSession, profile_id: int, status: str) -> int:
        """Count bookings matching a status for a profile."""
        stmt = (
            select(func.count(Booking.id))
            .where(Booking.profile_id == profile_id)
            .where(Booking.status == status)
            .where(Booking.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def create_booking(
        db: AsyncSession,
        profile_id: int,
        contact_name: str,
        contact_phone: str,
        booking_date: date,
        purpose: str,
        hall: str,
        event_name: str,
        member_count: int
    ) -> Booking:
        """Insert a new booking inquiry in a pending state."""
        booking = Booking(
            profile_id=profile_id,
            contact_name=contact_name,
            contact_phone=contact_phone,
            booking_date=booking_date,
            purpose=purpose,
            hall=hall,
            event_name=event_name,
            booking_type="member",
            member_count=member_count,
            status="pending",
            amount=0.00,
            payment_status="pending"
        )
        db.add(booking)
        await db.flush()
        return booking

    @staticmethod
    async def check_availability(db: AsyncSession, target_date: date, hall: str) -> bool:
        """Check if an approved booking already exists for a target date and hall."""
        stmt = (
            select(Booking)
            .where(Booking.booking_date == target_date)
            .where(Booking.hall == hall)
            .where(Booking.status == "approved")
            .where(Booking.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalars().first() is None

    @staticmethod
    async def get_next_booking_inquiry(db: AsyncSession, profile_id: int) -> Booking | None:
        """Fetch the single next upcoming booking inquiry for a profile (where booking_date >= today)."""
        today = date.today()
        stmt = (
            select(Booking)
            .where(Booking.profile_id == profile_id)
            .where(Booking.deleted_at == None)
            .where(Booking.booking_date >= today)
            .order_by(Booking.booking_date.asc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_booking_by_id(db: AsyncSession, booking_id: int) -> Booking | None:
        """Fetch a booking record by primary key if not soft-deleted."""
        stmt = (
            select(Booking)
            .where(Booking.id == booking_id)
            .where(Booking.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_bookings_count_platform_pending(db: AsyncSession) -> int:
        """Count all active pending bookings across the platform."""
        stmt = (
            select(func.count(Booking.id))
            .where(Booking.status == "pending")
            .where(Booking.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def update_booking(db: AsyncSession, booking: Booking, update_data: dict) -> Booking:
        """Update any field on a booking inquiry record (flush only)."""
        for key, value in update_data.items():
            if value is not None:
                setattr(booking, key, value)
        db.add(booking)
        await db.flush()
        return booking

    @staticmethod
    async def soft_delete_booking(db: AsyncSession, booking: Booking) -> None:
        """Soft-delete a booking inquiry by setting its deleted_at timestamp (flush only)."""
        from datetime import datetime
        booking.deleted_at = datetime.utcnow()
        db.add(booking)
        await db.flush()
