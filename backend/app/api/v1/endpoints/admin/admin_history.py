from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import SurnameHistoryResponse, SurnameHistoryCreate, SurnameHistoryUpdate
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[SurnameHistoryResponse],
    status_code=200,
    summary="List All Surname Histories",
    description="Retrieve all regional surname histories from the platform archives (Admin only)."
)
async def list_all_histories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all regional surname histories (Admin only)."""
    return await ContentService.get_all_histories_admin(db, current_user)

@router.post(
    "",
    response_model=SurnameHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Surname History",
    description="Create a new regional surname history record with native region details and historical narratives."
)
async def create_surname_history(
    history_data: SurnameHistoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new regional surname history record (Admin only)."""
    return await ContentService.create_surname_history(db, current_user, history_data)

@router.put(
    "/{id}",
    response_model=SurnameHistoryResponse,
    status_code=200,
    summary="Update Surname History",
    description="Update fields on an existing regional surname history record."
)
async def update_surname_history(
    history_data: SurnameHistoryUpdate,
    id: int = Path(..., description="Unique ID of the surname history record to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing regional surname history record (Admin only)."""
    return await ContentService.update_surname_history(db, current_user, id, history_data)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Surname History",
    description="Permanently delete a regional surname history record from archives."
)
async def delete_surname_history(
    id: int = Path(..., description="Unique ID of the surname history record to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hard-delete a regional surname history record (Admin only)."""
    await ContentService.delete_surname_history(db, current_user, id)
    return None

