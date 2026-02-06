#!/bin/bash

# Full Demo Script for Evolution Todo AI Chatbot on Kubernetes
# This script demonstrates the complete deployment and functionality

set -e  # Exit on any error

echo "🎬 Starting full demo of Evolution Todo AI Chatbot on Kubernetes..."

echo "
╔══════════════════════════════════════════════════════════════════════════════╗
║                        EVOLUTION TODO AI CHATBOT DEMO                        ║
║                             Kubernetes Edition                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"

echo ""
echo "📊 Current Environment:"
echo "   • Kubernetes: $(kubectl version --short | head -n1)"
echo "   • Helm: $(helm version --short)"
echo "   • Minikube: $(minikube version --short)"
echo ""

# Check if minikube is running
if ! minikube status &> /dev/null; then
    echo "❌ Minikube is not running. Please start minikube first."
    echo "   Run: minikube start --cpus=2 --memory=4096mb"
    exit 1
fi

# Check if ingress addon is enabled
if ! minikube addons list | grep -q "ingress: enabled"; then
    echo "⚠️  Ingress addon is not enabled. Enabling it now..."
    minikube addons enable ingress
    sleep 10  # Give it time to start
fi

echo "✅ Minikube is running with ingress enabled"
echo ""

# Build and load images
echo "🏗️  Building and loading Docker images..."
./build-and-load.sh
echo ""

# Deploy application
echo "🚀 Deploying application to Minikube..."
./deploy.sh
echo ""

# Wait a bit for everything to stabilize
echo "⏳ Waiting for services to be fully ready..."
sleep 15

# Run validation tests
echo "🧪 Running validation tests..."
./test-deployment.sh
echo ""

echo ""
echo "🌐 Access Information:"
echo "   • Application URL: http://$(minikube ip)/"
echo "   • Frontend Service: todo-frontend-service:80"
echo "   • Backend Service: todo-backend-service:8000"
echo ""

# Show resource usage
echo "📈 Resource Usage:"
kubectl top pods -n todo-app || echo "   • Metrics server not available"
echo ""

# Show logs from both services
echo "📝 Recent logs from frontend:"
kubectl logs -l app=frontend -n todo-app --tail=5 || echo "   • No logs available"
echo ""

echo "📝 Recent logs from backend:"
kubectl logs -l app=backend -n todo-app --tail=5 || echo "   • No logs available"
echo ""

# Demonstrate scaling
echo "⚖️  Demonstrating Horizontal Pod Autoscaling setup..."
echo "   • Frontend HPA configured with CPU/Memory targets"
echo "   • Backend HPA configured with CPU/Memory targets"
echo "   • Scale from 1 to 5 pods based on utilization"
echo ""

# Show the current configuration
echo "⚙️  Deployment Configuration:"
kubectl get deployments,hpa,services -n todo-app -o wide
echo ""

echo "🎯 Demo Complete!"
echo ""
echo "📋 What you've seen:"
echo "   1. Docker images built and loaded to Minikube"
echo "   2. Helm chart deployed with production-grade configuration"
echo "   3. Services exposed via Ingress"
echo "   4. Health checks and readiness probes configured"
echo "   5. Resource limits and requests set"
echo "   6. Horizontal Pod Autoscaling configured"
echo "   7. Secrets management for sensitive data"
echo ""
echo "💡 To interact with the application:"
echo "   • Visit: http://$(minikube ip)/"
echo "   • Or port forward: kubectl port-forward svc/todo-frontend-service 3000:80 -n todo-app"
echo ""
echo "🔧 To manage the deployment:"
echo "   • Check status: kubectl get pods -n todo-app"
echo "   • View logs: kubectl logs -l app=frontend -n todo-app"
echo "   • Scale manually: kubectl scale deployment todo-frontend -n todo-app --replicas=3"
echo "   • Upgrade chart: helm upgrade todo-app ../helm/todo-app/ -n todo-app"
echo ""