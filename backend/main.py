from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from collections import defaultdict
import time

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db_utils import (
    get_file_metadata,
    put_file_metadata,
    try_increment_downloads,
    ensure_table_exists,
)
from models import DownloadResponse, UploadInitRequest, UploadInitResponse
from s3_utils import (
    check_s3_object_exists,
    create_presigned_download_url,
    create_presigned_upload_url,
    delete_s3_object,
    ensure_bucket_exists,
    get_s3_client,
)
from s3_lifecycle import setup_s3_lifecycle_policy


app = FastAPI(title="files.santonastaso.codes API")
settings = get_settings()

# Simple in-memory rate limiting (for production, use Redis)
upload_requests: Dict[str, list] = defaultdict(list)
RATE_LIMIT_PER_IP = 10  # uploads per hour
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds

def check_rate_limit(ip: str) -> bool:
    """Check if IP is within rate limits."""
    now = time.time()
    # Clean old requests
    upload_requests[ip] = [req_time for req_time in upload_requests[ip] if now - req_time < RATE_LIMIT_WINDOW]
    
    if len(upload_requests[ip]) >= RATE_LIMIT_PER_IP:
        return False
    
    upload_requests[ip].append(now)
    return True

# CORS
if settings.cors_origins == ["*"]:
    allow_origins = ["*"]
