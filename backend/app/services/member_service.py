from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.repositories.repo_member import MemberRepository
from app.repositories.repo_booking import BookingRepository
from app.repositories.repo_content import ContentRepository
from app.schemas.member import (
    MemberProfileResponse,
    MemberProfileUpdate,
    FamilyMemberResponse,
    FamilyMemberCreate,
    FamilyMemberUpdate,
    MemberDashboardStats,
    MemberDashboardSummary,
    DirectorySurnameGroupResponse,
    DirectoryFamilyHeadResponse,
    DirectoryFamilyMemberResponse
)
from app.schemas.content import NoticeResponse, EventResponse
from app.schemas.booking import BookingInquiryResponse
from app.exceptions.auth import PermissionDeniedError
from app.exceptions.member import (
    ProfileNotFoundError,
    MobileAlreadyExistsError,
    FamilyMemberNotFoundError
)
from app.models.user import User
from app.models.member import MemberProfile

class MemberService:
    @staticmethod
    async def get_profile(
        db: AsyncSession,
        current_user: User,
        target_user_id: Optional[int] = None
    ) -> MemberProfileResponse:
        """Retrieve member profile for current user or target user (Admins only)."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        profile = await MemberRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ProfileNotFoundError()
            
        return MemberProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            surname=getattr(profile, "surname", "General") or "General",
            full_name=profile.full_name,
            village=profile.village,
            city=getattr(profile, "city", "Ahmedabad") or "Ahmedabad",
            address=profile.address,
            mobile=profile.mobile,
            occupation=getattr(profile, "occupation", None),
            is_verified=profile.is_verified,
            profile_completed=getattr(profile, "profile_completed", True),
            email=profile.user.email if profile.user else None
        )

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        current_user: User,
        update_data: MemberProfileUpdate,
        target_user_id: Optional[int] = None
    ) -> MemberProfileResponse:
        """Update member profile, verifying ownership or Admin role."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            profile = await MemberRepository.get_profile_by_user_id(db, user_id)
            if not profile:
                raise ProfileNotFoundError()
                
            # Verify unique mobile constraint if mobile is changing
            if update_data.mobile and update_data.mobile != profile.mobile:
                stmt = select(MemberProfile).where(MemberProfile.mobile == update_data.mobile)
                result = await db.execute(stmt)
                if result.scalars().first():
                    raise MobileAlreadyExistsError()
                    
            await MemberRepository.update_profile(
                db, profile, update_data.model_dump(exclude_unset=True)
            )
        if in_tx:
            await db.commit()
            
        # Re-fetch to return refreshed data after transaction commit
        profile_refreshed = await MemberRepository.get_profile_by_user_id(db, user_id)
        return MemberProfileResponse(
            id=profile_refreshed.id,
            user_id=profile_refreshed.user_id,
            surname=getattr(profile_refreshed, "surname", "General") or "General",
            full_name=profile_refreshed.full_name,
            village=profile_refreshed.village,
            city=getattr(profile_refreshed, "city", "Ahmedabad") or "Ahmedabad",
            address=profile_refreshed.address,
            mobile=profile_refreshed.mobile,
            occupation=getattr(profile_refreshed, "occupation", None),
            is_verified=profile_refreshed.is_verified,
            profile_completed=getattr(profile_refreshed, "profile_completed", True),
            email=profile_refreshed.user.email if profile_refreshed.user else None
        )

    @staticmethod
    async def get_family_members(
        db: AsyncSession,
        current_user: User,
        target_user_id: Optional[int] = None
    ) -> List[FamilyMemberResponse]:
        """Fetch all family members for the target profile."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        profile = await MemberRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ProfileNotFoundError()
            
        members = await MemberRepository.get_family_members(db, profile.id)
        return [FamilyMemberResponse.model_validate(m) for m in members]

    @staticmethod
    async def create_family_member(
        db: AsyncSession,
        current_user: User,
        member_data: FamilyMemberCreate,
        target_user_id: Optional[int] = None
    ) -> FamilyMemberResponse:
        """Create a family member for the target profile."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            profile = await MemberRepository.get_profile_by_user_id(db, user_id)
            if not profile:
                raise ProfileNotFoundError()
                
            member = await MemberRepository.create_family_member(
                db,
                profile_id=profile.id,
                name=member_data.name,
                relation=member_data.relation,
                age=member_data.age,
                education=member_data.education,
                occupation=member_data.occupation
            )
        if in_tx:
            await db.commit()
            
        return FamilyMemberResponse.model_validate(member)

    @staticmethod
    async def update_family_member(
        db: AsyncSession,
        current_user: User,
        member_id: int,
        update_data: FamilyMemberUpdate
    ) -> FamilyMemberResponse:
        """Update an existing family member record, verifying ownership."""
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            member = await MemberRepository.get_family_member_by_id(db, member_id)
            if not member:
                raise FamilyMemberNotFoundError()
                
            profile = await MemberRepository.get_profile_by_id(db, member.profile_id)
            if not profile:
                raise ProfileNotFoundError()
                
            # Check permissions
            if current_user.role != "admin" and profile.user_id != current_user.id:
                raise PermissionDeniedError()
                
            await MemberRepository.update_family_member(
                db, member, update_data.model_dump(exclude_unset=True)
            )
        if in_tx:
            await db.commit()
            
        return FamilyMemberResponse.model_validate(member)

    @staticmethod
    async def delete_family_member(
        db: AsyncSession,
        current_user: User,
        member_id: int
    ) -> None:
        """Soft-delete a family member record, verifying ownership."""
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            member = await MemberRepository.get_family_member_by_id(db, member_id)
            if not member:
                raise FamilyMemberNotFoundError()
                
            profile = await MemberRepository.get_profile_by_id(db, member.profile_id)
            if not profile:
                raise ProfileNotFoundError()
                
            # Check permissions
            if current_user.role != "admin" and profile.user_id != current_user.id:
                raise PermissionDeniedError()
                
            await MemberRepository.soft_delete_family_member(db, member)
        if in_tx:
            await db.commit()

    @staticmethod
    async def get_dashboard_summary(
        db: AsyncSession,
        current_user: User,
        target_user_id: Optional[int] = None
    ) -> MemberDashboardSummary:
        """Get complete aggregated landing statistics, notices, next event, and next reservation inquiry."""
        user_id = target_user_id if current_user.role == "admin" and target_user_id else current_user.id
        
        if target_user_id and current_user.role != "admin" and target_user_id != current_user.id:
            raise PermissionDeniedError()
            
        profile = await MemberRepository.get_profile_by_user_id(db, user_id)
        
        profile_dto = None
        family_count = 0
        pending_inquiries = 0
        approved_inquiries = 0
        next_inquiry_dto = None
        
        if profile:
            profile_dto = MemberProfileResponse(
                id=profile.id,
                user_id=profile.user_id,
                full_name=profile.full_name,
                village=profile.village,
                address=profile.address,
                mobile=profile.mobile,
                is_verified=profile.is_verified,
                email=profile.user.email if profile.user else None
            )
            family_members = await MemberRepository.get_family_members(db, profile.id)
            family_count = len(family_members)
            pending_inquiries = await BookingRepository.get_bookings_count_by_status(db, profile.id, "pending")
            approved_inquiries = await BookingRepository.get_bookings_count_by_status(db, profile.id, "approved")
            
            # Fetch next upcoming booking inquiry
            next_inquiry = await BookingRepository.get_next_booking_inquiry(db, profile.id)
            if next_inquiry:
                next_inquiry_dto = BookingInquiryResponse.model_validate(next_inquiry)
            
        active_notices = await ContentRepository.get_active_notices_count(db)
        upcoming_events = await ContentRepository.get_active_events_count(db)
        
        # Fetch latest announcement
        latest_notice = await ContentRepository.get_latest_notice(db)
        latest_notice_dto = NoticeResponse.model_validate(latest_notice) if latest_notice else None
        
        # Fetch next event
        next_event = await ContentRepository.get_next_event(db)
        next_event_dto = EventResponse.model_validate(next_event) if next_event else None
        
        stats = MemberDashboardStats(
            family_members_count=family_count,
            pending_inquiries_count=pending_inquiries,
            approved_inquiries_count=approved_inquiries,
            active_notices_count=active_notices,
            upcoming_events_count=upcoming_events
        )
        
        return MemberDashboardSummary(
            profile=profile_dto,
            statistics=stats,
            latest_notice=latest_notice_dto,
            next_event=next_event_dto,
            next_booking_inquiry=next_inquiry_dto
        )

    # --- ADMIN METHODS ---
    @staticmethod
    async def get_all_profiles_admin(
        db: AsyncSession,
        current_user: User,
        is_verified: Optional[bool] = None
    ) -> List[MemberProfileResponse]:
        """Fetch all member profiles across the platform (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        profiles = await MemberRepository.get_all_profiles_admin(db, is_verified)
        return [
            MemberProfileResponse(
                id=p.id,
                user_id=p.user_id,
                full_name=p.full_name,
                village=p.village,
                address=p.address,
                mobile=p.mobile,
                is_verified=p.is_verified,
                email=p.user.email if p.user else None
            )
            for p in profiles
        ]

    @staticmethod
    async def verify_profile_admin(
        db: AsyncSession,
        current_user: User,
        profile_id: int,
        is_verified: bool
    ) -> MemberProfileResponse:
        """Mark a member account as verified/unverified (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            profile = await MemberRepository.get_profile_by_id(db, profile_id)
            if not profile:
                raise ProfileNotFoundError()
                
            await MemberRepository.verify_profile(db, profile, is_verified)
        if in_tx:
            await db.commit()
            
        # Re-fetch refreshed record
        p_ref = await MemberRepository.get_profile_by_id(db, profile_id)
        return MemberProfileResponse(
            id=p_ref.id,
            user_id=p_ref.user_id,
            full_name=p_ref.full_name,
            village=p_ref.village,
            address=p_ref.address,
            mobile=p_ref.mobile,
            is_verified=p_ref.is_verified,
            email=p_ref.user.email if p_ref.user else None
        )

    @staticmethod
    async def delete_profile_admin(
        db: AsyncSession,
        current_user: User,
        profile_id: int
    ) -> None:
        """Soft-delete a member's profile and cascadingly soft-delete their family relatives (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            profile = await MemberRepository.get_profile_by_id(db, profile_id)
            if not profile:
                raise ProfileNotFoundError()
                
            await MemberRepository.soft_delete_profile(db, profile)
        if in_tx:
            await db.commit()

    @staticmethod
    async def get_directory(db: AsyncSession) -> List[DirectorySurnameGroupResponse]:
        """Fetch and hierarchically group active, verified, profile-completed community members by Surname."""
        profiles = await MemberRepository.get_directory_profiles(db)
        groups: dict[str, list[DirectoryFamilyHeadResponse]] = {}
        for profile in profiles:
            surn = getattr(profile, "surname", "General") or "General"
            spouse_obj = next((fm for fm in profile.family_members if fm.relation.lower() == "spouse"), None)
            spouse_name = spouse_obj.name if spouse_obj else "N/A"
            members_list = [
                DirectoryFamilyMemberResponse(
                    id=fm.id,
                    name=fm.name,
                    relation=fm.relation,
                    age=fm.age,
                    occupation=getattr(fm, "occupation", "") or "",
                    education=getattr(fm, "education", "") or ""
                )
                for fm in profile.family_members
            ]
            head = DirectoryFamilyHeadResponse(
                id=f"SSPV-{profile.id}",
                name=profile.full_name,
                surname=surn,
                city=getattr(profile, "city", "Ahmedabad") or "Ahmedabad",
                village=profile.village,
                contact=profile.mobile,
                email=profile.user.email if profile.user else "",
                occupation=getattr(profile, "occupation", "Business / Professional") or "Business / Professional",
                address=profile.address,
                membersCount=len(profile.family_members),
                spouse=spouse_name,
                members=members_list
            )
            groups.setdefault(surn, []).append(head)

        result: List[DirectorySurnameGroupResponse] = []
        for surn in sorted(groups.keys()):
            heads = groups[surn]
            result.append(
                DirectorySurnameGroupResponse(
                    surname=surn,
                    count=len(heads),
                    heads=heads
                )
            )
        return result

