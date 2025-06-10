# FreshMart Docker Deployment Guide

This guide explains how to build and run the FreshMart frontend application as a Docker container with configurable backend API URL.

## 🚀 Quick Start

### Build the Docker Image

```bash
docker build -t freshmart-frontend:latest .
```

### Run with Custom API URL

```bash
docker run -d \
  --name freshmart-app \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://localhost:8080 \
  freshmart-frontend:latest
```

## 🔧 Configuration Options

### Environment Variables

| Variable               | Description             | Default                     | Required |
| ---------------------- | ----------------------- | --------------------------- | -------- |
| `VITE_API_BASE_URL`    | Backend API base URL    | `http://localhost:8080`     | ✅       |
| `VITE_APP_TITLE`       | Application title       | `FreshMart`                 | ❌       |
| `VITE_APP_DESCRIPTION` | Application description | `Grocery Management System` | ❌       |
| `NGINX_PORT`           | Internal nginx port     | `80`                        | ❌       |

### Example Configurations

#### Development Environment

```bash
docker run -d \
  --name freshmart-dev \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://localhost:8080 \
  -e VITE_APP_TITLE="FreshMart Dev" \
  freshmart-frontend:latest
```

#### Production Environment

```bash
docker run -d \
  --name freshmart-prod \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.yourcompany.com \
  -e VITE_APP_TITLE="FreshMart Production" \
  --restart unless-stopped \
  freshmart-frontend:latest
```

#### Staging Environment

```bash
docker run -d \
  --name freshmart-staging \
  -p 8080:80 \
  -e VITE_API_BASE_URL=https://staging-api.yourcompany.com \
  -e VITE_APP_TITLE="FreshMart Staging" \
  freshmart-frontend:latest
```

## 🐳 Docker Compose

### Basic Setup

```yaml
version: "3.8"

services:
  freshmart:
    image: freshmart-frontend:latest
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=https://your-api-server.com
    restart: unless-stopped
```

### With Backend (Full Stack)

```yaml
version: "3.8"

services:
  freshmart-frontend:
    image: freshmart-frontend:latest
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://freshmart-backend:8080
    depends_on:
      - freshmart-backend
    restart: unless-stopped

  freshmart-backend:
    image: your-springboot-app:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
    restart: unless-stopped

networks:
  default:
    name: freshmart-network
```

## 🏭 Production Deployment

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: freshmart-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: freshmart-frontend
  template:
    metadata:
      labels:
        app: freshmart-frontend
    spec:
      containers:
        - name: freshmart
          image: freshmart-frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_BASE_URL
              value: "https://api.yourcompany.com"
            - name: VITE_APP_TITLE
              value: "FreshMart Production"
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: freshmart-frontend-service
spec:
  selector:
    app: freshmart-frontend
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

### AWS ECS Task Definition

```json
{
  "family": "freshmart-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "freshmart-frontend",
      "image": "your-registry/freshmart-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_API_BASE_URL",
          "value": "https://api.yourcompany.com"
        },
        {
          "name": "VITE_APP_TITLE",
          "value": "FreshMart Production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/freshmart-frontend",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔍 Health Checks & Monitoring

### Health Check Endpoint

The container provides a health check endpoint at `/health`:

```bash
curl http://localhost:3000/health
# Response: healthy
```

### Docker Health Check

```bash
docker run -d \
  --name freshmart-app \
  -p 3000:80 \
  -e VITE_API_BASE_URL=https://your-api.com \
  --health-cmd="wget --quiet --tries=1 --spider http://localhost/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  freshmart-frontend:latest
```

## 🛠️ Development & Debugging

### Run with Volume Mount (for development)

```bash
docker run -d \
  --name freshmart-dev \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://host.docker.internal:8080 \
  -v $(pwd)/dist:/usr/share/nginx/html \
  freshmart-frontend:latest
```

### View Logs

```bash
# View container logs
docker logs freshmart-app

# Follow logs in real-time
docker logs -f freshmart-app
```

### Debug Configuration

```bash
# Access container shell
docker exec -it freshmart-app sh

# Check nginx configuration
docker exec freshmart-app cat /etc/nginx/conf.d/default.conf

# Check runtime configuration
docker exec freshmart-app cat /usr/share/nginx/html/config.js
```

## 🔒 Security Considerations

### Production Hardening

1. **Use non-root user** (already implemented in the Dockerfile)
2. **Security headers** (already configured in nginx)
3. **HTTPS only** in production
4. **Environment-specific configurations**

### Secrets Management

For sensitive configurations, use Docker secrets or external secret management:

```bash
# Using Docker secrets
echo "https://secure-api.company.com" | docker secret create api_url -

docker service create \
  --name freshmart \
  --secret api_url \
  --env VITE_API_BASE_URL_FILE=/run/secrets/api_url \
  freshmart-frontend:latest
```

## 📊 Performance Optimization

### Build Optimization

The Dockerfile uses multi-stage builds for optimal image size:

- **Development dependencies** are excluded from the final image
- **Static assets** are properly compressed
- **Nginx** is optimized for serving React SPAs

### Runtime Optimization

- **Gzip compression** enabled for all text assets
- **Cache headers** set for static assets (1 year)
- **HTTP/2** support via nginx

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failed**

   ```bash
   # Check if API URL is correctly set
   docker exec freshmart-app cat /usr/share/nginx/html/config.js
   ```

2. **CORS Issues**

   ```bash
   # The nginx config includes CORS headers
   # Verify backend CORS configuration
   ```

3. **Container Won't Start**
   ```bash
   # Check logs for errors
   docker logs freshmart-app
   ```

### Support

For issues and questions:

- Check container logs: `docker logs freshmart-app`
- Verify environment variables: `docker exec freshmart-app env`
- Test health endpoint: `curl http://localhost:3000/health`

---

## Example: Complete Production Setup

```bash
# 1. Build the image
docker build -t freshmart-frontend:v1.0.0 .

# 2. Tag for registry
docker tag freshmart-frontend:v1.0.0 your-registry.com/freshmart-frontend:v1.0.0

# 3. Push to registry
docker push your-registry.com/freshmart-frontend:v1.0.0

# 4. Deploy to production
docker run -d \
  --name freshmart-production \
  --restart unless-stopped \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.yourcompany.com \
  -e VITE_APP_TITLE="FreshMart - Grocery Management" \
  --health-cmd="wget --quiet --tries=1 --spider http://localhost/health || exit 1" \
  --health-interval=30s \
  your-registry.com/freshmart-frontend:v1.0.0
```

Your FreshMart application is now ready for production deployment! 🎉
