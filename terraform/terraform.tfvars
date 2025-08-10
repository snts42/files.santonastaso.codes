# Your actual Terraform configuration
project_name = "files-santonastaso"
environment = "production"
aws_region = "eu-west-2"

# Your actual storage resources
s3_bucket_name = "files-santonastaso-codes"
dynamodb_table_name = "files-santonastaso-metadata"

# Your actual domain configuration
domain_name = "files.santonastaso.codes"
cors_origins = [
  "https://files.santonastaso.codes",
  "http://localhost:8000",
  "http://localhost:8001"
]

# Application configuration
file_retention_days = 3
max_file_size_mb = 100

# Lambda configuration
lambda_timeout = 30
lambda_memory = 1024

# Deployment settings
use_lambda = true
