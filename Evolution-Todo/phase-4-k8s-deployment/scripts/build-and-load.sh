#!/bin/bash

# Build and Load Images Script for Evolution Todo AI Chatbot
# This script builds Docker images and loads them into Minikube

set -e  # Exit on any error

echo "🏗️  Building Docker images for Evolution Todo AI Chatbot..."

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Check if minikube is running
if ! minikube status &> /dev/null; then
    echo "❌ Minikube is not running. Please start minikube first with: minikube start"
    exit 1
fi

# Set Docker environment to use Minikube's Docker daemon
echo "🐳 Setting Docker environment to Minikube..."
eval $(minikube docker-env)

# Build frontend image
echo "🔨 Building frontend image..."
docker build -t todo-frontend:latest ../frontend/ -f ../frontend/Dockerfile
if [ $? -eq 0 ]; then
    echo "✅ Frontend image built successfully"
else
    echo "❌ Failed to build frontend image"
    exit 1
fi

# Build backend image
echo "🔨 Building backend image..."
docker build -t todo-backend:latest ../backend/ -f ../backend/Dockerfile
if [ $? -eq 0 ]; then
    echo "✅ Backend image built successfully"
else
    echo "❌ Failed to build backend image"
    exit 1
fi

# Verify images exist
echo "🔍 Verifying images..."
docker images | grep todo-frontend
docker images | grep todo-backend

echo "🎉 Images built and loaded to Minikube successfully!"
echo "💡 Frontend image: todo-frontend:latest"
echo "💡 Backend image: todo-backend:latest"