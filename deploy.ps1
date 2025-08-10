#!/usr/bin/env pwsh
# Personal Deployment Script for files.santonastaso.codes
# Usage: ./deploy.ps1 [-BackendOnly] [-FrontendOnly] [-Local]

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly, 
    [switch]$Local
)

Write-Host "🚀 Starting deployment for files.santonastaso.codes..." -ForegroundColor Green

# Ensure personal config files are active
Write-Host "📋 Setting up personal configuration files..." -ForegroundColor Yellow

# Copy personal configs to active files
Copy-Item "backend\.env.personal" "backend\.env" -Force
Copy-Item "frontend\.env.personal" "frontend\.env.production" -Force  
Copy-Item "terraform\terraform.tfvars.personal" "terraform\terraform.tfvars" -Force

Write-Host "✅ Personal configuration files activated" -ForegroundColor Green

if ($Local) {
    Write-Host "🔧 Starting local development servers..." -ForegroundColor Yellow
    
    # Start LocalStack if needed
    Write-Host "Starting LocalStack (if installed)..."
    try {
        Start-Process "localstack" -ArgumentList "start" -NoNewWindow
        Write-Host "✅ LocalStack started" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  LocalStack not found - using AWS directly" -ForegroundColor Yellow
    }
    
    # Start backend
    Write-Host "Starting backend server..."
    Start-Process "powershell" -ArgumentList "-Command", "cd backend; uvicorn main:app --reload --port 8000"
    
    # Start frontend  
    Write-Host "Starting frontend server..."
    Start-Process "powershell" -ArgumentList "-Command", "cd frontend; npm start"
    
    Write-Host "🎉 Local development servers started!" -ForegroundColor Green
    Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:8001" -ForegroundColor Cyan
    return
}

if (-not $FrontendOnly) {
    Write-Host "🔨 Building and deploying backend..." -ForegroundColor Yellow
    
    # Clean previous build
    if (Test-Path "lambda-package") {
        Remove-Item "lambda-package" -Recurse -Force
    }
    
    # Build Lambda package
    Write-Host "Building Lambda deployment package..."
    New-Item -ItemType Directory -Name "lambda-package" -Force | Out-Null
    
    # Install dependencies
    Set-Location "backend"
    & python -m pip install -r requirements.txt --target "../lambda-package" --upgrade
    
    # Copy source files
    Copy-Item "*.py" "../lambda-package/" -Force
    
    # Create ZIP file
    Set-Location "../lambda-package"
    Compress-Archive -Path "*" -DestinationPath "../terraform/lambda_function.zip" -Force
    Set-Location ".."
    
    # Deploy infrastructure
    Write-Host "Deploying infrastructure with Terraform..."
    Set-Location "terraform"
    & terraform apply -var-file="terraform.tfvars" -auto-approve
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

if (-not $BackendOnly) {
    Write-Host "🌐 Deploying frontend..." -ForegroundColor Yellow
    
    Set-Location "frontend"
    
    # Build and deploy to Vercel
    & vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

# Cleanup
Write-Host "🧹 Cleaning up build artifacts..." -ForegroundColor Yellow
if (Test-Path "lambda-package") {
    Remove-Item "lambda-package" -Recurse -Force
}

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📊 Your application is live at: https://files.santonastaso.codes" -ForegroundColor Cyan
