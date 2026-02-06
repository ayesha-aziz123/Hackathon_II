# Evolution Todo AI Chatbot - Kubernetes Deployment

Complete cloud-native deployment of the Evolution Todo AI Chatbot application using Kubernetes, Helm, and optimized Docker containers.

## 🚀 Master Deployment Script

The `master-deploy.sh` script provides a complete, automated deployment solution that handles everything from Docker image building to application accessibility.

### Features

- **Automated Docker Image Building**: Creates optimized multi-stage Docker images for both frontend (Next.js) and backend (FastAPI)
- **Kubernetes Cluster Setup**: Automatically starts/verifies Minikube cluster with ingress
- **Secure Secret Management**: Creates Kubernetes secrets for API keys and database credentials
- **Production-Grade Helm Chart**: Deploys application with resource limits, health probes, and proper configuration
- **AI Operations Demo**: Includes kubectl-based operations and scaling demonstrations
- **One-Command Deployment**: Complete deployment with a single script execution

### Prerequisites

1. **Environment Variables** (already set as per your requirements):
   ```bash
   export GROQ_API_KEY=your_groq_api_key_here
   export GROQ_DEFAULT_MODEL=openai/gpt-oss-20b
   export DATABASE_URL=your_neon_postgres_connection_string_here
   export BETTER_AUTH_SECRET=your_better_auth_secret_here
   ```

2. **Required Tools**:
   - Docker Desktop (with Kubernetes enabled) OR Minikube
   - kubectl
   - Helm 3+
   - Git Bash (for Windows users)

### Usage

#### 1. **Quick Deployment** (Recommended)
```bash
# Navigate to the deployment directory
cd phase-4-k8s-deployment

# Run the master deployment script
bash master-deploy.sh
```

#### 2. **Step-by-Step Process** (For Understanding)
The script performs these operations automatically:

1. **Environment Validation**: Checks all required environment variables
2. **Cluster Setup**: Starts/verifies Kubernetes cluster (Minikube or Docker Desktop)
3. **Image Cleanup**: Removes old Docker images (`todo-frontend:latest`, `todo-backend:latest`)
4. **Fresh Build**: Builds new optimized Docker images from source
5. **Secret Creation**: Creates Kubernetes secrets for sensitive data
6. **Helm Deployment**: Deploys application using production-grade Helm chart
7. **Health Checks**: Waits for all pods to be ready
8. **Port Forwarding**: Sets up access on localhost:3000
9. **Functionality Test**: Verifies application components work
10. **AIOps Demo**: Demonstrates kubectl operations and scaling

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Access   │────│  Kubernetes      │────│   External      │
│   (localhost:   │    │  Cluster         │    │   Services      │
│   3000)         │    │                  │    │                 │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          ▼                      ▼                       ▼
   ┌──────────────┐      ┌─────────────────┐     ┌─────────────────┐
   │ Frontend     │◄────►│ Backend Service │◄───►│ Neon PostgreSQL │
   │ (Next.js)    │      │ (FastAPI +     │     │ GROQ API        │
   │ Service      │      │ GROQ Chatbot)   │     │                 │
   └──────────────┘      └─────────────────┘     └─────────────────┘
         │                        │
         └────────────────────────┘
               Communication
```

### Services Deployed

- **Frontend**: Next.js AI Chatbot Interface
  - Image: `todo-frontend:latest`
  - Service: `todo-frontend-service:3000`
  - Health Probe: `/` endpoint
  - Resources: 128Mi-512Mi memory, 100m-500m CPU

- **Backend**: FastAPI AI Processing Service
  - Image: `todo-backend:latest`
  - Service: `todo-backend-service:8000`
  - Health Probe: `/health` endpoint
  - Resources: 128Mi-512Mi memory, 100m-500m CPU

### Accessing the Application

After successful deployment, the application will be accessible at:
- **Browser**: `http://localhost:3000`
- **Ingress**: `http://todo.local` (add entry to hosts file)

### Useful Commands

```bash
# Check deployment status
helm status todo-app

# View pods
kubectl get pods

# View services
kubectl get services

# Check logs
kubectl logs -l app=todo-frontend
kubectl logs -l app=todo-backend

# Scale frontend
kubectl scale deployment todo-frontend --replicas=2

# Check resource usage
kubectl top pods

# Port forward if needed
kubectl port-forward svc/todo-frontend-service 3000:3000
```

### Troubleshooting

1. **If pods don't start**:
   ```bash
   kubectl get pods
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **If ingress is not working**:
   ```bash
   kubectl get ingress
   minikube ip  # Then add to hosts file: <IP> todo.local
   ```

3. **If environment variables are missing**:
   ```bash
   env | grep -E "(GROQ|DATABASE|AUTH)"
   ```

### Security

- All sensitive data stored in Kubernetes secrets
- No hardcoded credentials in deployment files
- Resource limits prevent abuse
- Health probes ensure service availability

### Cleanup

To completely remove the deployment:
```bash
helm uninstall todo-app
kubectl delete secret todo-secrets --ignore-not-found=true
```

---

**Note**: This deployment is production-ready with proper health checks, resource management, and security configurations as specified in the project requirements.