# 🚀 Complete Deployment Guide - files.santonastaso.codes

## 📋 Overview

This guide covers the complete deployment of your secure file-sharing application:
- **Backend**: AWS Lambda + API Gateway
- **Frontend**: Vercel with custom domain
- **Storage**: AWS S3 + DynamoDB
- **Domain**: files.santonastaso.codes

## 🏗️ Project Structure

```
files.santonastaso/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API
│   ├── lambda_handler.py   # Lambda adapter
│   ├── requirements.txt    # Python dependencies
│   └── env.production      # Production environment
├── frontend/               # Gatsby frontend
│   ├── src/               # React components
│   ├── gatsby-config.js   # Gatsby configuration
│   └── package.json       # Node dependencies
├── terraform/             # AWS infrastructure
│   ├── main.tf           # Core resources
│   ├── variables.tf      # Configuration
│   └── terraform.tfvars  # Environment values
└── README.md             # Project documentation
```

## 🔧 Prerequisites

### Required Tools
- ✅ **Terraform** (installed)
- ✅ **AWS CLI** (configured)
- ✅ **Node.js** (for frontend)
- ✅ **Python** (for backend)
- ✅ **Git** (for version control)

### AWS Resources (Already Created)
- ✅ **S3 Bucket**: `files-santonastaso-codes`
- ✅ **DynamoDB Table**: `files-santonastaso-metadata`
- ✅ **CloudWatch Logs**: `/aws/lambda/files-santonastaso-production`

## 📝 Step 1: Prepare GitHub Repository

### 1.1 Create New Repository
```bash
# Go to GitHub.com and create new repository:
# Name: files.santonastaso.codes
# Description: Secure file sharing with expiring links
# Public repository
# Don't initialize with README (we have one)
```

### 1.2 Initialize Local Repository
```bash
# Navigate to project root
cd C:\Users\santo\Documents\github-projects\files.santonastaso

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Secure file sharing application"

# Add remote repository
git remote add origin https://github.com/snts42/files.santonastaso.codes.git

# Push to GitHub
git push -u origin main
```

### 1.3 Verify Repository Structure
```bash
# Check what's being committed
git status

# Verify .gitignore is working
git check-ignore node_modules/
git check-ignore .venv/
git check-ignore __pycache__/
```

## 🏗️ Step 2: Deploy Backend to AWS Lambda

### 2.1 Prepare Lambda Package
```bash
# Navigate to backend directory
cd backend

# Create Lambda deployment package
pip install -r requirements.txt -t ../temp-lambda/
cp *.py ../temp-lambda/
cd ../temp-lambda

# Create ZIP file
Compress-Archive -Path ".\*" -DestinationPath "..\terraform\lambda_function.zip" -Force

# Clean up
cd ..
Remove-Item -Recurse -Force temp-lambda
```

### 2.2 Update Terraform for Lambda
```bash
# Navigate to terraform directory
cd terraform

# Update terraform.tfvars to enable Lambda
# Change: use_lambda = true
```

### 2.3 Deploy Lambda Infrastructure
```bash
# Plan the deployment
C:\terraform\terraform.exe plan

# Apply the changes
C:\terraform\terraform.exe apply -auto-approve
```

### 2.4 Test Lambda Function
```bash
# Get the API Gateway URL from terraform output
C:\terraform\terraform.exe output api_gateway_url

# Test the health endpoint
curl https://[API_GATEWAY_ID].execute-api.eu-west-2.amazonaws.com/production/health
```

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend for Production
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run serve
```

### 3.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: files-santonastaso-codes
# - Directory: ./
# - Override settings: No
```

### 3.3 Configure Environment Variables in Vercel
```bash
# Set the backend API URL
vercel env add GATSBY_API_BASE_URL production
# Value: https://[API_GATEWAY_ID].execute-api.eu-west-2.amazonaws.com/production
```

## 🔗 Step 4: Configure Custom Domain

### 4.1 Add Domain in Vercel
```bash
# Add custom domain
vercel domains add files.santonastaso.codes

# Follow the DNS configuration instructions
```

### 4.2 Configure DNS Records
```bash
# In your domain registrar (where santonastaso.codes is hosted):
# Add CNAME record:
# Name: files
# Value: cname.vercel-dns.com
# TTL: 3600
```

