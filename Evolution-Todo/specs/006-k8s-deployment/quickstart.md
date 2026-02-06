# Quick Start Guide: Kubernetes Deployment for AI Todo Chatbot

## Prerequisites

- **Minikube**: Version 1.32 or higher
- **Helm**: Version 3.x
- **kubectl**: Latest stable version
- **Docker**: Version 24+ (running via Minikube)
- **System Resources**: At least 8GB RAM, 4 CPU cores available
- **Internet Access**: For pulling images and installing addons

## Installation Steps

### 1. Start Minikube with Required Resources

```bash
# Start Minikube with Docker driver and adequate resources
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
```

### 2. Prepare Your Environment

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd evolution-of-todo

# Navigate to the phase-3-ai-chatbot directory
cd phase-3-ai-chatbot
```

### 3. Generate Docker Images

#### Option A: Using Gordon AI (Preferred)
```bash
# Use Gordon AI to generate optimized Dockerfiles
# This will create Dockerfiles for both frontend and backend
# The exact Gordon AI command will depend on your setup
```

#### Option B: Using Docker Engineer Agent (Fallback)
```bash
# If Gordon AI is unavailable, use Docker Engineer Agent
# This generates optimized multi-stage Dockerfiles
# Follow the Docker Engineer Agent instructions to create:
# - phase-3-ai-chatbot/frontend/Dockerfile
# - phase-3-ai-chatbot/backend/Dockerfile
```

### 4. Build and Load Images into Minikube

```bash
# Set Docker environment to Minikube
eval $(minikube docker-env)

# Build frontend image
cd phase-3-ai-chatbot/frontend
docker build -t evolution-todo-frontend:latest .

# Build backend image
cd ../backend
docker build -t evolution-todo-backend:latest .

# Verify images are built
docker images | grep evolution-todo
```

### 5. Prepare Configuration Files

Create a `values.yaml` file with your specific configuration:

```yaml
# values.yaml
frontend:
  replicaCount: 2
  image:
    repository: evolution-todo-frontend
    tag: latest
    pullPolicy: IfNotPresent

backend:
  replicaCount: 2
  image:
    repository: evolution-todo-backend
    tag: latest
    pullPolicy: IfNotPresent

secrets:
  betterAuthSecret: "your-better-auth-secret-here"
  cohereApiKey: "your-cohere-api-key-here"
  databaseUrl: "your-neon-postgresql-connection-string-here"

frontendConfig:
  apiUrl: "http://backend-service:80"

ingress:
  enabled: true
  hostname: "evolution-todo.local"
```

### 6. Deploy Using Helm

```bash
# Navigate to your Helm charts directory
cd ../../ # back to root directory

# If you don't have the Helm chart yet, generate it using kubectl-ai or kagent
# For now, assuming you have a chart at helm-charts/evolution-todo

# Install the chart
helm install evolution-todo ./helm-charts/evolution-todo -f values.yaml

# Verify the installation
helm list
kubectl get pods
kubectl get services
kubectl get ingress
```

### 7. Verify Deployment

```bash
# Check if all pods are running
kubectl get pods -w

# Check service endpoints
kubectl get svc

# Check ingress
kubectl get ingress

# Monitor logs
kubectl logs -f deployment/evolution-todo-frontend
kubectl logs -f deployment/evolution-todo-backend
```

### 8. Access the Application

```bash
# Option 1: Use minikube tunnel (recommended for ingress)
sudo minikube tunnel

# Option 2: Get the NodePort for direct access
kubectl get svc frontend-service

# Then access the application:
# - Ingress: http://evolution-todo.local (add to /etc/hosts if needed)
# - NodePort: http://localhost:<node-port> (get node port from kubectl get svc)
```

## Troubleshooting

### Common Issues

1. **Images not found**:
   ```bash
   # Ensure you ran eval $(minikube docker-env) before building
   # Verify images exist in minikube: docker images
   ```

2. **Insufficient resources**:
   ```bash
   # Check resource usage: kubectl top nodes
   # Increase minikube resources if needed
   ```

3. **Ingress not working**:
   ```bash
   # Ensure ingress addon is enabled: minikube addons enable ingress
   # Use minikube tunnel in a separate terminal
   # Check ingress status: kubectl describe ingress evolution-todo-ingress
   ```

4. **Application not responding**:
   ```bash
   # Check pod status: kubectl get pods
   # Check logs: kubectl logs <pod-name>
   # Check events: kubectl describe pod <pod-name>
   ```

### Using AI Tools for Troubleshooting

```bash
# Use kubectl-ai for common operations
kubectl ai "show me the status of all pods"
kubectl ai "describe the frontend deployment"
kubectl ai "show logs for backend pods"

# Use kagent for health analysis
# kagent can help analyze pod health, resource usage, and suggest optimizations
```

## Scaling and Management

### Scale Applications
```bash
# Scale frontend
kubectl scale deployment evolution-todo-frontend --replicas=3

# Scale backend
kubectl scale deployment evolution-todo-backend --replicas=3
```

### Update Configuration
```bash
# Update with new values
helm upgrade evolution-todo ./helm-charts/evolution-todo -f values.yaml

# Rollback if needed
helm rollback evolution-todo
```

### Cleanup
```bash
# Uninstall the release
helm uninstall evolution-todo

# Stop minikube
minikube stop

# Delete minikube cluster (if needed)
minikube delete
```

## Demo Script

For your hackathon demonstration:

1. **Start Minikube**: `minikube start --driver=docker --cpus=4 --memory=8192`
2. **Deploy**: `helm install evolution-todo ./helm-charts/evolution-todo -f values.yaml`
3. **Monitor**: `kubectl get pods -w` (wait for all to be ready)
4. **Tunnel**: `sudo minikube tunnel` (in separate terminal)
5. **Show App**: Navigate to http://evolution-todo.local
6. **Demonstrate**: Show all functionality including AI chatbot
7. **Scale**: `kubectl scale deployment evolution-todo-frontend --replicas=3`
8. **Verify**: Show new pods are created and healthy