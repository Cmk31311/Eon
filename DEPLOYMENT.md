# 🚀 EarthStory Deployment Guide

This guide covers deploying EarthStory to production environments.

## 📋 Prerequisites

- Domain name (optional)
- SSL certificate (for HTTPS)
- API keys for all services
- Server with Docker support (recommended)

## 🐳 Docker Deployment

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - ELASTIC_URL=http://elasticsearch:9200
    depends_on:
      - redis
      - elasticsearch

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
```

## ☁️ Cloud Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Render (Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Fly.io (Full Stack)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly deploy

# Deploy frontend
cd ../frontend
fly launch
fly deploy
```

## 🔧 Environment Variables

### Production Backend

```env
# API Keys
BASETEN_API_KEY=prod_baseten_key
ANTHROPIC_API_KEY=prod_anthropic_key
DEEPGRAM_API_KEY=prod_deepgram_key

# Database
REDIS_URL=redis://your-redis-host:6379
ELASTIC_URL=https://your-elastic-host:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=your_secure_password

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Production Frontend

```env
VITE_API_BASE=https://your-backend-domain.com
VITE_CESIUM_TOKEN=your_cesium_token
```

## 📊 Monitoring

### Health Checks

- Backend: `GET /health`
- Frontend: Check if app loads

### Monitoring Tools

- **Uptime**: UptimeRobot or Pingdom
- **Logs**: LogRocket or Sentry
- **Performance**: New Relic or DataDog

## 🔒 Security

### SSL/TLS

- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Set secure headers

### API Security

- Rate limiting
- CORS configuration
- Input validation
- Authentication (if needed)

## 📈 Scaling

### Backend Scaling

- Use load balancers (nginx, HAProxy)
- Horizontal scaling with multiple instances
- Database connection pooling
- Redis clustering

### Frontend Scaling

- CDN for static assets
- Image optimization
- Code splitting
- Caching strategies

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check allowed origins
2. **API Timeouts**: Increase timeout values
3. **Memory Issues**: Optimize Docker images
4. **Database Connections**: Check connection limits

### Logs

```bash
# Backend logs
docker logs earthstory-backend

# Frontend logs
docker logs earthstory-frontend

# Database logs
docker logs earthstory-redis
docker logs earthstory-elasticsearch
```

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Your deployment commands
```

## 📝 Maintenance

### Regular Tasks

- Update dependencies
- Monitor API usage
- Backup databases
- Review logs
- Update documentation

### Backup Strategy

- Database backups (daily)
- Code backups (Git)
- Configuration backups
- SSL certificate renewal

---

**Ready to deploy EarthStory to production! 🚀**
