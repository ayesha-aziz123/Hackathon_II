#!/bin/bash

# Deploy script for Evolution Todo AI Chatbot to Minikube
# This script deploys the application using Helm charts to a local Minikube cluster

set -e  # Exit on any error

echo "🚀 Starting deployment of Evolution Todo AI Chatbot..."

# Check if minikube is running
if ! minikube status &> /dev/null; then
    echo "❌ Minikube is not running. Please start minikube first with: minikube start"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install Helm 3.x first."
    exit 1
fi

# Load Docker images into Minikube
echo "🐳 Loading Docker images into Minikube..."
eval $(minikube docker-env)
docker build -t todo-frontend:latest ../frontend/ -f ../frontend/Dockerfile
docker build -t todo-backend:latest ../backend/ -f ../backend/Dockerfile

# Create namespace
echo "🔧 Creating namespace..."
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Deploy using Helm
echo "🚢 Deploying application with Helm..."
cd ../helm/todo-app/
helm upgrade --install todo-app . \
    --namespace todo-app \
    --create-namespace \
    --timeout=10m \
    --values=<(cat <<EOF
frontend:
  image:
    tag: latest
  resources:
    limits:
      cpu: "500m"
      memory: "512Mi"
    requests:
      cpu: "100m"
      memory: "128Mi"
backend:
  image:
    tag: latest
  resources:
    limits:
      cpu: "500m"
      memory: "512Mi"
    requests:
      cpu: "100m"
      memory: "128Mi"
EOF
)

echo "✅ Application deployed successfully!"

# Show deployment status
echo "📋 Deployment status:"
kubectl get pods,svc,ingress -n todo-app

# Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n todo-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=300s

echo "🎯 Deployment complete!"
echo "Access the application at: http://$(minikube ip)"