from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    app_name: str = "Warehouse WMS API"
    debug: bool = False

    # Database
    database_url: str = "postgresql://postgres:secret@localhost:5432/warehouse_db"

    # JWT
    jwt_secret_key: str = "change-me-in-production-use-a-real-secret"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 480  # 8 hours

    # MinIO (S3-compatible)
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_name: str = "warehouse-receipts"
    minio_secure: bool = False

    # Upload
    max_upload_size_mb: int = 10

    model_config = {"env_prefix": "WMS_", "env_file": ".env"}


settings = Settings()
