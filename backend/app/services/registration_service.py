from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
from app.repositories.repo_registration import RegistrationRepository
from app.repositories.repo_user import UserRepository
from app.repositories.repo_member import MemberRepository
from app.schemas.admin import RegistrationRequestResponse, RegistrationReviewRequest
from app.schemas.auth import RegistrationRequestCreate
from app.exceptions.auth import PermissionDeniedError
from app.exceptions.common import CustomAppError
from app.models.user import User
from app.models.member import MemberProfile
from app.models.content import RegistrationRequest
from app.core.security import get_password_hash

class RegistrationService:
    @staticmethod
    async def create_request(db: AsyncSession, data: RegistrationRequestCreate) -> RegistrationRequestResponse:
        if data.confirm_password and data.password != data.confirm_password:
            raise CustomAppError("Password and Confirm Password do not match.", status_code=400)

        email_to_use = data.email if data.email else data.mobile
        
        # Check if email/user exists
        existing_user = await UserRepository.get_by_email(db, email_to_use)
        if existing_user:
            raise CustomAppError("Email or mobile already registered.", status_code=400)
            
        # Check if mobile in profile exists
        res = await db.execute(select(MemberProfile).where(MemberProfile.mobile == data.mobile))
        if res.scalars().first():
            raise CustomAppError("Mobile number already registered.", status_code=400)
            
        # Create user (inactive until approved)
        hashed_pw = get_password_hash(data.password if data.password else "Welcome@123")
        user = User(email=email_to_use, hashed_password=hashed_pw, role="member", is_active=False)
        db.add(user)
        await db.flush()
        
        # Create profile (unverified until approved)
        profile = MemberProfile(
            user_id=user.id,
            full_name=data.full_name,
            village=data.village or "Ahmedabad",
            address="Ahmedabad",
            mobile=data.mobile,
            is_verified=False
        )
        db.add(profile)
        await db.flush()
        
        # Create registration request
        req = await RegistrationRepository.create(
            db=db,
            user_id=user.id,
            full_name=data.full_name,
            mobile=data.mobile,
            status="pending"
        )
        await db.commit()
        await db.refresh(req)
        return RegistrationRequestResponse.model_validate(req)

    @staticmethod
    async def list_requests(db: AsyncSession, current_user: User, status: Optional[str] = None) -> List[RegistrationRequestResponse]:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        requests = await RegistrationRepository.get_all(db, status=status)
        return [RegistrationRequestResponse.model_validate(r) for r in requests]

    @staticmethod
    async def review_request(
        db: AsyncSession,
        current_user: User,
        request_id: int,
        review_data: RegistrationReviewRequest
    ) -> RegistrationRequestResponse:
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        reg_req = await RegistrationRepository.get_by_id(db, request_id)
        if not reg_req:
            raise CustomAppError("Registration request not found.", status_code=404)
            
        if reg_req.status != "pending":
            raise CustomAppError("This registration request has already been reviewed.", status_code=400)
            
        await RegistrationRepository.review(
            db=db,
            req=reg_req,
            status=review_data.status,
            reviewed_by=current_user.id,
            remarks=review_data.remarks
        )
        
        # Update user and member profile
        user = await UserRepository.get_by_id(db, reg_req.user_id)
        profile = await MemberRepository.get_profile_by_user_id(db, reg_req.user_id)
        
        if review_data.status == "approved":
            if user:
                user.is_active = True
                db.add(user)
            if profile:
                profile.is_verified = True
                db.add(profile)
        else: # rejected
            if user:
                user.is_active = False
                db.add(user)
            if profile:
                profile.is_verified = False
                db.add(profile)
                
        await db.commit()
        await db.refresh(reg_req)
        return RegistrationRequestResponse.model_validate(reg_req)

    @staticmethod
    async def approve_request(db: AsyncSession, current_user: User, request_id: int) -> RegistrationRequestResponse:
        return await RegistrationService.review_request(
            db, current_user, request_id, RegistrationReviewRequest(status="approved")
        )

    @staticmethod
    async def reject_request(db: AsyncSession, current_user: User, request_id: int) -> RegistrationRequestResponse:
        return await RegistrationService.review_request(
            db, current_user, request_id, RegistrationReviewRequest(status="rejected")
        )
