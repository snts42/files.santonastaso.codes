# Secure File Sharing Application

A secure file sharing platform with temporary links and configurable expiration. Built with **Gatsby (React)**, **FastAPI (Python)**, and **AWS**.

## Features

- Secure file uploads with temporary links (1-72 hours)
- Download limits and automatic cleanup
- Modern responsive UI with dark/light mode
- SEO optimized with Google Analytics
- Infrastructure as Code with Terraform

## Architecture

```
Frontend (Gatsby)  →  API Gateway  →  Lambda (FastAPI)  →  AWS Services
     Vercel              AWS              Python           S3 + DynamoDB
```

## Quick Start

1. **Setup**: Follow [SETUP.md](./SETUP.md) for complete setup instructions
2. **Development**: See [DEVELOPMENT.md](./DEVELOPMENT.md) for local development
3. **Deployment**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload` | POST | Generate upload URL |
| `/download/{file_id}` | GET | Download file |
| `/files/{file_id}` | DELETE | Delete file |

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete step-by-step setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment instructions
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development guide
- **[PERSONAL-CONFIG.md](./PERSONAL-CONFIG.md)** - Personal configuration setup

## License

MIT License - see LICENSE file for details.