# Development Guide

Local development setup and testing instructions for the secure file sharing application.

## Quick Start

### Prerequisites
- Python 3.8+ and Node.js 18+
- Docker (for LocalStack or Lambda builds)
- AWS CLI (optional, for real AWS testing)

### Personal Development Setup

**For Original Developer** (maintaining personal branding):
```bash
# Copy personal configurations
cp frontend/.env.personal.example frontend/.env.personal
cp frontend/gatsby-config.personal.js frontend/gatsby-config.js
cp backend/.env.personal.example backend/.env.personal
cp terraform/terraform.tfvars.personal.example terraform/terraform.tfvars.personal

# Edit with your actual values and use personal configs
```

**For New Developers** (using generic setup):
```bash
# Use generic configurations
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env.development
```

### Local Development Setup

1. **Clone and setup**:
```bash
git clone https://github.com/yourusername/secure-file-sharing.git
cd secure-file-sharing

# Backend setup
cd backend
cp env.example .env
pip install -r requirements.txt

# Frontend setup
cd ../frontend
cp .env.example .env.development
npm install
```

2. **Configure environment**:

**Backend** (`backend/.env`):
```env
# For LocalStack development
USE_LOCALSTACK=true
AWS_REGION=us-east-1
S3_BUCKET_NAME=test-bucket
DDB_TABLE_NAME=test-table
CORS_ORIGINS=http://localhost:8000

# For real AWS testing (optional)
# USE_LOCALSTACK=false
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
```

**Frontend** (`frontend/.env.development`):
```env
GATSBY_API_BASE_URL=http://localhost:8000
```

## Development Options

### Option 1: LocalStack (Recommended)

Run AWS services locally without any costs:

```bash
# Terminal 1: Start LocalStack
docker run --rm -it -p 4566:4566 localstack/localstack

# Terminal 2: Start backend
cd backend
uvicorn main:app --reload --port 8001

# Terminal 3: Start frontend
cd frontend
npm run develop
```

**LocalStack features**:
- S3 bucket simulation
- DynamoDB table simulation
- Lambda function testing
- No AWS credentials required
- Zero costs

### Option 2: Real AWS (Testing)

Test against real AWS resources:

```bash
# Configure AWS credentials
aws configure

# Set backend to use real AWS
echo "USE_LOCALSTACK=false" >> backend/.env

# Start development servers
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8001 &
cd frontend && npm run develop
```

## API Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Upload file test
curl -X POST http://localhost:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.txt", "content_type": "text/plain"}'

# Download test (use file_id from upload response)
curl http://localhost:8000/download/{file_id}
```

### Development Testing

```bash
# Test backend API endpoints
cd backend

# Health check
curl http://localhost:8001/health

# Upload test
curl -X POST http://localhost:8001/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.txt", "content_type": "text/plain"}'

# Frontend development server  
cd frontend
npm run develop  # Starts on http://localhost:8000

# Production build test
npm run build
npm run serve  # Test built version
```

## Development Workflow

### Code Structure

```
backend/
├── main.py           # FastAPI application
├── models.py         # Pydantic models
├── config.py         # Configuration management
├── s3_utils.py       # S3 operations
├── db_utils.py       # DynamoDB operations
└── tests/           # Test suite

frontend/
├── src/
│   ├── components/   # React components
│   ├── pages/       # Gatsby pages
│   └── utils/       # API utilities
├── gatsby-config.js # Gatsby configuration
└── package.json     # Dependencies
```

### Common Development Tasks

**Add new API endpoint**:
1. Add route in `backend/main.py`
2. Add model in `backend/models.py` if needed
3. Add tests in `backend/tests/`
4. Update frontend API calls in `frontend/src/utils/api.js`

**Update UI component**:
1. Modify component in `frontend/src/components/`
2. Update styling with Tailwind classes
3. Test responsive design
4. Add component tests if needed

**Database schema changes**:
1. Update models in `backend/models.py`
2. Modify DynamoDB operations in `backend/db_utils.py`
3. Update Terraform configuration if needed
4. Test with LocalStack first

## Environment Management

### Local Configuration

**Development** (`.env.development`):
- LocalStack endpoints
- Debug logging enabled
- Relaxed CORS settings

**Testing** (`.env.test`):
- Test database names
- Mock AWS services
- Simplified configuration

**Production** (`.env.production`):
- Real AWS resources
- Production logging
- Strict security settings

### Configuration Validation

```bash
# Check backend configuration
cd backend
python -c "from config import get_settings; print(get_settings())"

