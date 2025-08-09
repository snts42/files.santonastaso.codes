# Terraform variables for files.santonastaso.codes
project_name = "files-santonastaso"
environment = "production"
aws_region = "eu-west-2"

# S3 bucket name (must be globally unique)
s3_bucket_name = "files-santonastaso-codes"

# DynamoDB table name
dynamodb_table_name = "files-santonastaso-metadata"

# CORS origins (your frontend domains)
cors_origins = [
  "https://files.santonastaso.codes",
  "http://localhost:8000",
  "http://localhost:8001"
]

# Use Lambda for serverless deployment
use_lambda = true

# Free tier optimization - short retention
file_retention_days = 3
log_retention_days = 7
