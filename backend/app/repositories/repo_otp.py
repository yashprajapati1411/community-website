from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime
from app.models.user import PasswordResetOTP

class OTPRepository:
    @staticmethod
    async def create_otp(
        db: AsyncSession,
        user_id: int,
        mobile: str,
        hashed_otp: str,
        expires_at: datetime
    ) -> PasswordResetOTP:
        record = PasswordResetOTP(
            user_id=user_id,
            mobile=mobile,
            hashed_otp=hashed_otp,
            expires_at=expires_at,
            attempts=0,
            is_used=False
        )
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def get_latest_otp(
        db: AsyncSession,
        mobile: str
    ) -> Optional[PasswordResetOTP]:
        stmt = (
            select(PasswordResetOTP)
            .where(PasswordResetOTP.mobile == mobile, PasswordResetOTP.is_used == False)
            .order_by(PasswordResetOTP.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_latest_by_reset_token(
        db: AsyncSession,
        mobile: str,
        reset_token: str
    ) -> Optional[PasswordResetOTP]:
        stmt = (
            select(PasswordResetOTP)
            .where(
                PasswordResetOTP.mobile == mobile,
                PasswordResetOTP.reset_token == reset_token,
                PasswordResetOTP.is_used == False
            )
            .order_by(PasswordResetOTP.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def increment_attempts(db: AsyncSession, record: PasswordResetOTP) -> None:
        record.attempts += 1
        db.add(record)
        await db.flush()

    @staticmethod
    async def set_reset_token(db: AsyncSession, record: PasswordResetOTP, reset_token: str) -> None:
        record.reset_token = reset_token
        db.add(record)
        await db.flush()

    @staticmethod
    async def mark_used(db: AsyncSession, record: PasswordResetOTP) -> None:
        record.is_used = True
        db.add(record)
        await db.flush()