else:
    allow_origins = settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Set up S3 lifecycle policies on startup for cost protection."""
    if settings.s3_bucket_name and not settings.use_localstack:
        # Only set up lifecycle in production (real AWS)
        setup_s3_lifecycle_policy(
            bucket_name=settings.s3_bucket_name,
            region_name=settings.aws_region
        )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/upload", response_model=UploadInitResponse)
def initiate_upload(req: UploadInitRequest) -> UploadInitResponse:
    print(f"Upload request received: filename={req.filename}, max_downloads={req.max_downloads}, expires_in_hours={req.expires_in_hours}")
    
    if not settings.s3_bucket_name or not settings.ddb_table_name:
        print("ERROR: Missing S3_BUCKET_NAME or DDB_TABLE_NAME")
        raise HTTPException(
            status_code=500,
            detail="Server not configured: missing S3_BUCKET_NAME or DDB_TABLE_NAME",
        )

    # LocalStack: auto-create bucket and table if enabled
    if settings.use_localstack and settings.auto_create_localstack_resources:
        print("Creating LocalStack resources...")
        ensure_bucket_exists(
            bucket=settings.s3_bucket_name,
            region_name=settings.aws_region,
            endpoint_url=settings.localstack_endpoint_url,
            force_path_style=settings.s3_force_path_style,
        )
        ensure_table_exists(
            table_name=settings.ddb_table_name,
            region_name=settings.aws_region,
            endpoint_url=settings.localstack_endpoint_url,
        )

    file_id = str(uuid.uuid4())
    s3_key = f"uploads/{file_id}/{req.filename}"
    print(f"Generated file_id: {file_id}, s3_key: {s3_key}")

    # Generate presigned upload URL
    upload_url = create_presigned_upload_url(
        bucket=settings.s3_bucket_name,
        key=s3_key,
        expires_in_seconds=settings.presigned_upload_ttl_seconds,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        force_path_style=settings.s3_force_path_style,
    )
    print(f"Generated presigned URL: {upload_url[:100]}...")

    # Compute expiry
    now = datetime.now(tz=timezone.utc)
    expires_at = now + timedelta(hours=req.expires_in_hours)
    expires_at_epoch = int(expires_at.timestamp())
    print(f"File expires at: {expires_at} (epoch: {expires_at_epoch})")

    # Write metadata
    metadata_item = {
        "file_id": file_id,
        "filename": req.filename,
        "s3_key": s3_key,
        "max_downloads": int(req.max_downloads),
        "downloads": 0,
        "expires_at_epoch": expires_at_epoch,
    }
    print(f"Writing metadata: {metadata_item}")
    put_file_metadata(
        table_name=settings.ddb_table_name,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        item=metadata_item,
    )

    download_page_url = f"{settings.frontend_base_url.rstrip('/')}/file/{file_id}"
    response = UploadInitResponse(
        file_id=file_id,
        upload_url=upload_url,
        s3_key=s3_key,
        download_page_url=download_page_url,
    )
    print(f"Returning response: {response}")
    return response


@app.post("/upload-file")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    max_downloads: int = Form(1, ge=1, le=5),
    expires_in_hours: int = Form(24, ge=1, le=72),
):
    """Upload file directly through backend to avoid CORS issues with LocalStack."""
    print(f"Direct upload request: filename={file.filename}, max_downloads={max_downloads}, expires_in_hours={expires_in_hours}")
    
    # Rate limiting
    client_ip = request.client.host
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {RATE_LIMIT_PER_IP} uploads per hour per IP"
        )
    
    # File validation
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_CONTENT_TYPES = [
        'image/', 'text/', 'application/pdf', 'application/zip',
        'application/json', 'application/msword', 'application/vnd.openxmlformats',
        'video/', 'audio/'
    ]
    
    # Read file content first to check size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // 1024 // 1024}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file not allowed"
        )
    
    content_type = file.content_type or ""
    if not any(content_type.startswith(allowed) for allowed in ALLOWED_CONTENT_TYPES):
        raise HTTPException(
            status_code=415,
            detail="File type not allowed. Supported: images, documents, videos, audio, text files"
        )
    
    if not settings.s3_bucket_name or not settings.ddb_table_name:
        raise HTTPException(
            status_code=500,
            detail="Server not configured: missing S3_BUCKET_NAME or DDB_TABLE_NAME",
        )

    # LocalStack: auto-create bucket and table if enabled
    if settings.use_localstack and settings.auto_create_localstack_resources:
        ensure_bucket_exists(
            bucket=settings.s3_bucket_name,
            region_name=settings.aws_region,
            endpoint_url=settings.localstack_endpoint_url,
            force_path_style=settings.s3_force_path_style,
        )
        ensure_table_exists(
            table_name=settings.ddb_table_name,
            region_name=settings.aws_region,
            endpoint_url=settings.localstack_endpoint_url,
        )

    file_id = str(uuid.uuid4())
    s3_key = f"uploads/{file_id}/{file.filename}"

    # Upload file directly to S3
    s3 = get_s3_client(
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        force_path_style=settings.s3_force_path_style,
    )
    
    print(f"File content length: {file_size} bytes")
    print(f"File content preview: {file_content[:100] if file_content else 'EMPTY'}")
    s3.put_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
        Body=file_content,
        ContentType=file.content_type or "application/octet-stream",
    )

    # Compute expiry
    now = datetime.now(tz=timezone.utc)
    expires_at = now + timedelta(hours=expires_in_hours)
    expires_at_epoch = int(expires_at.timestamp())

    # Write metadata
    put_file_metadata(
        table_name=settings.ddb_table_name,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        item={
            "file_id": file_id,
            "filename": file.filename,
            "s3_key": s3_key,
            "max_downloads": max_downloads,
            "downloads": 0,
            "expires_at_epoch": expires_at_epoch,
        },
    )

    download_page_url = f"{settings.frontend_base_url.rstrip('/')}/file/{file_id}"
    return {
        "file_id": file_id,
        "download_page_url": download_page_url,
        "message": "File uploaded successfully"
    }


@app.get("/file-info", response_model=DownloadResponse)
def get_file_info(file_id: str = Query(..., min_length=1)) -> DownloadResponse:
    """Get file information without incrementing download count."""
    if not settings.s3_bucket_name or not settings.ddb_table_name:
        raise HTTPException(status_code=500, detail="Server is not configured")

    item = get_file_metadata(
        table_name=settings.ddb_table_name,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        file_id=file_id,
    )
    if not item:
        return DownloadResponse(status="not_found", message="File not found")

    now_epoch = int(datetime.now(tz=timezone.utc).timestamp())
    filename = item.get("filename")
    max_downloads = int(item.get("max_downloads", 0))
    downloads = int(item.get("downloads", 0))
    expires_at_epoch = int(item.get("expires_at_epoch", 0))

    if now_epoch >= expires_at_epoch:
        return DownloadResponse(
            status="expired",
            message="This link has expired.",
            filename=filename,
            remaining_downloads=max(0, max_downloads - downloads),
            expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
        )

    if downloads >= max_downloads:
        return DownloadResponse(
            status="maxed",
            message="Maximum download limit reached.",
            filename=filename,
            remaining_downloads=0,
            expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
        )

    # File is available for download
    return DownloadResponse(
        status="ok",
        message="File is available for download.",
        filename=filename,
        remaining_downloads=max(0, max_downloads - downloads),
        expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
    )


@app.get("/download", response_model=DownloadResponse)
def download(file_id: str = Query(..., min_length=1)) -> DownloadResponse:
    if not settings.s3_bucket_name or not settings.ddb_table_name:
        raise HTTPException(status_code=500, detail="Server is not configured")

    item = get_file_metadata(
        table_name=settings.ddb_table_name,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        file_id=file_id,
    )
    if not item:
        return DownloadResponse(status="not_found", message="File not found")

    print(f"Retrieved item: {item}")
    now_epoch = int(datetime.now(tz=timezone.utc).timestamp())
    filename = item.get("filename")
    s3_key = item.get("s3_key")
    max_downloads = int(item.get("max_downloads", 0))
    downloads = int(item.get("downloads", 0))
    expires_at_epoch = int(item.get("expires_at_epoch", 0))

    print(f"File info: max_downloads={max_downloads}, downloads={downloads}, expires_at_epoch={expires_at_epoch}, now_epoch={now_epoch}")

    if now_epoch >= expires_at_epoch:
        print("File has expired")
        return DownloadResponse(
            status="expired",
            message="This link has expired.",
            filename=filename,
            remaining_downloads=max(0, max_downloads - downloads),
            expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
        )

    if downloads >= max_downloads:
        print("Maximum downloads reached")
        return DownloadResponse(
            status="maxed",
            message="Maximum download limit reached.",
            filename=filename,
            remaining_downloads=0,
            expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
        )

    print(f"Attempting to increment downloads from {downloads} to {downloads + 1}")
    # Attempt atomic increment; if it fails due to race/expiry, return appropriate status
    new_count = try_increment_downloads(
        table_name=settings.ddb_table_name,
        region_name=settings.aws_region,
        file_id=file_id,
        now_epoch=now_epoch,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
    )
    print(f"Increment result: {new_count}")
    if new_count is None:
        # Either expired or maxed out in the meantime
        print("Increment failed, rechecking metadata")
        item = get_file_metadata(
            table_name=settings.ddb_table_name,
            region_name=settings.aws_region,
            endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
            file_id=file_id,
        ) or {}
        downloads = int(item.get("downloads", downloads))
        max_downloads = int(item.get("max_downloads", max_downloads))
        expires_at_epoch = int(item.get("expires_at_epoch", expires_at_epoch))

        if int(datetime.now(tz=timezone.utc).timestamp()) >= expires_at_epoch:
            return DownloadResponse(status="expired", message="This link has expired.", filename=filename)
        return DownloadResponse(status="maxed", message="Maximum download limit reached.", filename=filename)

    # Check if file still exists in S3 (might have been deleted after reaching max downloads)
    file_exists = check_s3_object_exists(
        bucket=settings.s3_bucket_name,
        key=s3_key,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        force_path_style=settings.s3_force_path_style,
    )
    
    if not file_exists:
        print(f"File {s3_key} no longer exists in S3 (likely deleted after reaching max downloads)")
        return DownloadResponse(
            status="maxed", 
            message="This file has reached its download limit and is no longer available.", 
            filename=filename,
            remaining_downloads=0,
        )

    # Check if this will be the last allowed download
    remaining_downloads = max(0, max_downloads - new_count)
    
    # Generate presigned download URL
    print(f"Generating presigned download URL for bucket={settings.s3_bucket_name}, key={s3_key}")
    download_url = create_presigned_download_url(
        bucket=settings.s3_bucket_name,
        key=s3_key,
        expires_in_seconds=settings.presigned_download_ttl_seconds,
        region_name=settings.aws_region,
        endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
        force_path_style=settings.s3_force_path_style,
    )
    print(f"Generated download URL: {download_url}")
    
    # If this was the last allowed download, schedule deletion after a short delay
    # This gives the user time to download before the file is deleted
    if remaining_downloads == 0:
        print(f"Maximum downloads reached ({new_count}/{max_downloads}). Will delete file from S3 after download...")
        # Note: In production, you might want to use a background task or queue for this
        # For now, we'll delete immediately since presigned URLs have a short expiry
        import threading
        import time
        
        def delayed_delete():
            time.sleep(10)  # Wait 10 seconds for download to complete
            delete_success = delete_s3_object(
                bucket=settings.s3_bucket_name,
                key=s3_key,
                region_name=settings.aws_region,
                endpoint_url=(settings.localstack_endpoint_url if settings.use_localstack else None),
                force_path_style=settings.s3_force_path_style,
            )
            if delete_success:
                print(f"✅ File {s3_key} successfully deleted from S3 after download completion")
            else:
                print(f"⚠️ Failed to delete file {s3_key} from S3 after download completion")
        
        # Start background deletion
        threading.Thread(target=delayed_delete, daemon=True).start()
    
    return DownloadResponse(
        status="ok",
        filename=filename,
        download_url=download_url,
        remaining_downloads=remaining_downloads,
        expires_at_iso=datetime.fromtimestamp(expires_at_epoch, tz=timezone.utc).isoformat() + "Z",
    )


