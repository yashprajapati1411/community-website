from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.content import SurnameHistoryResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "",
    response_model=List[SurnameHistoryResponse],
    status_code=200,
    summary="List Surname Histories",
    description="Retrieve all regional surname histories ordered alphabetically by surname with pagination support."
)
async def list_surname_histories(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, description="Maximum number of records to return")
):
    histories = await ContentService.get_surname_histories(db)
    return histories[skip : skip + limit]

@router.get(
    "/{id}",
    response_model=SurnameHistoryResponse,
    status_code=200,
    summary="Get Surname History Details",
    description="Retrieve details of a single surname history record by primary key ID."
)
async def get_surname_history_detail(
    id: int = Path(..., description="Unique surname history record ID to retrieve"),
    db: AsyncSession = Depends(get_db)
):
    return await ContentService.get_surname_history_by_id(db, id)

