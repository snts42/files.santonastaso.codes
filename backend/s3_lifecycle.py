"""S3 Lifecycle management for auto-deletion of files."""

from botocore.exceptions import ClientError
from s3_utils import get_s3_client


def setup_s3_lifecycle_policy(bucket_name: str, region_name: str = "us-east-1", endpoint_url: str = None):
    """Set up S3 lifecycle policy to auto-delete files after 7 days."""
    
    s3_client = get_s3_client(region_name=region_name, endpoint_url=endpoint_url)
    
    lifecycle_config = {
        'Rules': [
            {
                'ID': 'delete-old-uploads',
                'Status': 'Enabled',
                'Filter': {
                    'Prefix': 'uploads/'
                },
                'Expiration': {
                    'Days': 7
                },
                'AbortIncompleteMultipartUpload': {
                    'DaysAfterInitiation': 1
                }
            }
        ]
    }
    
    try:
        s3_client.put_bucket_lifecycle_configuration(
            Bucket=bucket_name,
            LifecycleConfiguration=lifecycle_config
        )
        print(f"[OK] S3 lifecycle policy set for bucket {bucket_name}")
        return True
    except ClientError as e:
        print(f"[ERROR] Failed to set S3 lifecycle policy: {e}")
        return False


def remove_s3_lifecycle_policy(bucket_name: str, region_name: str = "us-east-1", endpoint_url: str = None):
    """Remove S3 lifecycle policy from bucket."""
    
    s3_client = get_s3_client(region_name=region_name, endpoint_url=endpoint_url)
    
    try:
        s3_client.delete_bucket_lifecycle(Bucket=bucket_name)
        print(f"[OK] S3 lifecycle policy removed from bucket {bucket_name}")
        return True
    except ClientError as e:
        print(f"[ERROR] Failed to remove S3 lifecycle policy: {e}")
        return False
