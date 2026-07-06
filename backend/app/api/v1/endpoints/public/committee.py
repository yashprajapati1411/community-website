from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.content import CommitteeMemberResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[CommitteeMemberResponse],
    status_code=200,
    summary="List Active Committee Members",
    description="Retrieve all active committee members of the community organized by their display order."
)
async def list_active_committee_members(
    db: AsyncSession = Depends(get_db)
):
    return await ContentService.get_active_committee_members(db)
