from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user import User, RefreshToken
from datetime import datetime

class UserRepository:
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        """Query User by their unique email address."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int) -> User | None:
        """Query User by their primary key identifier."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, email: str, hashed_password: str, role: str = "member") -> User:
        """Insert a new User record into the database."""
        user = User(email=email, hashed_password=hashed_password, role=role)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def create_refresh_token(
        db: AsyncSession,
        user_id: int,
        hashed_token: str,
        expires_at: datetime
    ) -> RefreshToken:
        """Store a hashed refresh token session tied to a user."""
        rt = RefreshToken(user_id=user_id, token=hashed_token, expires_at=expires_at)
        db.add(rt)
        await db.commit()
        await db.refresh(rt)
        return rt

    @staticmethod
    async def get_refresh_token_by_hash(db: AsyncSession, hashed_token: str) -> RefreshToken | None:
        """Query refresh token sessions using their hashed string values."""
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == hashed_token))
        return result.scalars().first()

    @staticmethod
    async def revoke_refresh_token(db: AsyncSession, hashed_token: str) -> None:
        """Invalidate a refresh token session by marking is_revoked as True."""
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.token == hashed_token)
            .values(is_revoked=True)
        )
        await db.commit()

    @staticmethod
    async def update_password(db: AsyncSession, user: User, hashed_password: str) -> User:
        """Update a user's password hash in the database."""
        user.hashed_password = hashed_password
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
