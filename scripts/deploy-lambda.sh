#!/bin/bash
# Deploy FastAPI to AWS Lambda
# Optimized for AWS Free Tier

set -e

echo "🚀 Deploying FastAPI to AWS Lambda..."

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if Terraform is initialized
if [ ! -d "terraform/.terraform" ]; then
    echo "❌ Terraform not initialized. Run: cd terraform && terraform init"
    exit 1
fi

# Create deployment directory
echo "📦 Creating deployment package..."
rm -rf lambda-deploy
mkdir -p lambda-deploy

# Copy backend code
cp -r backend/* lambda-deploy/
cd lambda-deploy

# Install dependencies in deployment directory
echo "📥 Installing dependencies..."
pip install -r requirements.txt -t .

# Remove unnecessary files to reduce package size (free tier optimization)
echo "🧹 Optimizing package size for free tier..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete

# Create ZIP file
echo "📦 Creating deployment ZIP..."
zip -r ../lambda_function.zip . -x "*.git*" "*.DS_Store*" "*.env*"

cd ..

# Deploy with Terraform
echo "🚀 Deploying to AWS..."
cd terraform
terraform apply -var="use_lambda=true" -auto-approve

# Get the API Gateway URL
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "Check Terraform outputs for API URL")

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. API Gateway URL: $API_URL"
echo "2. Update your frontend environment variable:"
echo "   GATSBY_API_BASE_URL=$API_URL"
echo "3. Deploy frontend to Vercel"
echo ""
echo "💰 Free Tier Status:"
echo "- Lambda: Optimized for 1M requests/month"
echo "- API Gateway: Optimized for 1M calls/month"
echo "- S3: Lifecycle policy set to 3 days retention"
echo "- DynamoDB: TTL enabled for automatic cleanup"
echo ""
echo "🔍 Monitoring:"
echo "- CloudWatch Logs: /aws/lambda/files-santonastaso-production-api"
echo "- Lambda Console: AWS Lambda > files-santonastaso-production-api"
echo "- API Gateway Console: AWS API Gateway > files-santonastaso-production-api"

# Cleanup
rm -rf ../lambda-deploy
rm -f ../lambda_function.zip
