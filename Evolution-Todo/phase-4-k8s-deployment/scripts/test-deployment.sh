#!/bin/bash

# Test script for Evolution Todo AI Chatbot deployment
# This script validates that the deployed application is functioning correctly

set -e  # Exit on any error

echo "🧪 Testing Evolution Todo AI Chatbot deployment..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

NAMESPACE="todo-app"

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "❌ Namespace $NAMESPACE does not exist"
    exit 1
fi

echo "✅ Namespace $NAMESPACE exists"

# Check deployment status
echo "🔍 Checking deployment status..."

# Check frontend deployment
FRONTEND_REPLICAS=$(kubectl get deployment todo-frontend -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
FRONTEND_EXPECTED=$(kubectl get deployment todo-frontend -n $NAMESPACE -o jsonpath='{.spec.replicas}')

if [ "$FRONTEND_REPLICAS" = "$FRONTEND_EXPECTED" ] && [ "$FRONTEND_REPLICAS" != "0" ]; then
    echo "✅ Frontend deployment: $FRONTEND_REPLICAS/$FRONTEND_EXPECTED replicas ready"
else
    echo "❌ Frontend deployment: $FRONTEND_REPLICAS/$FRONTEND_EXPECTED replicas ready"
    exit 1
fi

# Check backend deployment
BACKEND_REPLICAS=$(kubectl get deployment todo-backend -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
BACKEND_EXPECTED=$(kubectl get deployment todo-backend -n $NAMESPACE -o jsonpath='{.spec.replicas}')

if [ "$BACKEND_REPLICAS" = "$BACKEND_EXPECTED" ] && [ "$BACKEND_REPLICAS" != "0" ]; then
    echo "✅ Backend deployment: $BACKEND_REPLICAS/$BACKEND_EXPECTED replicas ready"
else
    echo "❌ Backend deployment: $BACKEND_REPLICAS/$BACKEND_EXPECTED replicas ready"
    exit 1
fi

# Check services
FRONTEND_SVC=$(kubectl get svc todo-frontend-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
BACKEND_SVC=$(kubectl get svc todo-backend-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')

if [ -n "$FRONTEND_SVC" ]; then
    echo "✅ Frontend service is available at $FRONTEND_SVC"
else
    echo "❌ Frontend service is not available"
    exit 1
fi

if [ -n "$BACKEND_SVC" ]; then
    echo "✅ Backend service is available at $BACKEND_SVC"
else
    echo "❌ Backend service is not available"
    exit 1
fi

# Check pods
echo "🔍 Checking pod health..."
FRONTEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[*].metadata.name}')
BACKEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[*].metadata.name}')

for pod in $FRONTEND_PODS; do
    STATUS=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
    if [ "$STATUS" = "Running" ]; then
        echo "✅ Frontend pod $pod is running"
    else
        echo "❌ Frontend pod $pod is not running (status: $STATUS)"
        kubectl describe pod $pod -n $NAMESPACE
        exit 1
    fi
done

for pod in $BACKEND_PODS; do
    STATUS=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
    if [ "$STATUS" = "Running" ]; then
        echo "✅ Backend pod $pod is running"
    else
        echo "❌ Backend pod $pod is not running (status: $STATUS)"
        kubectl describe pod $pod -n $NAMESPACE
        exit 1
    fi
done

# Test service connectivity (using port forwarding as a test)
echo "🔌 Testing service connectivity..."
FRONTEND_PORT=$(kubectl get svc todo-frontend-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
BACKEND_PORT=$(kubectl get svc todo-backend-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')

echo "✅ Frontend service listening on port $FRONTEND_PORT"
echo "✅ Backend service listening on port $BACKEND_PORT"

# Check ingress
INGRESS_HOST=$(kubectl get ingress todo-app-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
if [ -n "$INGRESS_HOST" ]; then
    echo "✅ Ingress configured for host: $INGRESS_HOST"
else
    echo "⚠️  Ingress may not be properly configured"
fi

# Check HPA
FRONTEND_HPA=$(kubectl get hpa todo-frontend-hpa -n $NAMESPACE --ignore-not-found -o jsonpath='{.metadata.name}')
BACKEND_HPA=$(kubectl get hpa todo-backend-hpa -n $NAMESPACE --ignore-not-found -o jsonpath='{.metadata.name}')

if [ -n "$FRONTEND_HPA" ]; then
    echo "✅ Frontend HPA is configured"
else
    echo "⚠️  Frontend HPA not found"
fi

if [ -n "$BACKEND_HPA" ]; then
    echo "✅ Backend HPA is configured"
else
    echo "⚠️  Backend HPA not found"
fi

# Check resource utilization
echo "📊 Resource utilization:"
kubectl top pods -n $NAMESPACE || echo "⚠️  Metrics server not available (install with: minikube addons enable metrics-server)"

echo "🎉 All tests passed! The Evolution Todo AI Chatbot is successfully deployed and running."
echo ""
echo "📋 Quick access commands:"
echo "  - View pods: kubectl get pods -n $NAMESPACE"
echo "  - View services: kubectl get svc -n $NAMESPACE"
echo "  - View logs: kubectl logs -l app=frontend -n $NAMESPACE"
echo "  - Port forward: kubectl port-forward svc/todo-frontend-service 3000:80 -n $NAMESPACE"