# Check frontend build
cd frontend
npm run build
```

## Debugging

### Backend Debugging

Enable debug logging:
```env
LOG_LEVEL=DEBUG
```

Common debug commands:
```bash
# Check AWS connectivity
python -c "import boto3; print(boto3.Session().get_available_regions('s3'))"

# Test S3 operations
python -c "from s3_utils import create_s3_client; client = create_s3_client(); print(client.list_buckets())"

# Test database connection
python -c "from db_utils import get_dynamodb_table; table = get_dynamodb_table(); print(table.table_status)"
```

### Frontend Debugging

Enable development mode:
```bash
cd frontend
npm run develop  # Runs with hot reload and detailed errors
```

Check build output:
```bash
npm run build
npm run serve  # Test production build locally
```

### LocalStack Debugging

Check LocalStack services:
```bash
# List S3 buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# List DynamoDB tables
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# View LocalStack logs
docker logs localstack_main
```

## Testing Strategy

### Unit Tests

**Backend**:
```bash
cd backend
python -m pytest tests/test_models.py -v      # Model validation
python -m pytest tests/test_s3_utils.py -v    # S3 operations
python -m pytest tests/test_db_utils.py -v    # Database operations
```

**Frontend**:
```bash
cd frontend
npm test -- --coverage                        # Run with coverage
npm test -- --watch                          # Watch mode
```

### Integration Tests

```bash
# Start LocalStack
docker run --rm -d -p 4566:4566 --name localstack localstack/localstack

# Run integration tests
cd backend
python -m pytest tests/integration/ -v

# Cleanup
docker stop localstack
```

### End-to-End Testing

```bash
# Start LocalStack manually
docker run --rm -d -p 4566:4566 --name localstack localstack/localstack

# Test the application manually
# (No automated E2E tests currently implemented)

# Manual E2E test
curl -X POST http://localhost:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.txt", "content_type": "text/plain"}' \
  | jq -r '.upload_url' \
  | xargs -I {} curl -X PUT {} --data-binary @test.txt
```

## Performance Testing

### Load Testing

```bash
# Install load testing tool
pip install locust

# Create load test (tests/load_test.py)
# Run load test
locust -f tests/load_test.py --host http://localhost:8000
```

### Profiling

**Backend profiling**:
```bash
# Install profiling tools
pip install py-spy

# Profile running application
py-spy record -o profile.svg -- python -m uvicorn main:app
```

**Frontend profiling**:
- Use browser DevTools
- Lighthouse audits
- Bundle analyzer: `npm run analyze`

## Deployment Testing

### Lambda Local Testing

```bash
# Build Lambda package
cd backend
pip install -r requirements.txt -t ./package
cp *.py ./package/
cd package && zip -r ../lambda_function.zip .

# Test with SAM CLI (if installed)
sam local start-api --template template.yaml
```

### Docker Testing

```bash
# Build Lambda-compatible package
docker run --rm -v "$PWD":/var/task public.ecr.aws/lambda/python:3.11 \
  /bin/bash -c "pip install -r requirements.txt -t /var/task && python -m py_compile *.py"
```

## Troubleshooting

### Common Issues

**ModuleNotFoundError**:
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**CORS errors in development**:
```bash
# Update backend CORS settings
echo "CORS_ORIGINS=http://localhost:8000,http://localhost:3000" >> backend/.env
```

**LocalStack connection issues**:
```bash
# Check LocalStack status
curl http://localhost:4566/health

# Restart LocalStack
docker restart localstack_main
```

**Frontend build errors**:
```bash
# Clear Gatsby cache
cd frontend
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable comprehensive debugging:

**Backend**:
```env
LOG_LEVEL=DEBUG
ENVIRONMENT=development
```

**Frontend**:
```env
NODE_ENV=development
GATSBY_LOG_LEVEL=verbose
```

## Contributing

### Development Workflow

1. **Create feature branch**:
```bash
git checkout -b feature/new-feature
```

2. **Develop with tests**:
```bash
# Write tests first
# Implement feature
# Run tests
python -m pytest tests/ -v
npm test
```

3. **Test locally**:
```bash
# Test with LocalStack
# Test with real AWS (optional)
# Test frontend integration
```

4. **Submit pull request**:
- Include test coverage
- Update documentation
- Follow code style guidelines

### Code Style

**Python** (Backend):
- Use Black for formatting: `black .`
- Use flake8 for linting: `flake8 .`
- Type hints encouraged

