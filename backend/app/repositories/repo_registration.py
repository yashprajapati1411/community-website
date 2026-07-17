from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.content import RegistrationRequest
from datetime import datetime
from typing import Optional, List

class RegistrationRepository:
    @staticmethod
    async def get_all(db: AsyncSession, status: Optional[str] = None) -> List[RegistrationRequest]:
        stmt = select(RegistrationRequest).order_by(RegistrationRequest.created_at.desc())
        if status:
            stmt = stmt.where(RegistrationRequest.status == status)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, req_id: int) -> Optional[RegistrationRequest]:
        result = await db.execute(select(RegistrationRequest).where(RegistrationRequest.id == req_id))
        return result.scalars().first()

    @staticmethod
    async def get_by_user_id(db: AsyncSession, user_id: int) -> Optional[RegistrationRequest]:
        result = await db.execute(select(RegistrationRequest).where(RegistrationRequest.user_id == user_id))
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, user_id: int, full_name: str, mobile: str, status: str = "pending") -> RegistrationRequest:
        req = RegistrationRequest(user_id=user_id, full_name=full_name, mobile=mobile, status=status)
        db.add(req)
        await db.flush()
        return req

    @staticmethod
    async def review(db: AsyncSession, req: RegistrationRequest, status: str, reviewed_by: int, remarks: Optional[str] = None) -> RegistrationRequest:
        req.status = status
        req.reviewed_at = datetime.utcnow()
        req.reviewed_by = reviewed_by
        if remarks:
            req.remarks = remarks
        db.add(req)
        await db.flush()
        return req

    @staticmethod
    async def get_count_by_status(db: AsyncSession, status: str) -> int:
        result = await db.execute(select(func.count(RegistrationRequest.id)).where(RegistrationRequest.status == status))
        return result.scalar() or 0
