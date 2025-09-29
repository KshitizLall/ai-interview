# Deployment Guide for Render

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Render Account**: Create an account at [render.com](https://render.com)
3. **OpenAI API Key**: You'll need this for AI features

## Option 1: Manual Deployment (Recommended for first deployment)

### Deploy Backend (Python/FastAPI)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New+"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-interview-backend`
   - **Runtime**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements-prod.txt && mkdir -p uploads exports`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Starter` (upgrade to `Standard` for production)

5. **Environment Variables** (Add these in the Environment tab):
   ```
   PYTHON_VERSION=3.11.7
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   DEBUG=false
   MAX_FILE_SIZE=10485760
   ```

6. **Health Check**: Set path to `/health`
7. Click **"Create Web Service"**

### Deploy Frontend (Next.js)

1. After backend is deployed, copy its URL (e.g., `https://ai-interview-backend.onrender.com`)
2. Click **"New+"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-interview-frontend`
   - **Runtime**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter`

5. **Environment Variables**:
   ```
   NODE_VERSION=18.18.0
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com/api/v1/websocket/ws
   ```

6. Click **"Create Web Service"**

## Option 2: Blueprint Deployment (Advanced)

1. Ensure `render.yaml` is in your repository root
2. Go to Render Dashboard → **"Blueprints"**
3. Click **"New Blueprint Instance"**
4. Connect repository and select `render.yaml`
5. Set environment variables as prompted
6. Deploy

## Post-Deployment Configuration

### 1. Update CORS Settings
After deployment, update `backend/app/core/config.py`:
```python
ALLOWED_HOSTS: List[str] = [
    "http://localhost:3000",
    "https://your-frontend-url.onrender.com",  # Replace with actual URL
    "https://your-custom-domain.com",  # If using custom domain
]
```

### 2. Custom Domain (Optional)
- In Render Dashboard → Your frontend service → **Settings** → **Custom Domains**
- Add your domain and configure DNS

### 3. SSL/HTTPS
- Render provides automatic SSL for both `.onrender.com` domains and custom domains

## Environment Variables Reference

### Backend Variables
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | No | Model to use | `gpt-4o-mini` |
| `DEBUG` | No | Enable debug mode | `false` |
| `MAX_FILE_SIZE` | No | Max upload size in bytes | `10485760` |

### Frontend Variables
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | Yes | WebSocket URL | `wss://backend.onrender.com/api/v1/websocket/ws` |
| `NODE_ENV` | No | Environment | `production` |

## Troubleshooting Common Issues

### Build Failures
1. **Python version issues**: Ensure Python 3.11+ in requirements
2. **Missing dependencies**: Check `requirements-prod.txt` is complete
3. **Directory issues**: Verify root directory settings
4. **PostCSS/Tailwind errors**: 
   - Ensure `@tailwindcss/postcss` is in dependencies, not devDependencies
   - Use `npm ci --legacy-peer-deps` for compatibility
5. **Module not found errors**: 
   - Check all component files exist in `/components` directory
   - Verify import paths match file structure
   - Clear build cache with `npm cache clean --force`

### Runtime Errors
1. **502 Bad Gateway**: Check port binding (use `$PORT` environment variable)
2. **CORS errors**: Update `ALLOWED_HOSTS` with deployed URLs
3. **Environment variables**: Verify all required variables are set

### Performance Issues
1. **Cold starts**: Upgrade from Starter to Standard plan
2. **Memory issues**: Monitor usage and upgrade plan if needed
3. **File uploads**: Ensure upload directories exist and have proper permissions

## Monitoring and Logs

- **Logs**: Available in Render Dashboard → Service → Logs
- **Metrics**: Monitor CPU, Memory, and Network usage
- **Health Checks**: Automatic monitoring of `/health` endpoint

## Production Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Health checks passing
- [ ] File upload/download working
- [ ] WebSocket connections working
- [ ] AI features working (with API key)
- [ ] Error monitoring setup
- [ ] Backup strategy planned

## Cost Optimization

- **Starter Plans**: Free tier with some limitations
- **Scaling**: Upgrade plans based on traffic
- **Sleep**: Services auto-sleep after inactivity (Starter plan)
- **Database**: Consider PostgreSQL for data persistence

## Support

- **Render Community**: [community.render.com](https://community.render.com)
- **Documentation**: [render.com/docs](https://render.com/docs)
- **Status**: [status.render.com](https://status.render.com)