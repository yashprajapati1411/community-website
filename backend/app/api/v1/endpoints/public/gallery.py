from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.content import GalleryAlbumResponse, GalleryAlbumWithImagesResponse
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "/albums",
    response_model=List[GalleryAlbumResponse],
    status_code=200,
    summary="List Active Gallery Albums",
    description="Retrieve all active gallery albums ordered by display order."
)
async def list_active_albums(
    db: AsyncSession = Depends(get_db)
):
    return await ContentService.get_active_albums(db)

@router.get(
    "/albums/{id}",
    response_model=GalleryAlbumWithImagesResponse,
    status_code=200,
    summary="Get Gallery Album Details",
    description="Retrieve details of a single gallery album along with its list of active images."
)
async def get_album_with_images(
    id: int = Path(..., description="Unique album ID to retrieve"),
    db: AsyncSession = Depends(get_db)
):
    return await ContentService.get_album_with_images(db, id)

