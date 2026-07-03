from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.repositories.repo_user import UserRepository
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
        """Authenticate a user using email and password, throwing errors if invalid/inactive."""
        user = await UserRepository.get_by_email(db, email)
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
