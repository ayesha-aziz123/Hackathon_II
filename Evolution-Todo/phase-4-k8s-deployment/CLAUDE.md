
# Phase IV - Kubernetes Deployment for AI-Powered Todo Chatbot

## Project Overview
This is a Cloud-Native deployment of the Full-Stack AI-powered Todo application using Kubernetes.
**Current Phase:** Phase IV (Kubernetes Container Orchestration).

## Core Principles
1. **Spec-Driven Development:** ALWAYS read/reference specifications in `specs/006-k8s-deployment/` before writing code.
2. **Cloud-Native:** Uses Kubernetes with Helm charts for production-grade deployment.
3. **AI-Assisted Operations:** Leverages kubectl-ai, kagent, and Gordon for intelligent infrastructure management.
4. **Production-Ready:** Implements health checks, resource management, and security best practices.

## Technology Stack
| Layer | Technology |
| :--- | :--- |
| **Orchestration** | Kubernetes 1.28+, Minikube 1.32+ |
| **Packaging** | Helm 3.x Charts with subcharts |
| **Containerization** | Docker with multi-stage builds |
| **Frontend** | Next.js 16 (App Router) in container |
| **Backend** | Python 3.13+ FastAPI in container |
| **AI Integration** | OpenAI Agents SDK with MCP tools in container |
| **Database** | Neon Serverless PostgreSQL (external) |
| **AI Operations** | kubectl-ai, kagent, Gordon Docker AI |

## Project Structure
```text
phase-4-k8s-deployment/
├── docker/                    # Container build specifications
│   ├── frontend/              # Next.js Dockerfile
│   └── backend/               # FastAPI Dockerfile
├── charts/                    # Helm chart specifications
│   ├── todo-app/              # Umbrella chart
│   ├── todo-frontend/         # Frontend subchart
│   └── todo-backend/          # Backend subchart
├── scripts/                   # Deployment automation
│   ├── build-images.sh        # Container image building
│   └── demo-script.sh         # AI operations demo
├── docs/                      # Infrastructure documentation
│   ├── kubectl-ai-usage.md    # AI-assisted operations guide
│   └── kagent-usage.md        # Validation agent guide
├── frontend/                  # Next.js source code
├── backend/                   # FastAPI source code
└── README.md                  # Deployment guide
```

## Kubernetes Features
- **Auto-Scaling:** Horizontal Pod Autoscaling for resilience
- **Health Management:** Liveness and readiness probes
- **Resource Management:** CPU/Memory limits and requests
- **Secure Operations:** Kubernetes Secrets for sensitive data
- **Service Discovery:** Internal communication between services
- **Production-Grade:** Best practices for enterprise deployment

## Global Development Workflow
1. **Read Spec:** Check `specs/006-k8s-deployment/` for feature definition.
2. **Plan:** Break down tasks using `/sp.plan` or `write_todos`.
3. **Containerize:** Create optimized Docker images for applications.
4. **Package:** Build production-grade Helm charts.
5. **Deploy:** Use AI-assisted tools for cluster operations.
6. **Validate:** Verify production readiness and security.

## Key Commands
| Context | Command | Description |
| :--- | :--- | :--- |
| **Build Images** | `./scripts/build-images.sh` | Build container images |
| **Start Cluster** | `minikube start --cpus=2 --memory=4096mb` | Start Kubernetes |
| **Deploy** | `helm install todo-app charts/todo-app/` | Deploy application |
| **Access** | `minikube service todo-frontend --url` | Get frontend URL |
| **AI Operations** | `kubectl-ai "describe pods"` | Natural language queries |
| **Validate** | `kubectl get all` | Check deployment status |

## AI Operations Integration
- **Gordon:** AI-assisted Dockerfile generation
- **kubectl-ai:** Natural language Kubernetes operations
- **kagent:** AI-powered validation and optimization
- **Demo Script:** Showcases "deploy, break, heal with AI"

## Environment Variables

### Kubernetes Secrets (charts/todo-backend/templates/secret.yaml)
```yaml
database-url: # Base64 encoded Neon PostgreSQL URL
better-auth-secret: # Base64 encoded JWT secret
cohere-api-key: # Base64 encoded API key
```

## Recent Changes
- 006-k8s-deployment: Added Kubernetes orchestration with Helm charts
- AI-assisted operations with kubectl-ai and kagent
- Production-grade containerization with multi-stage builds
- Health checks and resource management for enterprise deployment
- Automated scaling and self-healing capabilities



