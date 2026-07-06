from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
from app.repositories.repo_booking import BookingRepository
from app.repositories.repo_member import MemberRepository
from app.schemas.booking import BookingInquiryResponse, BookingInquiryCreate
from app.schemas.admin import BookingReviewRequest, AdminBookingResponse
from app.exceptions.auth import PermissionDeniedError
from app.exceptions.member import ProfileNotFoundError
from app.exceptions.booking import BookingNotFoundError
from app.models.user import User

class BookingService:
    @staticmethod
    async def get_member_bookings(
        db: AsyncSession,
        current_user: User,
        target_user_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: str = "booking_date",
        order: str = "desc",
        skip: int = 0,
        limit: int = 100
    ) -> List[BookingInquiryResponse]:
        """Fetch all non-deleted booking inquiries associated with a profile, with sorting, filtering, and pagination."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        profile = await MemberRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ProfileNotFoundError()
            
        bookings = await BookingRepository.get_booking_inquiries_by_profile_id(
            db=db,
            profile_id=profile.id,
            status=status,
            sort_by=sort_by,
            order=order,
            skip=skip,
            limit=limit
        )
        return [BookingInquiryResponse.model_validate(b) for b in bookings]

    @staticmethod
    async def check_hall_availability(
        db: AsyncSession,
        target_date: date,
        hall: str
    ) -> bool:
        """Check if an approved booking already exists for a target date and hall."""
        return await BookingRepository.check_availability(db, target_date, hall)

    @staticmethod
    async def create_booking_inquiry(
        db: AsyncSession,
        current_user: User,
        booking_data: BookingInquiryCreate,
        target_user_id: Optional[int] = None
    ) -> BookingInquiryResponse:
        """Submit a booking inquiry in a pending state, running within a transaction savepoint."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        profile = await MemberRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ProfileNotFoundError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            booking = await BookingRepository.create_booking(
                db=db,
                profile_id=profile.id,
                contact_name=booking_data.contact_name,
                contact_phone=booking_data.contact_phone,
                booking_date=booking_data.booking_date,
                purpose=booking_data.purpose,
                hall=booking_data.hall,
                event_name=booking_data.event_name,
                member_count=booking_data.member_count
            )
        if in_tx:
            await db.commit()
            
        return BookingInquiryResponse.model_validate(booking)

    # --- ADMIN METHODS ---
    @staticmethod
    async def get_all_bookings_admin(
        db: AsyncSession,
        current_user: User
    ) -> List[AdminBookingResponse]:
        """Fetch all booking inquiries across the entire platform (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        bookings = await BookingRepository.get_all_bookings(db)
        return [AdminBookingResponse.model_validate(b) for b in bookings]

    @staticmethod
    async def review_booking_inquiry(
        db: AsyncSession,
        current_user: User,
        booking_id: int,
        review_data: BookingReviewRequest
    ) -> AdminBookingResponse:
        """Approve/reject booking, record quotes/remarks, and save transaction (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            booking = await BookingRepository.get_booking_by_id(db, booking_id)
            if not booking:
                raise BookingNotFoundError()
                
            update_fields = {
                "status": review_data.status,
                "amount": review_data.amount,
                "payment_status": review_data.payment_status,
                "admin_remark": review_data.admin_remark
            }
            # Clean none values so we don't accidentally wipe existing details if not updated
            update_fields = {k: v for k, v in update_fields.items() if v is not None}
            
            await BookingRepository.update_booking(db, booking, update_fields)
        if in_tx:
            await db.commit()
            
        # Re-fetch refreshed record
        booking_refreshed = await BookingRepository.get_booking_by_id(db, booking_id)
        return AdminBookingResponse.model_validate(booking_refreshed)

    @staticmethod
    async def delete_booking_admin(
        db: AsyncSession,
        current_user: User,
        booking_id: int
    ) -> None:
        """Soft-delete a booking inquiry (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            booking = await BookingRepository.get_booking_by_id(db, booking_id)
            if not booking:
                raise BookingNotFoundError()
                
            await BookingRepository.soft_delete_booking(db, booking)
        if in_tx:
            await db.commit()
