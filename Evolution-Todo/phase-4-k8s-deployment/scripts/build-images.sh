#!/bin/bash
# Script to build Docker images for the Todo application

echo "Building frontend Docker image..."

# Build frontend from root directory with correct context
docker build -t todo-frontend:latest -f phase-4-k8s-deployment/docker/frontend/Dockerfile .

echo "Building backend Docker image..."

# Build backend from root directory with correct context
docker build -t todo-backend:latest -f phase-4-k8s-deployment/docker/backend/Dockerfile .

echo "Images built successfully!"
echo "Frontend image: todo-frontend:latest"
echo "Backend image: todo-backend:latest"