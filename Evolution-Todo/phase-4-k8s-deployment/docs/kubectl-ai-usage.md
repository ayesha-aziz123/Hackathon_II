# kubectl-ai Usage Documentation

## Overview
This document describes how kubectl-ai was used to create and manage Kubernetes resources for the Todo application.

## Commands Used

### Creating Initial Resources
```bash
# Generate deployment manifests using natural language
kubectl-ai "create a deployment for todo-frontend with 1 replica and NodePort service"
kubectl-ai "create a deployment for todo-backend with 1 replica and ClusterIP service"
```

### Managing Resources
```bash
# Scale deployments
kubectl-ai "scale frontend deployment to 3 replicas"

# Check resource status
kubectl-ai "show me the status of all deployments and services"
```

### Troubleshooting
```bash
# Diagnose issues
kubectl-ai "why is my frontend pod not starting?"
kubectl-ai "show logs from backend pod"
```

## Benefits Demonstrated
- Zero manual YAML writing
- Natural language interface for Kubernetes operations
- Automated resource generation
- Simplified cluster management