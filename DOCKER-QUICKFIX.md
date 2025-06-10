# 🚀 Quick Fix for Docker Build Issues

Your Docker build failed due to npm dependency conflicts. Here are 3 solutions:

## ✅ **Solution 1: Simple Build (Recommended)**

Build locally first, then use Docker:

```bash
# 1. Build the app locally
npm run build

# 2. Use the simple Dockerfile
docker build -f Dockerfile.simple -t freshmart-frontend .

# 3. Run the container
docker run -d -p 3000:80 -e VITE_API_BASE_URL=https://your-api.com freshmart-frontend
```

## ✅ **Solution 2: Force Dependencies**

```bash
# Use the alternative Dockerfile with force install
docker build -f Dockerfile.alternative -t freshmart-frontend .
```

## ✅ **Solution 3: Use Docker BuildKit**

```bash
# Enable BuildKit for better dependency resolution
DOCKER_BUILDKIT=1 docker build -t freshmart-frontend .
```

## ✅ **Solution 4: Manual Steps**

If all else fails, here's the manual approach:

```bash
# 1. Build locally
npm install --force
npm run build

# 2. Create a minimal Dockerfile
cat > Dockerfile.minimal << 'EOF'
FROM nginx:alpine
RUN apk add --no-cache gettext wget
COPY nginx.conf.template /etc/nginx/templates/
COPY dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENV VITE_API_BASE_URL=http://localhost:8080
ENV NGINX_PORT=80
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
EOF

# 3. Build with minimal Dockerfile
docker build -f Dockerfile.minimal -t freshmart-frontend .
```

## 🎯 **Recommended Quick Start**

For immediate success, use **Solution 1**:

```bash
npm run build
docker build -f Dockerfile.simple -t freshmart-frontend .
docker run -d -p 3000:80 -e VITE_API_BASE_URL=https://your-api.com freshmart-frontend
```

This bypasses the npm dependency issues by building locally first.

## 🔧 **Test Your Container**

```bash
# Check if container is running
docker ps

# Test health endpoint
curl http://localhost:3000/health

# View logs
docker logs [container-name]
```

Choose the solution that works best for your environment! 🚀
