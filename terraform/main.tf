# Secure File Sharing Infrastructure
# Uses existing AWS user instead of creating IAM resources

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "files_bucket" {
  bucket = var.s3_bucket_name

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "files_bucket_versioning" {
  bucket = aws_s3_bucket.files_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "files_bucket_encryption" {
  bucket = aws_s3_bucket.files_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket public access block
resource "aws_s3_bucket_public_access_block" "files_bucket_pab" {
  bucket = aws_s3_bucket.files_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket CORS configuration
resource "aws_s3_bucket_cors_configuration" "files_bucket_cors" {
  bucket = aws_s3_bucket.files_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    allowed_origins = var.cors_origins
    expose_headers  = ["ETag", "x-amz-meta-custom-header"]
    max_age_seconds = 3000
  }
}

# S3 Bucket lifecycle configuration
resource "aws_s3_bucket_lifecycle_configuration" "files_bucket_lifecycle" {
  bucket = aws_s3_bucket.files_bucket.id

  rule {
    id     = "cleanup_files"
    status = "Enabled"
    
    filter {
      prefix = ""
    }

    expiration {
      days = var.file_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }

    noncurrent_version_expiration {
      noncurrent_days = 1
    }
  }
}

# DynamoDB table for metadata
resource "aws_dynamodb_table" "files_metadata" {
  name           = var.dynamodb_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "file_id"

  attribute {
    name = "file_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-metadata"
  }
}

# CloudWatch Log Group for monitoring
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Environment = var.environment
    Application = var.project_name
  }
}

# Outputs
output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.files_bucket.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.files_bucket.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.files_metadata.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.files_metadata.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.api_logs.name
}

output "backend_env_vars" {
  description = "Environment variables for backend"
  value = {
    AWS_REGION              = var.aws_region
    S3_BUCKET_NAME          = aws_s3_bucket.files_bucket.bucket
    DDB_TABLE_NAME          = aws_dynamodb_table.files_metadata.name
    CORS_ORIGINS            = join(",", var.cors_origins)
    FRONTEND_BASE_URL       = "https://${var.domain_name}"
    USE_LOCALSTACK          = "false"
    AWS_S3_FORCE_PATH_STYLE = "false"
  }
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  sensitive   = true
  value = <<-EOT
    
    AWS Infrastructure Created Successfully!
    
    Next Steps:
    
    1. **Backend Deployment:**
       - Lambda function deployed with API Gateway
       - API URL: https://[API_GATEWAY_ID].execute-api.${var.aws_region}.amazonaws.com/${var.environment}
    
    2. **Frontend Deployment:**
       - Deploy to Vercel with custom domain: your-domain.com
       - Set GATSBY_API_BASE_URL to the API Gateway URL
    
    3. **Environment Variables for Backend:**
       AWS_REGION=${var.aws_region}
       S3_BUCKET_NAME=${aws_s3_bucket.files_bucket.bucket}
       DDB_TABLE_NAME=${aws_dynamodb_table.files_metadata.name}
       CORS_ORIGINS=${join(",", var.cors_origins)}
       FRONTEND_BASE_URL=https://your-domain.com
       USE_LOCALSTACK=false
    
    4. **Test the System:**
       - Upload files via frontend
       - Verify S3 storage
       - Check DynamoDB metadata
       - Test file expiry (3 days)
    
    Resources Created:
    - S3 Bucket: ${aws_s3_bucket.files_bucket.bucket}
    - DynamoDB Table: ${aws_dynamodb_table.files_metadata.name}
    - CloudWatch Logs: ${aws_cloudwatch_log_group.api_logs.name}
    - Lambda Function: ${var.project_name}-${var.environment}-api
    - API Gateway: ${var.project_name}-${var.environment}-api
    
  EOT
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = var.use_lambda ? "https://${aws_api_gateway_rest_api.files_api[0].id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}" : null
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = var.use_lambda ? aws_lambda_function.api[0].function_name : null
}
