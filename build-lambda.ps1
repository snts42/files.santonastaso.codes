# PowerShell script to build Lambda deployment package with correct platform dependencies
Write-Host "Building Lambda deployment package for AWS Lambda..." -ForegroundColor Green

# Check if Docker is available
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker not found. Installing packages for current platform (may not work in Lambda)..." -ForegroundColor Yellow
    
    # Remove old temp-lambda directory
    if (Test-Path "temp-lambda") {
        Remove-Item -Recurse -Force "temp-lambda"
    }
    
    # Create new temp-lambda directory
    New-Item -ItemType Directory -Name "temp-lambda" -Force
    
    # Copy source files
    Copy-Item "backend\*.py" "temp-lambda\"
    Copy-Item "backend\requirements.txt" "temp-lambda\"
    
    # Change to temp-lambda directory
    Push-Location "temp-lambda"
    
    # Install dependencies
    try {
        pip install -r requirements.txt --target . --platform linux_x86_64 --only-binary=:all:
    } catch {
        Write-Host "Platform-specific install failed, falling back to regular install..." -ForegroundColor Yellow
        pip install -r requirements.txt --target .
    }
    
    # Remove unnecessary files
    Get-ChildItem -Recurse -Directory -Name "__pycache__" | Remove-Item -Recurse -Force
    Get-ChildItem -Recurse -Directory -Name "*.dist-info" | Remove-Item -Recurse -Force
    Get-ChildItem -Recurse -File -Name "*.pyc" | Remove-Item -Force
    
    # Create ZIP file
    Compress-Archive -Path * -DestinationPath "..\terraform\lambda_function.zip" -Force
    
    Pop-Location
    
} else {
    Write-Host "Using Docker to build Lambda package..." -ForegroundColor Green
    
    # Use official AWS Lambda Python runtime to build package
    $dockerCmd = @"
docker run --rm -v `"$PWD/backend:/var/task/src`" -v `"$PWD/terraform:/var/task/output`" amazonlinux:2 bash -c "
yum update -y && yum install -y python3 python3-pip zip &&
cd /var/task &&
cp src/*.py . &&
pip3 install -r src/requirements.txt --target . &&
find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true &&
find . -type d -name '*.dist-info' -exec rm -rf {} + 2>/dev/null || true &&
find . -name '*.pyc' -delete &&
zip -r output/lambda_function.zip . -x 'src/*' 'output/*'
"
"@
    
    Invoke-Expression $dockerCmd
}

$zipPath = "terraform\lambda_function.zip"
if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Host "Lambda deployment package created: $zipPath" -ForegroundColor Green
    Write-Host "Package size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "Failed to create Lambda package!" -ForegroundColor Red
}
