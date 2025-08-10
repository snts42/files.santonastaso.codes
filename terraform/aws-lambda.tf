# Lambda Function for API
resource "aws_lambda_function" "api" {
  count = var.use_lambda ? 1 : 0

  filename         = "lambda_function.zip"
  function_name    = "${var.project_name}-${var.environment}-api"
  role            = aws_iam_role.lambda_role[0].arn
  handler         = "lambda_handler.handler"
  runtime         = "python3.11"
  timeout         = 15  # Reduced for free tier optimization
  memory_size      = 128  # Minimum memory for cost efficiency

  environment {
    variables = {
      REGION     = var.aws_region
      S3_BUCKET_NAME = aws_s3_bucket.files_bucket.bucket
      DDB_TABLE_NAME = aws_dynamodb_table.files_metadata.name
      ENVIRONMENT    = var.environment
      CORS_ORIGINS   = join(",", var.cors_origins)
      FRONTEND_BASE_URL = "https://${var.domain_name}"
      USE_LOCALSTACK = "false"
      AWS_S3_FORCE_PATH_STYLE = "false"
      PRESIGNED_UPLOAD_TTL_SECONDS = "900"
      PRESIGNED_DOWNLOAD_TTL_SECONDS = "120"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.api_logs,
  ]

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = var.project_name
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  count = var.use_lambda ? 1 : 0

  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "${var.project_name}"
  }
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  count = var.use_lambda ? 1 : 0

  name = "${var.project_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectAttributes"
        ]
        Resource = "${aws_s3_bucket.files_bucket.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.files_metadata.arn
      }
    ]
  })
}

# Attach CloudWatch Logs policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  count = var.use_lambda ? 1 : 0

  role       = aws_iam_role.lambda_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway
resource "aws_api_gateway_rest_api" "files_api" {
  count = var.use_lambda ? 1 : 0

  name        = "${var.project_name}-${var.environment}-api"
  description = "Files sharing API"

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "${var.project_name}"
  }
}

# API Gateway Resource
resource "aws_api_gateway_resource" "proxy" {
  count = var.use_lambda ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.files_api[0].id
  parent_id   = aws_api_gateway_rest_api.files_api[0].root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method for proxy
resource "aws_api_gateway_method" "proxy" {
  count = var.use_lambda ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.files_api[0].id
  resource_id   = aws_api_gateway_resource.proxy[0].id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Method for root
resource "aws_api_gateway_method" "proxy_root" {
  count = var.use_lambda ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.files_api[0].id
  resource_id   = aws_api_gateway_rest_api.files_api[0].root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration for proxy
resource "aws_api_gateway_integration" "lambda" {
  count = var.use_lambda ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.files_api[0].id
  resource_id = aws_api_gateway_resource.proxy[0].id
  http_method = aws_api_gateway_method.proxy[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api[0].invoke_arn
}

# API Gateway Integration for root
resource "aws_api_gateway_integration" "lambda_root" {
  count = var.use_lambda ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.files_api[0].id
  resource_id = aws_api_gateway_rest_api.files_api[0].root_resource_id
  http_method = aws_api_gateway_method.proxy_root[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api[0].invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  count = var.use_lambda ? 1 : 0

  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[0].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.files_api[0].execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "files_api" {
  count = var.use_lambda ? 1 : 0

  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
  ]

  rest_api_id = aws_api_gateway_rest_api.files_api[0].id
  stage_name  = var.environment
}

# API Gateway Stage
resource "aws_api_gateway_stage" "files_api" {
  count = var.use_lambda ? 1 : 0

  deployment_id = aws_api_gateway_deployment.files_api[0].id
  rest_api_id   = aws_api_gateway_rest_api.files_api[0].id
  stage_name    = var.environment
}
