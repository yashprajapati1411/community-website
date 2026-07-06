from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.admin_service import AdminService
from app.schemas.admin import AdminDashboardSummary

router = APIRouter()

@router.get(
    "/summary",
    response_model=AdminDashboardSummary,
    status_code=200,
    summary="Get Admin Dashboard Summary",
    description="Retrieve platform-wide aggregate statistics, counts of members, bookings, notices, events, and gallery items for the administrator control panel."
)
async def get_admin_dashboard_summary(
    db: AsyncSession = Depends(get_db)
):
    """Retrieve platform-wide aggregate statistics for the Administrator panel."""
    return await AdminService.get_dashboard_summary(db)

