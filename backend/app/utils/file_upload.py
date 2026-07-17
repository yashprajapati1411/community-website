import os
import uuid
from abc import ABC, abstractmethod
from fastapi import UploadFile, HTTPException, status

# Allowed mime types
# Allowed mime types
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB for reports and media

class BaseStorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file: UploadFile, category: str) -> str:
        """
        Save the file to the storage and return its public URL path.
        category must be one of: 'gallery', 'events', 'committee', 'members', 'reports'
        """
        pass

    @abstractmethod
    async def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from storage given its public URL path.
        """
        pass

class LocalStorageProvider(BaseStorageProvider):
    def __init__(self, base_dir: str = "uploads", upload_url_prefix: str = "/uploads"):
        self.base_dir = os.path.abspath(base_dir)
        self.upload_url_prefix = upload_url_prefix

    async def save_file(self, file: UploadFile, category: str) -> str:
        # Validate category
        valid_categories = ["gallery", "events", "committee", "members", "reports"]
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid upload category. Must be one of {valid_categories}"
            )

        # Validate file type (mimetype)
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Allowed types: {ALLOWED_MIME_TYPES}"
            )

        # Validate file size by reading contents directly
        contents = await file.read()
        file_size = len(contents)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds limit of {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )

        # Generate unique filename
        original_filename = file.filename or "file"
        _, ext = os.path.splitext(original_filename)
        if not ext:
            # Try to map mimetype to extension
            mime_to_ext = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp",
                "application/pdf": ".pdf"
            }
            ext = mime_to_ext.get(file.content_type, ".jpg")

        unique_filename = f"{uuid.uuid4().hex}{ext}"

        # Target directory path
        target_dir = os.path.join(self.base_dir, category)
        # Ensure target directory exists (safety first)
        os.makedirs(target_dir, exist_ok=True)

        target_file_path = os.path.join(target_dir, unique_filename)

        # Write file directly to disk
        try:
            with open(target_file_path, "wb") as buffer:
                buffer.write(contents)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to write file to local disk: {str(e)}"
            )

        # Return the public URL path
        return f"{self.upload_url_prefix}/{category}/{unique_filename}"

    async def delete_file(self, file_url: str) -> bool:
        # Expected URL format: /uploads/{category}/{filename}
        if not file_url.startswith(self.upload_url_prefix):
            return False

        # Get the relative path
        rel_path = file_url[len(self.upload_url_prefix):].lstrip("/")
        # Separate category and filename
        parts = rel_path.split("/")
        if len(parts) != 2:
            return False

        category, filename = parts
        file_path = os.path.abspath(os.path.join(self.base_dir, category, filename))

        # Check if file exists and is indeed within the base directory (prevent path traversal)
        if not file_path.startswith(self.base_dir):
            return False

        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                return True
            except Exception:
                return False
        return False

# Storage provider factory helper
def get_storage_provider() -> BaseStorageProvider:
    # Returns the active storage provider. Can be configured to return S3/GCS in the future.
    return LocalStorageProvider()
