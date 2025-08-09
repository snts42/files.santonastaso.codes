# Windows Deployment Guide
## AWS Free Tier + Vercel + Lambda Setup

## 🎯 Architecture for AWS Free Tier

```
Vercel (Frontend) ←→ AWS Lambda + API Gateway ←→ S3 + DynamoDB
     FREE              FREE TIER (1M requests)     FREE TIER (5GB)
```

## 📋 Step-by-Step Deployment

### 1. Prerequisites

```powershell
# Install required tools
# - AWS CLI: https://aws.amazon.com/cli/
# - Terraform: https://terraform.io/downloads
# - Python 3.8+: https://python.org
# - Node.js 18+: https://nodejs.org

# Verify installations
aws --version
terraform --version
python --version
node --version
```

### 2. AWS Setup

```powershell
# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 3. Deploy Infrastructure

```powershell
# Navigate to terraform directory
cd terraform

# Copy and edit variables
copy terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# Initialize and deploy
terraform init
terraform plan -var="use_lambda=true"
terraform apply -var="use_lambda=true"

# Save the outputs
terraform output > ../terraform-outputs.txt
```

### 4. Deploy Lambda Function

```powershell
# Create deployment directory
mkdir lambda-deploy
cd lambda-deploy

# Copy backend code
xcopy /E /I ..\backend\* .

# Install dependencies
pip install -r requirements.txt -t .

# Clean up for smaller package size
powershell -Command "Get-ChildItem -Recurse -Directory -Name '__pycache__' | Remove-Item -Recurse -Force"
powershell -Command "Get-ChildItem -Recurse -Directory -Name '*.dist-info' | Remove-Item -Recurse -Force"
powershell -Command "Get-ChildItem -Recurse -File -Name '*.pyc' | Remove-Item -Force"

# Create ZIP file (requires PowerShell 5.0+)
powershell -Command "Compress-Archive -Path .\* -DestinationPath ..\lambda_function.zip -Force"

cd ..

# Update Lambda function
aws lambda update-function-code --function-name files-santonastaso-production-api --zip-file fileb://lambda_function.zip

# Test the deployment
aws lambda invoke --function-name files-santonastaso-production-api response.json
type response.json

# Cleanup
rmdir /S /Q lambda-deploy
del lambda_function.zip
```

### 5. Get API Gateway URL

```powershell
# Get the API Gateway URL from Terraform
cd terraform
terraform output api_gateway_url

# Example output: https://abc123.execute-api.us-east-1.amazonaws.com/production
```

### 6. Deploy Frontend to Vercel

#### Option A: Vercel CLI
```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Set environment variable
echo "GATSBY_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/production" > .env.production

# Deploy to Vercel
vercel --prod

# Configure custom domain in Vercel dashboard
# Point files.santonastaso.codes to Vercel
```

#### Option B: Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Set framework to "Gatsby"
3. Set root directory to `frontend/`
4. Add environment variable:
   - Name: `GATSBY_API_BASE_URL`
   - Value: `https://your-api-gateway-url.amazonaws.com/production`
5. Deploy

### 7. Configure Custom Domain

#### DNS Settings (in your domain provider):
```
Type: CNAME
Name: files
Value: cname.vercel-dns.com
```

#### Vercel Dashboard:
1. Go to your project settings
2. Click "Domains"
3. Add `files.santonastaso.codes`
4. Verify DNS propagation

## 🔍 Testing Your Deployment

### Test Backend API
```powershell
# Test health endpoint
curl https://your-api-gateway-url.amazonaws.com/production/health

# Test file upload (should return upload URL)
curl -X POST https://your-api-gateway-url.amazonaws.com/production/upload-file `
  -H "Content-Type: multipart/form-data" `
  -F "file=@test.txt" `
  -F "max_downloads=1" `
  -F "expires_in_hours=24"
```

### Test Frontend
```
Visit: https://files.santonastaso.codes
- Upload a small file
- Check download functionality
- Verify expiry and download limits
```

## 💰 AWS Free Tier Monitoring

### CloudWatch Costs Dashboard
```powershell
# Check Lambda invocations
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/files-santonastaso"

# Check S3 usage
aws s3 ls s3://files-santonastaso-production --summarize --human-readable --recursive

# Check DynamoDB usage
aws dynamodb describe-table --table-name files-santonastaso-production
```

### Free Tier Limits:
- **Lambda**: 1M requests + 400,000 GB-seconds/month
- **API Gateway**: 1M API calls/month  
- **S3**: 5GB storage + 20,000 GET + 2,000 PUT/month
- **DynamoDB**: 25GB + 25 WCU/RCU/month

## 🛡️ Security & Cost Protection

### Automated Cleanup (Already Configured):
- **S3 Lifecycle**: Files deleted after 3 days
- **DynamoDB TTL**: Metadata expires automatically
- **Rate Limiting**: 10 uploads per hour per IP
- **File Size Limit**: 5MB maximum

### Monitor Free Tier Usage:
1. AWS Console → Billing → Free Tier
2. Set up billing alerts for $1
3. Monitor CloudWatch metrics

## 🔧 Troubleshooting

### Common Issues:

**Lambda deployment fails:**
```powershell
# Check function exists
aws lambda get-function --function-name files-santonastaso-production-api

# Check logs
aws logs tail /aws/lambda/files-santonastaso-production-api --follow
```

**CORS errors:**
```powershell
# Verify API Gateway CORS
aws apigateway get-rest-apis

# Check S3 CORS
aws s3api get-bucket-cors --bucket files-santonastaso-production
```

**Frontend deployment fails:**
```powershell
# Check environment variables
cd frontend
cat .env.production

# Test build locally
npm run build
```

## 🚀 Maintenance

### Update Lambda Code:
```powershell
# Make changes to backend/
# Redeploy:
cd lambda-deploy
xcopy /E /I ..\backend\* .
pip install -r requirements.txt -t .
powershell -Command "Compress-Archive -Path .\* -DestinationPath ..\lambda_function.zip -Force"
aws lambda update-function-code --function-name files-santonastaso-production-api --zip-file fileb://lambda_function.zip
```

### Update Infrastructure:
```powershell
cd terraform
terraform plan
terraform apply
```

### Monitor Costs:
- AWS Billing Dashboard
- CloudWatch metrics
- S3 storage analysis

## 📊 Expected Monthly Costs

With your traffic patterns (AWS Free Tier):
- **Lambda**: $0 (well within free tier)
- **API Gateway**: $0 (well within free tier)  
- **S3**: $0 (well within free tier)
- **DynamoDB**: $0 (well within free tier)
- **Vercel**: $0 (free tier)

**Total: $0/month** 🎉

Your file size limits (5MB) and retention (3 days) ensure you stay well within all free tier limits!
