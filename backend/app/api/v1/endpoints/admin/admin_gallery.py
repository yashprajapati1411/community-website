from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.content import (
    GalleryAlbumResponse, GalleryAlbumCreate, GalleryAlbumUpdate,
    GalleryImageResponse, GalleryImageCreate
)
from app.services.content_service import ContentService

router = APIRouter()

@router.get(
    "/albums",
    response_model=List[GalleryAlbumResponse],
    status_code=200,
    summary="List All Gallery Albums",
    description="Retrieve all gallery photo albums across the platform archives (Admin only)."
)
async def list_albums_admin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all gallery albums (Admin only)."""
    return await ContentService.get_all_albums_admin(db, current_user)

@router.post(
    "/albums",
    response_model=GalleryAlbumResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Gallery Album",
    description="Create a new photo album container with title, description, cover image, and display order."
)
async def create_gallery_album(
    album_data: GalleryAlbumCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new gallery album container (Admin only)."""
    return await ContentService.create_gallery_album(db, current_user, album_data)

@router.put(
    "/albums/{id}",
    response_model=GalleryAlbumResponse,
    status_code=200,
    summary="Update Gallery Album",
    description="Update title, description, cover image, or display order on an existing gallery album."
)
async def update_gallery_album(
    album_data: GalleryAlbumUpdate,
    id: int = Path(..., description="Unique ID of the gallery album to update"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fields on an existing gallery album container (Admin only)."""
    return await ContentService.update_gallery_album(db, current_user, id, album_data)

@router.delete(
    "/albums/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Gallery Album",
    description="Soft-delete a photo album and cascadingly soft-delete all embedded images within it."
)
async def delete_gallery_album(
    id: int = Path(..., description="Unique ID of the gallery album to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete an album and cascadingly soft-delete its embedded images (Admin only)."""
    await ContentService.delete_gallery_album(db, current_user, id)
    return None

@router.post(
    "/albums/{album_id}/images",
    response_model=GalleryImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Image to Album",
    description="Attach a new image URL and optional caption to an existing photo album."
)
async def add_image_to_album(
    image_data: GalleryImageCreate,
    album_id: int = Path(..., description="Unique ID of the target album to add the image to"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new image resource to an existing gallery album (Admin only)."""
    return await ContentService.add_gallery_image(db, current_user, album_id, image_data)

@router.delete(
    "/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Gallery Image",
    description="Soft-delete an individual photo from a gallery album."
)
async def delete_gallery_image(
    image_id: int = Path(..., description="Unique ID of the gallery image record to delete"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete an individual image resource (Admin only)."""
    await ContentService.delete_gallery_image(db, current_user, image_id)
    return None

