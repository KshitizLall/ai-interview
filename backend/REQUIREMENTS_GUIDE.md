# Requirements Files Guide

## Overview
This project has multiple requirements files for different use cases:

## Files Description

### 1. `requirements.txt` (Main/Development)
- **Use for**: Local development and testing
- **Contains**: All packages with security updates and optional dev tools
- **Command**: `pip install -r requirements.txt`

### 2. `requirements-prod.txt` (Production - Full)
- **Use for**: Production deployment with all features
- **Contains**: All production packages with flexible version ranges
- **Command**: `pip install -r requirements-prod.txt`

### 3. `requirements-deploy.txt` (Ultra-Minimal) ⭐ **RECOMMENDED FOR DEPLOYMENT**
- **Use for**: Fast deployment with minimal conflicts
- **Contains**: Only essential packages with exact versions
- **Command**: `pip install -r requirements-deploy.txt`

### 4. `requirements-clean.txt` (Clean Production)
- **Use for**: Production with flexible versioning
- **Contains**: Clean production setup with version ranges
- **Command**: `pip install -r requirements-clean.txt`

### 5. `requirements-dev.txt` (Development - Frozen)
- **Use for**: Exact reproduction of development environment
- **Contains**: All packages with exact versions from pip freeze
- **Command**: `pip install -r requirements-dev.txt`

### 6. `requirements-minimal.txt` (Minimal)
- **Use for**: Lightweight deployment
- **Contains**: Core packages only
- **Command**: `pip install -r requirements-minimal.txt`

## Deployment Recommendations

### For Render/Heroku/Railway:
```bash
pip install -r requirements-deploy.txt
```

### For Docker:
```dockerfile
COPY requirements-deploy.txt .
RUN pip install -r requirements-deploy.txt
```

### For Local Development:
```bash
pip install -r requirements.txt
```

### For Testing Production Setup:
```bash
pip install -r requirements-clean.txt
```

## Troubleshooting

### If you get dependency conflicts:
1. Try `requirements-deploy.txt` first (most compatible)
2. If that fails, try `requirements-minimal.txt`
3. If still failing, create a virtual environment and install step by step

### Common Issues:
- **packaging version conflicts**: Use `requirements-deploy.txt`
- **cryptography build issues**: Ensure you have build tools installed
- **bcrypt compilation**: Usually auto-resolves with wheel packages

## Security Notice
All requirements files include the essential security packages:
- PyJWT (modern JWT handling)
- bcrypt (password hashing)  
- cryptography (JWT security)
- slowapi (rate limiting)
- email-validator (input validation)
- zxcvbn (password strength)

**Never remove these packages from production deployments!**