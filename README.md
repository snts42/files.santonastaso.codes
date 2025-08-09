# files.santonastaso.codes

A secure, minimal, private file-sharing tool that generates expiring download links with limited downloads. Built with FastAPI, AWS S3, DynamoDB, and Gatsby.

## ✨ Features

- 🔐 **Secure file sharing** with expiring links
- 📊 **Download limits** (1-5 downloads per file)
- ⏱️ **Automatic expiry** (1-72 hours)
- 🎨 **Beautiful UI** with dark/light mode
- 📱 **Responsive design** for all devices
- 🚀 **Fast performance** with modern tech stack
- 🌐 **No account required** - instant file sharing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Gatsby App    │◄──►│   FastAPI       │◄──►│   AWS S3 +      │
│   (Frontend)    │    │   (Backend)     │    │   DynamoDB      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     Vercel              Railway/Heroku           AWS Cloud
```

### Tech Stack

**Frontend:**
- Gatsby (React) - Static site generation
- Tailwind CSS - Styling
- Axios - HTTP client

**Backend:**
- FastAPI - REST API
- Uvicorn - ASGI server
- Boto3 - AWS SDK
- Pydantic - Data validation

**Infrastructure:**
- AWS S3 - File storage
- AWS DynamoDB - Metadata storage
- Vercel - Frontend hosting
- Railway/Heroku - Backend hosting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- AWS account (or LocalStack for development)

### 1. Clone the Repository

```bash
git clone https://github.com/snts42/files.santonastaso.codes.git
cd files.santonastaso.codes
```

### 2. Development Setup (with LocalStack)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file
cp env.example .env
# Edit .env and ensure USE_LOCALSTACK=true
```

#### Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp env.example .env.development
# Edit .env.development and set GATSBY_API_BASE_URL=http://localhost:8001
```

#### Start LocalStack (Optional - for local AWS simulation)
```bash
# Install LocalStack
pip install localstack
# Start LocalStack
localstack start
```

#### Run the Application
```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start frontend
cd frontend
npm run develop
```

Visit `http://localhost:8000` to see the application.

### 3. Production Setup (with Real AWS)

#### AWS Setup
```bash
# Run the AWS setup script
cd scripts
python setup-aws.py
```

This will create:
- S3 bucket with CORS and lifecycle policies
- DynamoDB table with TTL enabled
- IAM policy (copy and apply to your IAM user)

#### Backend Configuration
```bash
cd backend
cp env.production.example .env
# Edit .env with your AWS credentials and settings
```

#### Environment Variables

**Backend (.env):**
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=files-santonastaso-production
DDB_TABLE_NAME=files-santonastaso-production

# LocalStack (for development)
USE_LOCALSTACK=false
LOCALSTACK_ENDPOINT=
LOCALSTACK_AUTOCREATE=false
AWS_S3_FORCE_PATH_STYLE=false

# API Configuration
CORS_ORIGINS=https://files.santonastaso.codes
FRONTEND_BASE_URL=https://files.santonastaso.codes
```

**Frontend (.env.production):**
```env
GATSBY_API_BASE_URL=https://your-backend-domain.com
```

## 🚢 Deployment

### Backend Deployment

#### Option 1: Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy from `backend/` directory

#### Option 2: Heroku
```bash
# Install Heroku CLI
cd backend
heroku create your-app-name
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
# ... set other environment variables
git subtree push --prefix backend heroku main
```

#### Option 3: AWS Lambda (Advanced)
See `deployment/aws-lambda/` for Terraform configuration.

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build directory to `frontend/`
3. Set environment variables:
   ```
   GATSBY_API_BASE_URL=https://your-backend-domain.com
   ```
4. Configure custom domain: `files.santonastaso.codes`

## 🔧 Configuration

### Security Features

- **File size limit:** 5MB maximum
- **Rate limiting:** 10 uploads per hour per IP
- **File type restrictions:** Images, documents, videos, audio, text
- **Automatic cleanup:** Files deleted after 7 days (S3 lifecycle)
- **TTL cleanup:** Metadata expires automatically (DynamoDB TTL)

### Customization

#### File Size Limit
Edit `backend/main.py`:
```python
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

#### Allowed File Types
Edit `backend/main.py`:
```python
ALLOWED_CONTENT_TYPES = [
    'image/', 'text/', 'application/pdf',
    'application/zip', 'video/', 'audio/'
]
```

#### Rate Limiting
Edit `backend/main.py`:
```python
RATE_LIMIT_PER_IP = 20  # 20 uploads per hour
RATE_LIMIT_WINDOW = 3600  # 1 hour window
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Test with LocalStack
cd backend
USE_LOCALSTACK=true pytest tests/integration/ -v
```

## 📊 Monitoring

### AWS CloudWatch
Monitor S3 and DynamoDB usage, costs, and performance.

### Application Logs
Check your hosting platform (Railway/Heroku) for application logs.

### Cost Management
- S3 lifecycle policies delete files after 7 days
- DynamoDB TTL automatically cleans expired records
- Rate limiting prevents abuse

## 🔒 Security Considerations

1. **IAM Permissions:** Use minimal required permissions
2. **CORS Configuration:** Restrict to your domains only
3. **File Validation:** Server-side file type and size validation
4. **Rate Limiting:** Prevent abuse and costs
5. **Presigned URLs:** Short-lived (5 minutes for uploads, 5 minutes for downloads)
6. **No sensitive data:** Never store personal information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with LocalStack
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Server is not configured" error:**
- Check your backend `.env` file
- Ensure AWS credentials are correct
- Verify S3 bucket and DynamoDB table exist

**CORS errors:**
- Check CORS_ORIGINS in backend `.env`
- Verify S3 bucket CORS configuration
- Ensure frontend URL matches CORS settings

**File upload fails:**
- Check file size (max 5MB)
- Verify file type is allowed
- Check rate limiting (max 10 uploads/hour)

**LocalStack not working:**
- Ensure LocalStack is running: `localstack status`
- Check USE_LOCALSTACK=true in `.env`
- Verify LOCALSTACK_ENDPOINT in config

### Support

For issues and questions:
- Open a GitHub issue
- Check the troubleshooting section
- Review the configuration docs

## 🎯 Roadmap

- [ ] File encryption at rest
- [ ] Bulk file uploads
- [ ] Custom expiry times
- [ ] File preview functionality
- [ ] Usage analytics dashboard
- [ ] Terraform infrastructure automation

---

Built with ❤️ by [Alex Santonastaso](https://santonastaso.codes)