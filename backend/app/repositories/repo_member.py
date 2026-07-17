from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.member import MemberProfile, FamilyMember
from app.models.user import User
from datetime import datetime

class MemberRepository:
    @staticmethod
    async def get_directory_profiles(db: AsyncSession) -> list[MemberProfile]:
        """Fetch all verified and profile_completed member profiles with active users."""
        stmt = (
            select(MemberProfile)
            .join(User, MemberProfile.user_id == User.id)
            .where(MemberProfile.is_verified == True)
            .where(MemberProfile.profile_completed == True)
            .where(MemberProfile.deleted_at.is_(None))
            .where(User.is_active == True)
            .options(selectinload(MemberProfile.user), selectinload(MemberProfile.family_members))
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: int) -> MemberProfile | None:
        """Fetch a member profile by the owner's User ID, eagerly loading their User record."""
        stmt = (
            select(MemberProfile)
            .where(MemberProfile.user_id == user_id)
            .options(selectinload(MemberProfile.user))
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_profile_by_id(db: AsyncSession, profile_id: int) -> MemberProfile | None:
        """Fetch a member profile by its primary key, eagerly loading their User record."""
        stmt = (
            select(MemberProfile)
            .where(MemberProfile.id == profile_id)
            .options(selectinload(MemberProfile.user))
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        user_id: int,
        full_name: str,
        village: str,
        address: str,
        mobile: str,
        surname: str = "General",
        city: str = "Ahmedabad",
        occupation: str | None = None
    ) -> MemberProfile:
        """Create a new member profile row in the session (flush only)."""
        profile = MemberProfile(
            user_id=user_id,
            surname=surname,
            full_name=full_name,
            village=village,
            city=city,
            address=address,
            mobile=mobile,
            occupation=occupation,
            is_verified=False,
            profile_completed=True
        )
        db.add(profile)
        await db.flush()
        return profile

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        profile: MemberProfile,
        update_data: dict
    ) -> MemberProfile:
        """Update a member profile row's fields (flush only)."""
        for key, value in update_data.items():
            if value is not None:
                setattr(profile, key, value)
        db.add(profile)
        await db.flush()
        return profile

    @staticmethod
    async def get_family_members(db: AsyncSession, profile_id: int) -> list[FamilyMember]:
        """Fetch all family members for a profile that are not soft-deleted."""
        stmt = (
            select(FamilyMember)
            .where(FamilyMember.profile_id == profile_id)
            .where(FamilyMember.deleted_at == None)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_family_member_by_id(db: AsyncSession, member_id: int) -> FamilyMember | None:
        """Fetch a family member by ID if not soft-deleted."""
        stmt = (
            select(FamilyMember)
            .where(FamilyMember.id == member_id)
            .where(FamilyMember.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_family_member(
        db: AsyncSession,
        profile_id: int,
        name: str,
        relation: str,
        age: int,
        education: str | None = None,
        occupation: str | None = None
    ) -> FamilyMember:
        """Add a family member to the session (flush only)."""
        member = FamilyMember(
            profile_id=profile_id,
            name=name,
            relation=relation,
            age=age,
            education=education,
            occupation=occupation
        )
        db.add(member)
        await db.flush()
        return member

    @staticmethod
    async def update_family_member(
        db: AsyncSession,
        family_member: FamilyMember,
        update_data: dict
    ) -> FamilyMember:
        """Update fields on a family member record (flush only)."""
        for key, value in update_data.items():
            if value is not None:
                setattr(family_member, key, value)
        db.add(family_member)
        await db.flush()
        return family_member

    @staticmethod
    async def soft_delete_family_member(db: AsyncSession, family_member: FamilyMember) -> None:
        """Mark a family member as soft-deleted by setting deleted_at (flush only)."""
        family_member.deleted_at = datetime.utcnow()
        db.add(family_member)
        await db.flush()

    @staticmethod
    async def get_all_profiles_admin(
        db: AsyncSession,
        is_verified: bool | None = None
    ) -> list[MemberProfile]:
        """Fetch all member profiles across the platform that are not soft-deleted, optionally filtering by verification status."""
        stmt = (
            select(MemberProfile)
            .where(MemberProfile.deleted_at == None)
            .options(selectinload(MemberProfile.user))
        )
        if is_verified is not None:
            stmt = stmt.where(MemberProfile.is_verified == is_verified)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_total_members_count(db: AsyncSession) -> int:
        """Count all active member profiles."""
        from sqlalchemy import func
        stmt = select(func.count(MemberProfile.id)).where(MemberProfile.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_verified_members_count(db: AsyncSession) -> int:
        """Count all verified member profiles."""
        from sqlalchemy import func
        stmt = (
            select(func.count(MemberProfile.id))
            .where(MemberProfile.is_verified == True)
            .where(MemberProfile.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def verify_profile(db: AsyncSession, profile: MemberProfile, is_verified: bool) -> MemberProfile:
        """Set verification status on a member profile (flush only)."""
        profile.is_verified = is_verified
        db.add(profile)
        await db.flush()
        return profile

    @staticmethod
    async def soft_delete_profile(db: AsyncSession, profile: MemberProfile) -> None:
        """Mark a member profile as soft-deleted, and cascadingly soft-delete their family relatives (flush only)."""
        now = datetime.utcnow()
        profile.deleted_at = now
        db.add(profile)
        
        # Soft-delete all relatives as well
        stmt = (
            select(FamilyMember)
            .where(FamilyMember.profile_id == profile.id)
            .where(FamilyMember.deleted_at == None)
        )
        res = await db.execute(stmt)
        relatives = res.scalars().all()
        for rel in relatives:
            rel.deleted_at = now
            db.add(rel)
            
        await db.flush()
