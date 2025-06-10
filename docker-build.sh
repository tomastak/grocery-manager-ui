#!/bin/bash

# FreshMart Docker Build Script
# This script provides multiple build options to handle dependency issues

set -e

IMAGE_NAME="freshmart-frontend"
TAG="${1:-latest}"

echo "🐳 FreshMart Docker Build Script"
echo "================================="

# Function to build with different approaches
build_option_1() {
    echo "📦 Option 1: Standard multi-stage build with legacy peer deps"
    docker build -t "${IMAGE_NAME}:${TAG}" .
}

build_option_2() {
    echo "📦 Option 2: Alternative build with force install"
    docker build -f Dockerfile.alternative -t "${IMAGE_NAME}:${TAG}" .
}

build_option_3() {
    echo "📦 Option 3: Simple build (requires local npm build first)"
    echo "🔨 Building locally first..."
    npm run build
    echo "🐳 Building Docker image..."
    docker build -f Dockerfile.simple -t "${IMAGE_NAME}:${TAG}" .
}

build_option_4() {
    echo "📦 Option 4: Build with Docker BuildKit"
    DOCKER_BUILDKIT=1 docker build -t "${IMAGE_NAME}:${TAG}" .
}

# Try different build options
echo "Select build option:"
echo "1) Standard build (recommended)"
echo "2) Alternative build with force install"
echo "3) Simple build (local build + Docker)"
echo "4) BuildKit build"
echo "5) Auto-detect best option"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        build_option_1
        ;;
    2)
        build_option_2
        ;;
    3)
        build_option_3
        ;;
    4)
        build_option_4
        ;;
    5)
        echo "🔍 Auto-detecting best build option..."
        
        # Check if dist folder exists
        if [ -d "dist" ]; then
            echo "✅ Found existing dist folder, using simple build"
            build_option_3
        else
            echo "🔨 No dist folder found, trying standard build..."
            if build_option_1; then
                echo "✅ Standard build successful!"
            else
                echo "❌ Standard build failed, trying alternative..."
                if build_option_2; then
                    echo "✅ Alternative build successful!"
                else
                    echo "❌ Alternative build failed, trying local build..."
                    build_option_3
                fi
            fi
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker image built successfully: ${IMAGE_NAME}:${TAG}"
    echo ""
    echo "🚀 To run the container:"
    echo "docker run -d -p 3000:80 -e VITE_API_BASE_URL=https://your-api.com ${IMAGE_NAME}:${TAG}"
    echo ""
    echo "🔍 To test the container:"
    echo "curl http://localhost:3000/health"
else
    echo "❌ Docker build failed"
    exit 1
fi
