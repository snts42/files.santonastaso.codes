# Deployment Guide

Complete instructions for deploying the secure file sharing application to production.

## Prerequisites

- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- Terraform 1.0+
- Docker (for Lambda builds)
- Node.js 18+
- Vercel account

## AWS Permissions Required

Your AWS user/role needs these permissions:
- S3: Full access for bucket creation and management
- DynamoDB: Full access for table operations
- Lambda: Full access for function deployment
- API Gateway: Full access for API creation
- IAM: Role and policy management
- CloudWatch: Logs and monitoring

## Step 1: Configure Infrastructure

### 1.1 Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
# Required Variables
aws_region     = "us-east-1"          # Your preferred region
project_name   = "secure-file-share"   # Unique project identifier
environment    = "production"

# Optional Customization
s3_bucket_name    = "my-secure-files-bucket"     # Must be globally unique
ddb_table_name    = "secure-files-metadata"
lambda_memory_mb  = 1024
lambda_timeout_seconds = 30

# CORS Configuration
cors_origins = ["https://yourdomain.com"]  # Your frontend domain(s)
```

### 1.2 Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan    # Review changes
terraform apply   # Type 'yes' to confirm
```

**Important**: Save the outputs! You'll need them for backend and frontend configuration.

## Step 2: Deploy Backend (Lambda)

### 2.1 Configure Backend Environment

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with Terraform outputs:
```env
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-from-terraform-output
DDB_TABLE_NAME=your-table-from-terraform-output
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com
```

### 2.2 Build and Deploy Lambda

```bash
cd backend

# Create deployment package
docker run --rm -v "$PWD":/var/task public.ecr.aws/lambda/python:3.11 \
  /bin/bash -c "pip install -r requirements.txt -t /var/task && zip -r lambda_function.zip ."

# Update Lambda function
aws lambda update-function-code \
  --function-name $(terraform output -raw lambda_function_name) \
  --zip-file fileb://lambda_function.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name $(terraform output -raw lambda_function_name) \
  --environment Variables="$(cat .env | jq -Rs 'split("\n") | map(select(length > 0)) | map(split("=")) | map({key: .[0], value: .[1]}) | from_entries')"
```

**Alternative**: Use the deployment script if available:
```bash
./deploy.ps1  # If you have the deployment script
```

## Step 3: Deploy Frontend (Vercel)

### 3.1 Configure Frontend Environment

```bash
cd frontend
```

Create `.env.production`:
```env
GATSBY_API_BASE_URL=https://your-api-gateway-url/production
```

Get your API Gateway URL from Terraform:
```bash
cd terraform
terraform output api_gateway_url
```

**For Personal Branding**: If you want to use your personal details instead of generic placeholders:
```bash
# Use your personal gatsby-config if available
cp gatsby-config.personal.js gatsby-config.js  # If you have personal config
# OR edit gatsby-config.js directly with your information
```

### 3.2 Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd frontend
npx vercel --prod
```

**Option B: Vercel Dashboard**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### 3.3 Custom Domain (Optional)

If using a custom domain:
1. Add domain in Vercel dashboard
2. Update DNS records as instructed
3. Update CORS origins in backend configuration

## Step 4: Verification

### 4.1 Test API Health
```bash
curl https://your-api-gateway-url/production/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
```

### 4.2 Test File Upload Flow

1. Visit your frontend URL
2. Select a test file
3. Upload and verify S3 storage
4. Test download link
5. Verify expiration works

### 4.3 Monitor Resources

Check AWS Console:
- **S3**: Verify bucket created and files uploading
- **DynamoDB**: Check table and item creation
- **Lambda**: Review function logs in CloudWatch
- **API Gateway**: Monitor request metrics

## Security Checklist

- [ ] S3 bucket has public read disabled
- [ ] IAM roles follow least privilege
- [ ] CORS configured for your domain only
- [ ] API Gateway has rate limiting enabled
- [ ] Lambda environment variables secured
- [ ] CloudWatch logging enabled

## Cost Optimization

### S3 Lifecycle Policies
```bash
# Apply lifecycle policy to auto-delete expired files
aws s3api put-bucket-lifecycle-configuration \
  --bucket your-bucket-name \
  --lifecycle-configuration file://s3_lifecycle.json
```

### DynamoDB Settings
- Use on-demand billing for variable workloads
- Enable point-in-time recovery if needed
- Set up auto-scaling for predictable traffic

### Lambda Optimization
- Monitor memory usage and adjust allocation
- Use ARM-based Graviton processors for cost savings
- Set appropriate timeout values

## Monitoring and Maintenance

### CloudWatch Alarms

Create alarms for:
- Lambda function errors > 5%
- API Gateway 5xx errors > 1%
- S3 4xx errors indicating access issues
- DynamoDB throttling events

### Log Analysis

Monitor these log patterns:
```bash
# Lambda errors
aws logs filter-log-events --log-group-name /aws/lambda/your-function-name --filter-pattern "ERROR"

# API Gateway access logs
aws logs filter-log-events --log-group-name API-Gateway-Execution-Logs --filter-pattern "5xx"
```

### Regular Maintenance

- Review and rotate AWS credentials quarterly
- Update Lambda runtime and dependencies
- Monitor S3 storage costs and optimize lifecycle policies
- Review CloudWatch log retention settings

## Troubleshooting

### Common Issues

**CORS Errors**:
```bash
# Update CORS origins in Lambda environment
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables='{"CORS_ORIGINS":"https://yourdomain.com"}'
```

**Lambda Timeout Issues**:
```bash
# Increase timeout (max 15 minutes)
aws lambda update-function-configuration \
  --function-name your-function-name \
  --timeout 60
```

**S3 Access Denied**:
- Verify IAM role has S3 permissions
- Check bucket policy configuration
- Ensure bucket region matches Lambda region

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=DEBUG
```

Then check CloudWatch logs for detailed request/response information.

## Rolling Updates

### Backend Updates
```bash
cd backend
# Update code
docker run --rm -v "$PWD":/var/task public.ecr.aws/lambda/python:3.11 \
  /bin/bash -c "pip install -r requirements.txt -t /var/task && zip -r lambda_function.zip ."

aws lambda update-function-code \
  --function-name $(terraform output -raw lambda_function_name) \
  --zip-file fileb://lambda_function.zip
```

### Frontend Updates
```bash
cd frontend
git push origin main  # Auto-deploys if connected to Vercel
# OR
npx vercel --prod
```

### Infrastructure Updates
```bash
cd terraform
terraform plan   # Review changes carefully
terraform apply  # Apply infrastructure changes
```

## Backup and Recovery

### Database Backup
- Enable DynamoDB point-in-time recovery
- Export table data regularly for long-term backup

### Configuration Backup
- Store Terraform state in S3 backend (recommended)
- Keep environment configurations in secure version control
- Document all manual configuration changes

---

**Need Help?** Check the [README.md](./README.md) for architecture overview or [DEVELOPMENT.md](./DEVELOPMENT.md) for local development setup.
