# Personal Configuration Setup

This file explains how to set up your personal configuration for development and deployment.

## Frontend Personal Configuration

### For Development with Your Personal Branding

1. **Create your personal config from current template**:
```bash
cp frontend/gatsby-config.js frontend/gatsby-config.personal.js
```

2. **Edit gatsby-config.personal.js with your information**:
```javascript
// frontend/gatsby-config.personal.js
module.exports = {
  siteMetadata: {
    siteUrl: `https://your-actual-domain.com`,
    name: 'Your Actual Name',
    title: `Your Name - Secure File Sharing`,
    description: `Your description`,
    author: `Your Name`,
    github: `https://github.com/yourusername`,
    linkedin: `https://www.linkedin.com/in/yourprofile/`,
    resume: "https://your-domain.com/your-resume.pdf",
    repository: `https://github.com/yourusername/your-repo`,
    about: `Your about section...`,
    email: "your-email@domain.com",
    phone: "+your-phone-number",
  },
  // ... rest of config
}
```

3. **Use personal config for development**:
```bash
# Copy personal config to active config for development
cp frontend/gatsby-config.personal.js frontend/gatsby-config.js

# Or use deployment script that handles this automatically
./deploy.ps1
```

## Backend Personal Configuration

1. **Copy environment template**:
```bash
cp .env.personal.example .env.personal
```

2. **Add your AWS credentials and settings**:
```env
# Your actual AWS configuration
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
DDB_TABLE_NAME=your-table
CORS_ORIGINS=https://your-domain.com
```

## Terraform Personal Configuration

1. **Copy terraform variables**:
```bash
cp terraform/terraform.tfvars.personal.example terraform/terraform.tfvars.personal
```

2. **Set your resource names**:
```hcl
project_name = "your-project"
s3_bucket_name = "your-unique-bucket-name"
domain_name = "your-domain.com"
```

## Deployment Workflow

### Personal Development
```bash
# Use personal configs (gitignored)
cp frontend/gatsby-config.personal.js frontend/gatsby-config.js
cp .env.personal .env
cp terraform/terraform.tfvars.personal terraform/terraform.tfvars

# Deploy
./deploy.ps1
```

### GitHub Contribution
```bash
# Use generic configs (committed to repo)  
# (gatsby-config.js is already generic in the repo)
cp backend/env.example backend/.env
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Commit changes
git add .
git commit -m "Your changes"
git push
```

## Important Notes

- **Never commit personal files**: All `.personal` files are gitignored
- **Use deployment script**: The `deploy.ps1` script automatically handles config switching
- **Keep templates updated**: When you modify configs, update the `.example` templates
- **Test before pushing**: Always test with generic configs before committing to GitHub

## Security Reminders

- ✅ Personal AWS credentials in `.env.personal` (gitignored)
- ✅ Personal domain configs in `gatsby-config.personal.js` (gitignored)  
- ✅ Personal terraform vars in `terraform.tfvars.personal` (gitignored)
- ❌ Never commit files containing real credentials or personal information
- ❌ Never push personal domains, emails, or phone numbers to public repo
