from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import AnnualReportResponse, AnnualReportCreate, AnnualReportUpdate
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[AnnualReportResponse],
    status_code=200,
    summary="List All Annual Reports",
    description="Retrieve all annual reports including unpublished drafts (Admin only)."
)
async def list_all_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all reports (Admin only)."""
    return await ContentService.get_all_reports_admin(db, current_user)

@router.post(
    "",
    response_model=AnnualReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Annual Report",
    description="Create a new annual report PDF entry (Admin only)."
)
async def create_report(
    report_data: AnnualReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new annual report (Admin only)."""
    return await ContentService.create_report(db, current_user, report_data)

@router.put(
    "/{id}",
    response_model=AnnualReportResponse,
    status_code=200,
    summary="Update Annual Report",
    description="Update fields on an existing annual report record (Admin only)."
)
async def update_report(
    report_data: AnnualReportUpdate,
    id: int = Path(..., description="Unique ID of the report record to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing annual report (Admin only)."""
    return await ContentService.update_report(db, current_user, id, report_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Annual Report",
    description="Soft-delete an annual report record (Admin only)."
)
async def delete_report(
    id: int = Path(..., description="Unique ID of the report record to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete an annual report (Admin only)."""
    await ContentService.delete_report(db, current_user, id)
    return None
