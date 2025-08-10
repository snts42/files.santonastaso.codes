variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "secure-file-sharing"
}

variable "cors_origins" {
  description = "Allowed CORS origins for S3 bucket"
  type        = list(string)
  default = [
    "https://your-domain.com",
    "http://localhost:8000",
    "http://localhost:3000"
  ]
}

variable "file_retention_days" {
  description = "Number of days to retain files in S3 before deletion"
  type        = number
  default     = 7  # Optimized for free tier - shorter retention

  validation {
    condition     = var.file_retention_days >= 1 && var.file_retention_days <= 365
    error_message = "File retention must be between 1 and 365 days."
  }
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14

  validation {
    condition = contains([
      1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
    ], var.log_retention_days)
    error_message = "Log retention must be a valid CloudWatch retention period."
  }
}

variable "use_lambda" {
  description = "Whether to deploy Lambda function for serverless API"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for the application"
  type        = string
  default     = "your-domain.com"
}

variable "s3_bucket_name" {
  description = "Name for the S3 bucket (must be globally unique)"
  type        = string
  default     = "your-unique-bucket-name"
}

variable "dynamodb_table_name" {
  description = "Name for the DynamoDB table"
  type        = string
  default     = "secure-file-sharing-metadata"
}
