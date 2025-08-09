import os
from dataclasses import dataclass
from typing import List
from pathlib import Path

from dotenv import load_dotenv


# Load environment variables from backend/.env (works from any CWD)
_backend_env = Path(__file__).with_name('.env')
load_dotenv(dotenv_path=_backend_env)


@dataclass
class Settings:
    aws_region: str
    s3_bucket_name: str
    ddb_table_name: str
    cors_origins: List[str]
    frontend_base_url: str
    presigned_upload_ttl_seconds: int
    presigned_download_ttl_seconds: int
    use_localstack: bool
    localstack_endpoint_url: str
    s3_force_path_style: bool
    auto_create_localstack_resources: bool


def get_settings() -> Settings:
    aws_region = os.getenv("AWS_REGION", "eu-west-1")
    s3_bucket_name = os.getenv("S3_BUCKET_NAME", "")
    ddb_table_name = os.getenv("DDB_TABLE_NAME", "")
    cors_origins_env = os.getenv("CORS_ORIGINS", "*")
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:8000")
    presigned_upload_ttl_seconds = int(os.getenv("PRESIGNED_UPLOAD_TTL_SECONDS", "900"))
    presigned_download_ttl_seconds = int(os.getenv("PRESIGNED_DOWNLOAD_TTL_SECONDS", "120"))
    use_localstack = os.getenv("USE_LOCALSTACK", "false").lower() in {"1", "true", "yes"}
    localstack_endpoint_url = os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566")
    s3_force_path_style = os.getenv("AWS_S3_FORCE_PATH_STYLE", "true" if use_localstack else "false").lower() in {"1", "true", "yes"}
    auto_create_localstack_resources = os.getenv("LOCALSTACK_AUTOCREATE", "true").lower() in {"1", "true", "yes"}

    cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    settings = Settings(
        aws_region=aws_region,
        s3_bucket_name=s3_bucket_name,
        ddb_table_name=ddb_table_name,
        cors_origins=cors_origins,
        frontend_base_url=frontend_base_url,
        presigned_upload_ttl_seconds=presigned_upload_ttl_seconds,
        presigned_download_ttl_seconds=presigned_download_ttl_seconds,
        use_localstack=use_localstack,
        localstack_endpoint_url=localstack_endpoint_url,
        s3_force_path_style=s3_force_path_style,
        auto_create_localstack_resources=auto_create_localstack_resources,
    )

    # In LocalStack mode, ensure dummy creds exist so presigning works
    if settings.use_localstack:
        if not os.getenv("AWS_ACCESS_KEY_ID"):
            os.environ["AWS_ACCESS_KEY_ID"] = "test"
        if not os.getenv("AWS_SECRET_ACCESS_KEY"):
            os.environ["AWS_SECRET_ACCESS_KEY"] = "test"

    return settings


