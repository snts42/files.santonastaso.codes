# 🚀 Deployment Script for files.santonastaso.codes
# This script automates the deployment process

Write-Host "🚀 Starting deployment of files.santonastaso.codes..." -ForegroundColor Green

# Step 1: Prepare Lambda Package
Write-Host "📦 Step 1: Preparing Lambda package..." -ForegroundColor Yellow
cd backend

# Create temporary directory for Lambda
if (Test-Path "../temp-lambda") {
    Remove-Item -Recurse -Force "../temp-lambda"
}
New-Item -ItemType Directory -Path "../temp-lambda"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt -t ../temp-lambda/

# Copy Python files
Write-Host "Copying Python files..." -ForegroundColor Cyan
Copy-Item "*.py" "../temp-lambda/"

# Create ZIP file
Write-Host "Creating Lambda deployment package..." -ForegroundColor Cyan
cd ../temp-lambda
Compress-Archive -Path ".\*" -DestinationPath "..\terraform\lambda_function.zip" -Force

# Clean up
cd ..
Remove-Item -Recurse -Force "temp-lambda"

Write-Host "✅ Lambda package created successfully!" -ForegroundColor Green

# Step 2: Deploy Infrastructure
Write-Host "🏗️ Step 2: Deploying AWS infrastructure..." -ForegroundColor Yellow
cd terraform

# Plan deployment
Write-Host "Planning Terraform deployment..." -ForegroundColor Cyan
C:\terraform\terraform.exe plan

# Ask for confirmation
$confirmation = Read-Host "Do you want to apply these changes? (y/N)"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "Applying Terraform changes..." -ForegroundColor Cyan
    C:\terraform\terraform.exe apply -auto-approve
    
    # Get API Gateway URL
    $apiUrl = C:\terraform\terraform.exe output -raw api_gateway_url
    Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 API Gateway URL: $apiUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment cancelled by user" -ForegroundColor Red
    exit 1
}

cd ..

# Step 3: Deploy Frontend
Write-Host "🌐 Step 3: Deploying frontend to Vercel..." -ForegroundColor Yellow
cd frontend

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Follow the prompts to configure your deployment:" -ForegroundColor Yellow
Write-Host "- Set up and deploy: Yes" -ForegroundColor White
Write-Host "- Which scope: Your account" -ForegroundColor White
Write-Host "- Link to existing project: No" -ForegroundColor White
Write-Host "- Project name: files-santonastaso-codes" -ForegroundColor White
Write-Host "- Directory: ./" -ForegroundColor White
Write-Host "- Override settings: No" -ForegroundColor White

vercel --prod

cd ..

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domain in Vercel dashboard" -ForegroundColor White
Write-Host "2. Add DNS record: files.santonastaso.codes -> cname.vercel-dns.com" -ForegroundColor White
Write-Host "3. Set environment variable GATSBY_API_BASE_URL in Vercel" -ForegroundColor White
Write-Host "4. Test the application at https://files.santonastaso.codes" -ForegroundColor White
