import hashlib
import hmac
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.repositories.repo_user import UserRepository
from app.repositories.repo_otp import OTPRepository
from app.services.sms_service import SMSService
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_random_token,
    hash_refresh_token
)
from app.config.settings import settings
from app.exceptions.auth import (
    InvalidCredentialsError,
    UserInactiveError,
    RefreshTokenExpiredError,
    RefreshTokenInvalidError
)
from app.exceptions.common import CustomAppError
from app.models.user import User

class AuthService:
    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
        """Authenticate a user using email or mobile and password, throwing errors if invalid/inactive."""
        user = await UserRepository.get_by_email(db, email)
        if not user:
            from app.models.member import MemberProfile
            from sqlalchemy import select
            res = await db.execute(select(MemberProfile).where(MemberProfile.mobile == email))
            profile = res.scalars().first()
            if profile:
                user = await UserRepository.get_by_id(db, profile.user_id)
        if not user:
            raise InvalidCredentialsError()
        
        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError()
            
        if not user.is_active:
            raise UserInactiveError()
            
        return user

    @staticmethod
    async def create_user_refresh_token(db: AsyncSession, user_id: int) -> str:
        """Create a random refresh token, save its SHA256 hash in DB, and return the plain token."""
        # Generate raw plain token
        plain_token = generate_random_token()
        # Calculate secure hash
        hashed_token = hash_refresh_token(plain_token)
        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        # Save to database
        await UserRepository.create_refresh_token(db, user_id, hashed_token, expires_at)
        return plain_token

    @staticmethod
    async def refresh_access_token(db: AsyncSession, plain_refresh_token: str) -> tuple[str, str]:
        """Verify the plain token's hash in DB, rotate it, and generate a new access token."""
        # Calculate secure hash of incoming token
        hashed_token = hash_refresh_token(plain_refresh_token)
        
        # Look up session record
        rt_record = await UserRepository.get_refresh_token_by_hash(db, hashed_token)
        if not rt_record or rt_record.is_revoked:
            if rt_record:
                # Security Warning: A revoked refresh token was re-presented!
                # Revoke all sessions for this compromised user account.
                await UserRepository.revoke_all_user_refresh_tokens(db, rt_record.user_id)
            raise RefreshTokenInvalidError()
            
        # Check expiration
        if rt_record.expires_at < datetime.utcnow():
            raise RefreshTokenExpiredError()
            
        # Query associated User
        user = await UserRepository.get_by_id(db, rt_record.user_id)
        if not user or not user.is_active:
            raise UserInactiveError()
            
        # Generate new JWT access token
        access_token = create_access_token(subject=user.id, role=user.role)
        
        # Rotate refresh token: revoke current one and issue a new one
        await UserRepository.revoke_refresh_token(db, hashed_token)
        new_plain_refresh_token = await AuthService.create_user_refresh_token(db, user.id)
        
        return access_token, new_plain_refresh_token

    @staticmethod
    async def logout_user(db: AsyncSession, plain_refresh_token: str) -> None:
        """Log out a user by revoking the refresh token session in the database."""
        hashed_token = hash_refresh_token(plain_refresh_token)
        await UserRepository.revoke_refresh_token(db, hashed_token)

    @staticmethod
    async def change_user_password(
        db: AsyncSession,
        user_id: int,
        old_password: str,
        new_password: str
    ) -> None:
        """Change a user's password after validating their current password."""
        user = await UserRepository.get_by_id(db, user_id)
        if not user:
            raise InvalidCredentialsError()
            
        if not verify_password(old_password, user.hashed_password):
            raise CustomAppError("Incorrect current password", status_code=400)
            
        # Generate new password hash
        hashed_password = get_password_hash(new_password)
        # Save to database
        await UserRepository.update_password(db, user, hashed_password)

    @staticmethod
    async def request_password_reset_otp(db: AsyncSession, mobile: str) -> dict:
        """Generate and send a 6-digit OTP for password reset."""
        from app.models.member import MemberProfile
        from sqlalchemy import select

        res = await db.execute(select(MemberProfile).where(MemberProfile.mobile == mobile))
        profile = res.scalars().first()
        user = None
        if profile:
            user = await UserRepository.get_by_id(db, profile.user_id)
        if not user:
            user = await UserRepository.get_by_email(db, mobile)

        # To prevent user enumeration, always return standard success response
        if not user or not user.is_active:
            return {"status": "success", "message": "If this mobile number is registered and active, an OTP has been sent."}

        latest_otp = await OTPRepository.get_latest_otp(db, mobile)
        now = datetime.utcnow()
        if latest_otp and (now - latest_otp.created_at).total_seconds() < 60:
            raise CustomAppError("Please wait 60 seconds before requesting another OTP.", status_code=429)

        otp_str = f"{secrets.randbelow(900000) + 100000}"
        hashed_otp = hashlib.sha256(otp_str.encode("utf-8")).hexdigest()
        expires_at = now + timedelta(minutes=5)

        await OTPRepository.create_otp(db, user.id, mobile, hashed_otp, expires_at)
        await db.commit()

        await SMSService.send_otp(mobile, otp_str)
        return {"status": "success", "message": "If this mobile number is registered and active, an OTP has been sent."}

    @staticmethod
    async def verify_password_reset_otp(db: AsyncSession, mobile: str, otp: str) -> dict:
        """Verify the 6-digit OTP and issue a temporary single-use reset token."""
        record = await OTPRepository.get_latest_otp(db, mobile)
        if not record:
            raise CustomAppError("Invalid or expired OTP.", status_code=400)

        now = datetime.utcnow()
        if record.attempts >= 5:
            raise CustomAppError("Maximum verification attempts exceeded. Please request a new OTP.", status_code=400)

        if now > record.expires_at:
            raise CustomAppError("OTP has expired. Please request a new OTP.", status_code=400)

        incoming_hash = hashlib.sha256(otp.encode("utf-8")).hexdigest()
        if not hmac.compare_digest(incoming_hash, record.hashed_otp):
            await OTPRepository.increment_attempts(db, record)
            await db.commit()
            raise CustomAppError("Invalid OTP.", status_code=400)

        reset_token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
        await OTPRepository.set_reset_token(db, record, hashed_token)
        await db.commit()

        return {"status": "success", "reset_token": reset_token, "message": "OTP verified successfully."}

    @staticmethod
    async def reset_password_with_token(
        db: AsyncSession,
        mobile: str,
        reset_token: str,
        new_password: str,
        confirm_password: str
    ) -> dict:
        """Reset user password using valid single-use reset token."""
        if new_password != confirm_password:
            raise CustomAppError("New Password and Confirm Password do not match.", status_code=400)

        hashed_token = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
        record = await OTPRepository.get_latest_by_reset_token(db, mobile, hashed_token)
        if not record:
            raise CustomAppError("Invalid or expired reset session. Please request a new OTP.", status_code=400)

        now = datetime.utcnow()
        if now > record.expires_at + timedelta(minutes=15):
            raise CustomAppError("Reset session expired. Please request a new OTP.", status_code=400)

        user = await UserRepository.get_by_id(db, record.user_id)
        if not user or not user.is_active:
            raise CustomAppError("User account is inactive or not found.", status_code=400)

        hashed_password = get_password_hash(new_password)
        await UserRepository.update_password(db, user, hashed_password)
        await OTPRepository.mark_used(db, record)
        await db.commit()

        return {"status": "success", "message": "Password reset successfully. You can now login with your new password."}

