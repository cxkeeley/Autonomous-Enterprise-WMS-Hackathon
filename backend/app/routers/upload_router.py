from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel

from app.services.upload_service import UploadService
from app.services.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/v1/upload", tags=["Documents"])


class UploadResponse(BaseModel):
    object_key: str
    message: str = "File uploaded successfully"


@router.post("/", response_model=UploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload a receipt or document to MinIO S3 storage.

    Requires authentication. Returns the object key for storage in transactions.
    """
    service = UploadService()
    object_key = await service.upload_file(file)
    return UploadResponse(object_key=object_key)
