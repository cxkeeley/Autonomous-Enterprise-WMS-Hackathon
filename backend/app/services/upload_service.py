import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException, status, UploadFile
from minio import Minio
from minio.error import S3Error

from app.config.settings import settings


class UploadService:
    """Service for uploading files to MinIO S3-compatible storage."""

    def __init__(self):
        self.client = Minio(
            endpoint=settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        self.bucket_name = settings.minio_bucket_name
        self.max_size = settings.max_upload_size_mb * 1024 * 1024

    async def ensure_bucket_exists(self) -> None:
        """Create the bucket if it does not already exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create MinIO bucket: {e.message}",
            )

    async def upload_file(
        self,
        file: UploadFile,
        prefix: str = "receipts",
    ) -> str:
        """
        Upload a file to MinIO.

        Args:
            file: The uploaded file from FastAPI.
            prefix: Optional path prefix (e.g., 'receipts').

        Returns:
            The object path (key) in the bucket.

        Raises:
            HTTPException if the file is too large or upload fails.
        """
        # Read file content
        content = await file.read()

        if len(content) > self.max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size of {settings.max_upload_size_mb}MB",
            )

        # Generate a unique object key
        ext = ""
        if file.filename and "." in file.filename:
            ext = file.filename.rsplit(".", 1)[1].lower()
        object_key = (
            f"{prefix}/{datetime.utcnow().strftime('%Y/%m/%d')}/"
            f"{uuid.uuid4().hex}{('.' + ext) if ext else ''}"
        )

        # Determine content type
        content_type = file.content_type or "application/octet-stream"

        try:
            await self.ensure_bucket_exists()
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_key,
                data=content,
                length=len(content),
                content_type=content_type,
            )
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"MinIO upload failed: {e.message}",
            )

        return object_key

    def get_public_url(self, object_key: str) -> str:
        """Generate a presigned URL for temporary access (7 days)."""
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_key,
                expires=timedelta(days=7),
            )
            return url
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate presigned URL: {e.message}",
            )