**JavaScript** (Frontend):
- Use Prettier for formatting
- ESLint for code quality
- Follow React best practices

---

**Need Help?** Check [README.md](./README.md) for project overview or [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment.

1. **Install LocalStack**:
```bash
pip install localstack
# or
docker pull localstack/localstack
```

2. **Start LocalStack**:
```bash
# Using pip installation
localstack start

# Using Docker
docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
```

3. **Configure for LocalStack**:
```bash
# In backend/.env or backend/.env.personal
USE_LOCALSTACK=true
LOCALSTACK_ENDPOINT=http://localhost:4566
LOCALSTACK_AUTOCREATE=true

# Dummy AWS credentials (required for presigned URLs)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
```

4. **Run backend with LocalStack**:
```bash
cd backend
uvicorn main:app --reload --port 8001
# Resources will be created automatically
```

### Option 2: Real AWS (Development Account)

Use a separate AWS account or use your personal/development AWS setup:

1. **Create development resources**:
```bash
cd terraform
terraform workspace new development
terraform apply -var-file="terraform.tfvars.personal"
```

2. **Configure environment**:
```bash
# Use your real AWS credentials in backend/.env.personal
USE_LOCALSTACK=false
AWS_REGION=your-region
S3_BUCKET_NAME=your-dev-bucket
DDB_TABLE_NAME=your-dev-table
```

## LocalStack Features

### Supported Services
- ✅ **S3**: File storage and presigned URLs
- ✅ **DynamoDB**: Metadata storage with TTL
- ✅ **IAM**: Basic role simulation
- ✅ **CloudWatch**: Basic logging simulation

### Development Benefits
- 🆓 **No AWS costs** during development
- ⚡ **Fast iteration** without network latency
- 🔄 **Easy reset** - restart LocalStack to clear all data
- 🧪 **Safe testing** - no impact on production resources

### LocalStack Configuration

The application automatically detects LocalStack mode and:
- Creates S3 buckets and DynamoDB tables automatically
- Uses path-style S3 URLs (required for LocalStack)
- Generates working presigned URLs
- Handles LocalStack-specific endpoint configurations

## Development Workflow

### Daily Development
1. Start LocalStack (if using local development)
2. Run backend: `cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8001`
3. Run frontend: `cd frontend && npm run develop`
4. Test features end-to-end

### Deployment Testing
1. Test with LocalStack first
2. Deploy to development AWS environment
3. Verify production deployment pipeline
4. Deploy to production when ready

## Personal vs Public Configuration

### Files for Personal Development (Gitignored)
- `backend/.env.personal` - Your AWS credentials and settings
- `terraform/terraform.tfvars.personal` - Your resource names
- `frontend/.env.personal` - Your API endpoints

### Files for Public Repository
- `backend/env.example` - Generic configuration template
- `terraform/terraform.tfvars.example` - Generic resource examples
- `frontend/.env.example` - Generic API configuration

## Troubleshooting LocalStack

### Common Issues

**LocalStack not starting**:
```bash
# Check if port 4566 is available
netstat -an | findstr 4566  # Windows
lsof -i :4566              # macOS/Linux

# Kill existing processes if needed
```

**Presigned URLs not working**:
```bash
# Ensure AWS credentials are set (even dummy ones)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

**Resources not created**:
```bash
# Ensure auto-creation is enabled
LOCALSTACK_AUTOCREATE=true

# Check LocalStack logs
localstack logs
```

**CORS issues**:
```bash
# LocalStack doesn't enforce CORS like real S3
# Test CORS configuration in real AWS environment
```

### LocalStack Pro Features

For advanced testing, LocalStack Pro provides:
- Real AWS service compatibility
- Advanced networking features
- Persistent data across restarts
- Cloud API coverage

## Cost Management

### Development Costs
- **LocalStack Free**: $0 (local simulation)
- **AWS Free Tier**: ~$0-5/month (real AWS testing)
- **LocalStack Pro**: $29/month (advanced features)

### Production Deployment
- Follow DEPLOYMENT.md for cost-optimized production setup
- Monitor AWS costs with billing alerts
- Use S3 lifecycle policies for automatic cleanup

## Security Notes

### Development Security
- Never commit real AWS credentials
- Use IAM roles with minimal permissions
- Separate development and production environments
- Regular credential rotation

### LocalStack Security
- LocalStack runs locally - no external data transfer
- Safe for testing with sensitive files
- No internet connectivity required for core features

---

This development setup maintains full LocalStack support while allowing you to continue development with your personal AWS resources without exposing them in the public repository.
