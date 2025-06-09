# Deployment Guide for FreshMart

## 🚀 Production Deployment Options

### Option 1: Static File Hosting (Recommended)

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy to hosting provider:**
   - **Netlify**: Drag & drop the `dist` folder
   - **Vercel**: Connect GitHub repo or upload `dist`
   - **AWS S3**: Upload `dist` contents to S3 bucket
   - **GitHub Pages**: Push `dist` to `gh-pages` branch

### Option 2: Docker Deployment

1. **Create Dockerfile:**

   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -t freshmart .
   docker run -p 80:80 freshmart
   ```

### Option 3: Traditional Web Server

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Upload `dist` folder** to your web server's public directory

3. **Configure web server** for SPA routing (see nginx example below)

## 🔧 Web Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/freshmart/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache Configuration (.htaccess)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive on
    ExpiresDefault "access plus 1 year"
</filesMatch>
```

## 🌐 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=FreshMart
VITE_DEV_MODE=false
```

### Build with Environment

```bash
# Production build
npm run build

# Build with custom env
NODE_ENV=production npm run build
```

## 🔒 Security Considerations

### HTTPS Configuration

1. **Obtain SSL certificate** (Let's Encrypt recommended)
2. **Configure HTTPS redirect:**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       # ... rest of config
   }
   ```

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## 📊 Performance Optimization

### Build Optimization

1. **Analyze bundle size:**

   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Enable compression** (gzip/brotli in web server)

3. **Configure CDN** for static assets

### Runtime Optimization

1. **Service Worker** for caching (optional)
2. **Lazy loading** for routes (already implemented)
3. **Image optimization** if using images

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Deploy to S3
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync to S3
        run: aws s3 sync dist/ s3://your-bucket-name --delete
```

## 🐛 Production Troubleshooting

### Common Issues

1. **White screen/404 on refresh**

   - Configure web server for SPA routing
   - Check base URL in vite.config.ts

2. **API connection issues**

   - Verify CORS settings in SpringBoot
   - Check API URL in environment variables
   - Test API endpoint directly

3. **Build failures**
   - Check TypeScript errors: `npm run typecheck`
   - Verify all dependencies: `npm ci`
   - Clear cache: `rm -rf node_modules/.vite`

### Monitoring & Logging

1. **Error tracking** (Sentry, LogRocket)
2. **Performance monitoring** (Google Analytics, Web Vitals)
3. **Uptime monitoring** (Pingdom, UptimeRobot)

## 🔧 Maintenance

### Regular Updates

1. **Dependencies:**

   ```bash
   npm audit
   npm update
   ```

2. **Security patches:**

   ```bash
   npm audit fix
   ```

3. **Major version updates:**
   ```bash
   npx npm-check-updates -u
   npm install
   ```

---

For support, refer to the main README.md or open an issue.
