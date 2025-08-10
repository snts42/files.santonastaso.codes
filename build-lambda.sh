#!/bin/bash
# Script to build Lambda deployment package with correct platform dependencies

echo "Building Lambda deployment package for AWS Lambda..."

# Remove old temp-lambda directory
rm -rf temp-lambda

# Create new temp-lambda directory
mkdir temp-lambda

# Copy source files
cp backend/*.py temp-lambda/
cp backend/requirements.txt temp-lambda/

# Change to temp-lambda directory
cd temp-lambda

# Install dependencies for linux/x86_64 platform (AWS Lambda)
pip install -r requirements.txt --platform linux_x86_64 --target . --only-binary=:all:

# Remove unnecessary files to reduce package size
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name "*.dist-info" -exec rm -rf {} +
find . -name "*.pyc" -delete

# Create ZIP file for deployment
zip -r ../terraform/lambda_function.zip .

echo "Lambda deployment package created: terraform/lambda_function.zip"
echo "Package size: $(du -h ../terraform/lambda_function.zip | cut -f1)"
