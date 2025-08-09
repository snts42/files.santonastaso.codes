from typing import Optional

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError


def get_s3_client(
    region_name: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
):
    cfg = Config(s3={"addressing_style": "path" if force_path_style else "auto"})
    return boto3.client("s3", region_name=region_name, endpoint_url=endpoint_url, config=cfg)


def create_presigned_upload_url(
    bucket: str,
    key: str,
    expires_in_seconds: int,
    region_name: Optional[str] = None,
    content_type: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
) -> str:
    s3 = get_s3_client(region_name, endpoint_url, force_path_style)
    params = {"Bucket": bucket, "Key": key}
    if content_type:
        params["ContentType"] = content_type
    
    return s3.generate_presigned_url(
        ClientMethod="put_object",
        Params=params,
        ExpiresIn=expires_in_seconds,
    )


def create_presigned_download_url(
    bucket: str,
    key: str,
    expires_in_seconds: int,
    region_name: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
) -> str:
    s3 = get_s3_client(region_name, endpoint_url, force_path_style)
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket, 
            "Key": key,
            "ResponseContentDisposition": "attachment"
        },
        ExpiresIn=expires_in_seconds,
    )


def check_s3_object_exists(
    bucket: str,
    key: str,
    region_name: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
) -> bool:
    """Check if an object exists in S3. Returns True if it exists."""
    try:
        s3 = get_s3_client(region_name=region_name, endpoint_url=endpoint_url, force_path_style=force_path_style)
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") == "404":
            return False
        # Re-raise other errors
        raise


def delete_s3_object(
    bucket: str,
    key: str,
    region_name: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
) -> bool:
    """Delete an object from S3. Returns True if successful."""
    try:
        s3 = get_s3_client(region_name=region_name, endpoint_url=endpoint_url, force_path_style=force_path_style)
        s3.delete_object(Bucket=bucket, Key=key)
        print(f"✅ Deleted S3 object: {bucket}/{key}")
        return True
    except ClientError as e:
        print(f"❌ Failed to delete S3 object {bucket}/{key}: {e}")
        return False


def ensure_bucket_exists(
    bucket: str,
    region_name: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    force_path_style: bool = False,
) -> None:
    s3 = get_s3_client(region_name, endpoint_url, force_path_style)
    try:
        s3.head_bucket(Bucket=bucket)
        return
    except ClientError:
        pass
    params = {"Bucket": bucket}
    # When calling real AWS, include CreateBucketConfiguration for all regions except us-east-1.
    # When calling LocalStack (custom endpoint_url), always include it if a region is set to avoid
    # IllegalLocationConstraintException depending on LocalStack settings.
    if region_name:
        if endpoint_url is None:
            if region_name != "us-east-1":
                params["CreateBucketConfiguration"] = {"LocationConstraint": region_name}
        else:
            params["CreateBucketConfiguration"] = {"LocationConstraint": region_name}
    try:
        s3.create_bucket(**params)
    except ClientError as e:
        # Ignore if already exists (LocalStack parallelism)
        if e.response.get("Error", {}).get("Code") not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
            raise


