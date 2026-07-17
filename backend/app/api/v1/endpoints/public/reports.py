from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.schemas.content import AnnualReportResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[AnnualReportResponse],
    status_code=200,
    summary="List Published Annual Reports",
    description="Retrieve all active published annual reports ordered by display order and financial year."
)
async def list_active_reports(
    db: AsyncSession = Depends(get_db)
):
    """Retrieve published annual reports."""
    return await ContentService.get_active_reports(db)
