#!/bin/sh

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting FreshMart container..."

# Substitute environment variables in nginx configuration
log "Configuring nginx with API_BASE_URL: ${VITE_API_BASE_URL}"
envsubst '${VITE_API_BASE_URL} ${NGINX_PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Create runtime config for the frontend application
log "Creating runtime configuration..."
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  VITE_API_BASE_URL: '${VITE_API_BASE_URL}',
  VITE_APP_TITLE: '${VITE_APP_TITLE:-FreshMart}',
  VITE_APP_DESCRIPTION: '${VITE_APP_DESCRIPTION:-Grocery Management System}'
};
EOF

# Update index.html to include the runtime config
log "Injecting runtime configuration into index.html..."
sed -i 's|<head>|<head>\n  <script src="/config.js"></script>|' /usr/share/nginx/html/index.html

log "Configuration complete. Starting nginx..."

# Execute the original command
exec "$@"
