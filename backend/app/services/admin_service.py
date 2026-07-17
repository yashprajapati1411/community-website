from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.repo_member import MemberRepository
from app.repositories.repo_booking import BookingRepository
from app.repositories.repo_content import ContentRepository
from app.repositories.repo_registration import RegistrationRepository
from app.schemas.admin import AdminDashboardSummary

class AdminService:
    @staticmethod
    async def get_dashboard_summary(db: AsyncSession) -> AdminDashboardSummary:
        """Compile aggregate analytics for the Administrator overview landing page."""
        total_members = await MemberRepository.get_total_members_count(db)
        verified_members = await MemberRepository.get_verified_members_count(db)
        pending_bookings = await BookingRepository.get_bookings_count_platform_pending(db)
        upcoming_events = await ContentRepository.get_active_events_count(db)
        active_notices = await ContentRepository.get_active_notices_count(db)
        gallery_images = await ContentRepository.get_images_count(db)
        committee_members = await ContentRepository.get_committee_members_count(db)
        
        pending_reg_count = await RegistrationRepository.get_count_by_status(db, "pending")
        rejected_reg_count = await RegistrationRepository.get_count_by_status(db, "rejected")
        
        return AdminDashboardSummary(
            total_members_count=total_members,
            verified_members_count=verified_members,
            pending_bookings_count=pending_bookings,
            upcoming_events_count=upcoming_events,
            active_notices_count=active_notices,
            gallery_images_count=gallery_images,
            committee_members_count=committee_members,
            pending_registrations_count=pending_reg_count,
            approved_members_count=verified_members,
            rejected_registrations_count=rejected_reg_count
        )

