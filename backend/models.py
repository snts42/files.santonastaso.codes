from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UploadInitRequest(BaseModel):
    filename: str = Field(..., min_length=1)
    max_downloads: int = Field(..., ge=1, le=5)
    expires_in_hours: int = Field(..., ge=1, le=72)


class UploadInitResponse(BaseModel):
    file_id: str
    upload_url: str
    s3_key: str
    download_page_url: str


class DownloadQuery(BaseModel):
    file_id: str


class DownloadResponse(BaseModel):
    status: str  # ok | expired | maxed | not_found | error
    message: Optional[str] = None
    filename: Optional[str] = None
    download_url: Optional[str] = None
    remaining_downloads: Optional[int] = None
    expires_at_iso: Optional[str] = None
    now_iso: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


