from __future__ import annotations

from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError


def get_ddb_table(
    table_name: str,
    region_name: str,
    endpoint_url: Optional[str] = None,
):
    resource = boto3.resource("dynamodb", region_name=region_name, endpoint_url=endpoint_url)
    return resource.Table(table_name)


def put_file_metadata(
    table_name: str,
    region_name: str,
    item: Dict[str, Any],
    endpoint_url: Optional[str] = None,
) -> None:
    table = get_ddb_table(table_name, region_name, endpoint_url)
    table.put_item(Item=item)


def get_file_metadata(
    table_name: str,
    region_name: str,
    file_id: str,
    endpoint_url: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    table = get_ddb_table(table_name, region_name, endpoint_url)
    resp = table.get_item(Key={"file_id": file_id})
    return resp.get("Item")


def try_increment_downloads(
    table_name: str,
    region_name: str,
    file_id: str,
    now_epoch: int,
    endpoint_url: Optional[str] = None,
) -> Optional[int]:
    """
    Increments downloads atomically only if below max_downloads and not expired.
    Returns the new downloads count if successful, None otherwise.
    """
    table = get_ddb_table(table_name, region_name, endpoint_url)
    try:
        resp = table.update_item(
            Key={"file_id": file_id},
            UpdateExpression="SET downloads = downloads + :inc",
            ConditionExpression=(
                "downloads < max_downloads AND :now < expires_at_epoch"
            ),
            ExpressionAttributeValues={
                ":inc": 1,
                ":now": now_epoch,
            },
            ReturnValues="UPDATED_NEW",
        )
        return int(resp["Attributes"]["downloads"])
    except ClientError as e:
        # ConditionalCheckFailedException -> cannot increment
        if e.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return None
        raise


def ensure_table_exists(
    table_name: str,
    region_name: str,
    endpoint_url: Optional[str] = None,
) -> None:
    """Create DynamoDB table in LocalStack if missing."""
    ddb = boto3.client("dynamodb", region_name=region_name, endpoint_url=endpoint_url)
    try:
        ddb.describe_table(TableName=table_name)
        return
    except ClientError:
        pass

    ddb.create_table(
        TableName=table_name,
        AttributeDefinitions=[{"AttributeName": "file_id", "AttributeType": "S"}],
        KeySchema=[{"AttributeName": "file_id", "KeyType": "HASH"}],
        BillingMode="PAY_PER_REQUEST",
    )
    waiter = ddb.get_waiter("table_exists")
    waiter.wait(TableName=table_name)
    
    # Enable TTL on expires_at field (for production use)
    try:
        ddb.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={
                'AttributeName': 'expires_at',
                'Enabled': True
            }
        )
        print(f"[OK] TTL enabled on {table_name}")
    except ClientError as e:
        print(f"[WARNING] Could not enable TTL: {e}")  # LocalStack might not support TTL


