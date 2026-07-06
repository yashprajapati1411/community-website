from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status
from app.utils.file_upload import get_storage_provider
from app.schemas.admin import UploadResponse

router = APIRouter()

@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Image File",
    description="Upload an image file under a designated category folder. Validates file size (max 5MB) and type (JPEG, PNG, GIF, WebP)."
)
async def upload_file(
    category: str = Query(..., description="Target category: 'gallery', 'events', 'committee', or 'members'"),
    file: UploadFile = File(..., description="Image file to upload")
):
    storage_provider = get_storage_provider()
    url = await storage_provider.save_file(file, category)
    return UploadResponse(url=url)

@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Uploaded File",
    description="Remove an uploaded file resource from local storage given its relative public URL path."
)
async def delete_file(
    file_url: str = Query(..., description="The public URL path of the file to delete (e.g. /uploads/gallery/filename.jpg)")
):
    storage_provider = get_storage_provider()
    success = await storage_provider.delete_file(file_url)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or could not be deleted"
        )
    return None