### 4.3 Verify Domain
```bash
# Wait for DNS propagation (5-10 minutes)
# Check domain status in Vercel dashboard
vercel domains ls
```

## 🧪 Step 5: Testing

### 5.1 Test Backend API
```bash
# Test health endpoint
curl https://files.santonastaso.codes/api/health

# Test file upload (via frontend)
# Go to https://files.santonastaso.codes
# Upload a test file
```

### 5.2 Test Frontend
```bash
# Visit the production site
https://files.santonastaso.codes

# Test features:
# - File upload
# - Download link generation
# - File download
# - Expiry functionality
```

### 5.3 Monitor Logs
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/files-santonastaso-production --follow

# Check Vercel logs
vercel logs files.santonastaso.codes
```

## 🔧 Step 6: Production Configuration

### 6.1 Update Environment Variables
```bash
# Backend (Lambda environment variables are set via Terraform)
# Frontend (Vercel environment variables)
vercel env add GATSBY_API_BASE_URL production
```

### 6.2 Security Headers
```bash
# Vercel automatically adds security headers
# Verify in browser dev tools
```

### 6.3 SSL Certificate
```bash
# Vercel automatically provisions SSL certificates
# Verify https://files.santonastaso.codes loads with SSL
```

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Set Up Monitoring
```bash
# AWS CloudWatch (already configured)
# Vercel Analytics (optional)
vercel analytics enable
```

### 7.2 Cost Monitoring
```bash
# Check AWS costs
aws ce get-cost-and-usage --time-period Start=2025-08-01,End=2025-08-31 --granularity MONTHLY --metrics BlendedCost
```

### 7.3 Backup Strategy
```bash
# S3: Versioning enabled
# DynamoDB: Point-in-time recovery enabled
# Code: GitHub repository
```

## 🚨 Troubleshooting

### Common Issues

#### Lambda Cold Start
```bash
# Solution: Keep Lambda warm with scheduled events
# Or use Provisioned Concurrency for better performance
```

#### CORS Issues
```bash
# Check CORS configuration in backend
# Verify frontend domain is in allowed origins
```

#### File Upload Failures
```bash
# Check S3 bucket permissions
# Verify presigned URL generation
# Check file size limits (5MB)
```

#### Domain Not Loading
```bash
# Check DNS propagation
# Verify CNAME record
# Check Vercel domain configuration
```

## 📈 Performance Optimization

### Frontend
- ✅ Gatsby static generation
- ✅ Image optimization
- ✅ Code splitting
- ✅ Service worker (PWA)

### Backend
- ✅ Lambda cold start optimization
- ✅ Connection pooling
- ✅ Caching strategies

### Infrastructure
- ✅ CDN (Vercel Edge Network)
- ✅ S3 lifecycle policies
- ✅ DynamoDB TTL

## 🔒 Security Checklist

- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ File type validation
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ AWS IAM least privilege
- ✅ Environment variables secured

## 📞 Support

### Useful Commands
```bash
# Check Lambda logs
aws logs tail /aws/lambda/files-santonastaso-production --follow

# Check Vercel deployment status
vercel ls

# Check domain status
vercel domains ls

# Redeploy frontend
vercel --prod

# Update Lambda function
# (Update code and redeploy via Terraform)
```

### Resources
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Vercel Documentation](https://vercel.com/docs)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)

---

## 🎉 Deployment Complete!

Your secure file-sharing application is now live at:
**https://files.santonastaso.codes**

### Features Working:
- ✅ File upload (max 5MB)
- ✅ Secure download links
- ✅ Expiring links (1-72 hours)
- ✅ Download limits (1-5 downloads)
- ✅ Automatic file cleanup (3 days)
- ✅ Mobile-responsive design
- ✅ Dark/light mode
- ✅ Custom domain with SSL

### Cost Estimate (Free Tier):
- **AWS Lambda**: Free (1M requests/month)
- **S3**: Free (5GB storage)
- **DynamoDB**: Free (25GB storage)
- **Vercel**: Free (100GB bandwidth)
- **Domain**: Your existing domain

**Total Cost: $0/month** (within free tier limits) 🎯
