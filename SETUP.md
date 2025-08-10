# Complete Setup Guide

Step-by-step instructions to get the secure file sharing application running locally and deployed.

## Prerequisites

- **AWS Account** with appropriate permissions (S3, DynamoDB, Lambda, API Gateway, IAM)
- **Node.js 18+** and **Python 3.8+**
- **Terraform** (for infrastructure management)
- **Docker** (optional, for LocalStack development)
- **Vercel account** (for frontend hosting)

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/secure-file-sharing.git
cd secure-file-sharing
```

## Step 2: Choose Development Path

### Option A: Quick Local Development (LocalStack)

For development without real AWS resources:

```bash
# Install Docker and start LocalStack
docker run --rm -d -p 4566:4566 --name localstack localstack/localstack

# Backend setup
cd backend
cp env.example .env
echo "USE_LOCALSTACK=true" >> .env

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.development

# Start services (in separate terminals)
# Terminal 1: Backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Terminal 2: Frontend
cd frontend
npm run develop  # Runs on http://localhost:8000
```

### Option B: Production Setup (Real AWS)

For production deployment:

#### 2.1: Configure Infrastructure

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your settings:
```hcl
project_name       = "my-file-sharing"
s3_bucket_name     = "my-unique-file-sharing-bucket"
domain_name        = "files.mydomain.com"
aws_region         = "us-east-1"
environment        = "production"
```

#### 2.2: Deploy AWS Infrastructure

```bash
terraform init
terraform plan
terraform apply
```

**Save the outputs**: API Gateway URL, S3 bucket name, DynamoDB table name

#### 2.3: Configure Backend

```bash
cd ../backend
cp env.example .env
```

Edit `.env` with your AWS details:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-bucket-from-terraform-output
DDB_TABLE_NAME=your-table-from-terraform-output
FRONTEND_BASE_URL=https://files.mydomain.com
CORS_ORIGINS=https://files.mydomain.com,http://localhost:8000
```

#### 2.4: Configure Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.production
```

Edit `.env.production` with your API Gateway URL:
```env
GATSBY_API_BASE_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/production
```

#### 2.5: Deploy Frontend

```bash
vercel --prod
# Follow prompts to deploy to Vercel
```

## Step 3: Test the Application

### Local Testing

1. **Test backend health**:
```bash
curl http://localhost:8001/health
```

2. **Test file upload**:
```bash
curl -X POST http://localhost:8001/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.txt", "content_type": "text/plain"}'
```

3. **Access frontend**: http://localhost:8000

### Production Testing

1. **Test API health**:
```bash
curl https://your-api-gateway-url/health
```

2. **Access website**: https://your-vercel-domain.vercel.app

## Step 4: Personal Configuration (Optional)

For developers who want to maintain personal configs while contributing to the public repo:

### 4.1: Create Personal Configs

```bash
# Create personal frontend config
cp frontend/gatsby-config.js frontend/gatsby-config.personal.js
# Edit gatsby-config.personal.js with your personal branding

# Create personal backend config  
cp .env.example .env.personal
# Edit .env.personal with your personal AWS details

# Create personal terraform config
cp terraform/terraform.tfvars.example terraform/terraform.tfvars.personal
# Edit terraform.tfvars.personal with your personal resource names
```

### 4.2: Development Workflow

```bash
# For personal development (use your configs)
cp frontend/gatsby-config.personal.js frontend/gatsby-config.js
cp .env.personal .env
cp terraform/terraform.tfvars.personal terraform/terraform.tfvars

# For contributing to GitHub (use generic configs)
# gatsby-config.js is already generic in the repo
cp backend/env.example .env
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: 
   - Backend uses port 8001
   - Frontend uses port 8000
   - LocalStack uses port 4566

2. **AWS permissions**: Ensure your AWS user has permissions for S3, DynamoDB, Lambda, API Gateway

3. **CORS errors**: Check that your frontend URL is in the `CORS_ORIGINS` environment variable

4. **LocalStack not working**: 
   ```bash
   docker logs localstack
   # Restart if needed
   docker restart localstack
   ```

### File Structure

After setup, your project should look like:
```
secure-file-sharing/
├── backend/
│   ├── .env                 # Your AWS config
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── .env.development    # Local development config
│   ├── .env.production     # Production config
│   ├── gatsby-config.js    # Generic config (in repo)
│   ├── gatsby-config.personal.js  # Your personal config (gitignored)
│   └── package.json        # Node.js dependencies
├── terraform/
│   ├── terraform.tfvars    # Your infrastructure config
│   └── main.tf            # Infrastructure code
└── README.md
```

### Environment Files

- `.env.development`: For local frontend development
- `.env.production`: For production frontend deployment  
- `backend/.env`: For backend configuration
- `.env.personal`: For personal development (gitignored)

## Next Steps

1. **Customize the UI**: Edit frontend components in `frontend/src/components/`
2. **Modify file limits**: Adjust `MAX_FILE_SIZE_MB` and `FILE_RETENTION_DAYS` in backend `.env`
3. **Add monitoring**: Configure CloudWatch alerts for your Lambda function
4. **Set up domain**: Configure custom domain for your Vercel deployment
5. **Enable HTTPS**: Ensure SSL certificates are properly configured

## Support

- **Documentation**: See `DEVELOPMENT.md` for detailed development info
- **Deployment**: See `DEPLOYMENT.md` for advanced deployment options
- **Personal Setup**: See `PERSONAL-CONFIG.md` for personal configuration details
