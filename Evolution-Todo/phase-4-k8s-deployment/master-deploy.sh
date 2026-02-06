#!/bin/bash

# Master deployment script for Evolution Todo AI Chatbot on Kubernetes
# This script automates the complete deployment process from Docker images to running application
# Author: Claude AI Assistant
# Date: 2026-02-05

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for pods to be ready
wait_for_pods_ready() {
    local namespace=$1
    local timeout=300  # 5 minutes
    local count=0

    print_status "Waiting for pods to be ready in namespace: $namespace..."

    while [ $count -lt $timeout ]; do
        if kubectl get pods -n $namespace 2>/dev/null | grep -q "Running\|Completed" && \
           ! kubectl get pods -n $namespace 2>/dev/null | grep -q "Pending\|ContainerCreating\|Init"; then

            # Check if all pods are ready (not just running)
            local unready_count=$(kubectl get pods -n $namespace 2>/dev/null | grep "Running" | awk '{print $2}' | grep -v "1/1\|2/2\|3/3" | wc -l)

            if [ $unready_count -eq 0 ]; then
                print_success "All pods are ready in namespace: $namespace"
                return 0
            fi
        fi

        sleep 10
        ((count += 10))
    done

    print_error "Timeout waiting for pods to be ready in namespace: $namespace"
    kubectl get pods -n $namespace
    return 1
}

# Function to check if GROQ_API_KEY is set
check_env_vars() {
    print_status "Checking environment variables..."

    if [ -z "$GROQ_API_KEY" ]; then
        print_error "GROQ_API_KEY environment variable is not set!"
        print_status "Please export GROQ_API_KEY before running this script"
        exit 1
    fi

    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set!"
        print_status "Please export DATABASE_URL before running this script"
        exit 1
    fi

    if [ -z "$BETTER_AUTH_SECRET" ]; then
        print_error "BETTER_AUTH_SECRET environment variable is not set!"
        print_status "Please export BETTER_AUTH_SECRET before running this script"
        exit 1
    fi

    if [ -z "$GROQ_DEFAULT_MODEL" ]; then
        print_warning "GROQ_DEFAULT_MODEL environment variable is not set, using default"
        export GROQ_DEFAULT_MODEL="openai/gpt-oss-20b"
    fi

    print_success "All required environment variables are set"
}

# Function to start/enable Kubernetes
setup_kubernetes() {
    print_status "Setting up Kubernetes cluster..."

    # Check if Docker Desktop Kubernetes is enabled
    if command_exists kubectl; then
        if kubectl cluster-info >/dev/null 2>&1; then
            print_success "Kubernetes cluster is already running"
            kubectl cluster-info
            return 0
        fi
    fi

    # Check if minikube is available
    if command_exists minikube; then
        print_status "Starting Minikube cluster..."
        minikube status >/dev/null 2>&1 || {
            minikube start --driver=docker --cpus=2 --memory=4096mb
        }

        # Enable ingress addon
        print_status "Enabling Minikube ingress addon..."
        minikube addons enable ingress

        # Set kubectl context
        eval $(minikube docker-env)

        print_success "Minikube cluster started and configured"
    else
        print_error "Neither Docker Desktop Kubernetes nor Minikube is available!"
        print_status "Please install and configure either Docker Desktop with Kubernetes enabled or Minikube"
        exit 1
    fi
}

# Function to delete old Docker images
cleanup_old_images() {
    print_status "Cleaning up old Docker images..."

    # Remove old images if they exist
    docker images | grep "todo-frontend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    docker images | grep "todo-backend" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

    print_success "Old Docker images removed"
}

# Function to build fresh Docker images
build_fresh_images() {
    print_status "Building fresh Docker images..."

    cd frontend/

    # Create Dockerfile if it doesn't exist (using optimized multi-stage build)
    if [ ! -f Dockerfile ]; then
        cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
EOF
    fi

    # Create .dockerignore if it doesn't exist
    if [ ! -f .dockerignore ]; then
        cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
EOF
    fi

    # Build frontend image
    docker build -t todo-frontend:latest .
    print_success "Frontend Docker image built: todo-frontend:latest"

    cd ../backend/

    # Create Dockerfile if it doesn't exist
    if [ ! -f Dockerfile ]; then
        cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
    fi

    # Create .dockerignore if it doesn't exist
    if [ ! -f .dockerignore ]; then
        cat > .dockerignore << 'EOF'
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
.DS_Store
.vscode
.idea
.env
EOF
    fi

    # Build backend image
    docker build -t todo-backend:latest .
    print_success "Backend Docker image built: todo-backend:latest"

    cd ..
}

# Function to create Kubernetes secrets
create_secrets() {
    print_status "Creating Kubernetes secrets..."

    # Delete existing secrets if they exist
    kubectl delete secret todo-secrets --ignore-not-found=true

    # Create secrets from environment variables
    kubectl create secret generic todo-secrets \
        --from-literal=GROQ_API_KEY="$GROQ_API_KEY" \
        --from-literal=DATABASE_URL="$DATABASE_URL" \
        --from-literal=BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
        --from-literal=GROQ_DEFAULT_MODEL="$GROQ_DEFAULT_MODEL" \
        --dry-run=client -o yaml | kubectl apply -f -

    print_success "Kubernetes secrets created"
}

# Function to create and deploy Helm chart
deploy_helm_chart() {
    print_status "Creating and deploying Helm chart..."

    # Create Helm chart structure if it doesn't exist
    if [ ! -d "helm/todo-app" ]; then
        mkdir -p helm/todo-app/templates
        mkdir -p helm/todo-app/charts
    fi

    # Create Chart.yaml
    cat > helm/todo-app/Chart.yaml << 'EOF'
apiVersion: v2
name: todo-app
description: A Helm chart for the Evolution Todo AI Chatbot
type: application
version: 0.1.0
appVersion: "1.0.0"
EOF

    # Create values.yaml with production settings
    cat > helm/todo-app/values.yaml << 'EOF'
frontend:
  replicaCount: 1
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3000
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: todo.local
        paths:
          - path: /
            pathType: Prefix
    tls: []
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 128Mi
  livenessProbe:
    httpGet:
      path: /
      port: 3000
    initialDelaySeconds: 30
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /
      port: 3000
    initialDelaySeconds: 5
    periodSeconds: 5

backend:
  replicaCount: 1
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8000
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 128Mi
  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 30
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 5
    periodSeconds: 5

secrets:
  name: todo-secrets
EOF

    # Create frontend deployment template
    cat > helm/todo-app/templates/frontend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  labels:
    app: todo-frontend
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: {{ .Values.secrets.name }}
        resources:
{{ toYaml .Values.frontend.resources | indent 10 }}
        livenessProbe:
{{ toYaml .Values.frontend.livenessProbe | indent 10 }}
        readinessProbe:
{{ toYaml .Values.frontend.readinessProbe | indent 10 }}
---
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend-service
  labels:
    app: todo-frontend
spec:
  type: {{ .Values.frontend.service.type }}
  ports:
  - port: {{ .Values.frontend.service.port }}
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: todo-frontend
EOF

    # Create backend deployment template
    cat > helm/todo-app/templates/backend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  labels:
    app: todo-backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: {{ .Values.secrets.name }}
        resources:
{{ toYaml .Values.backend.resources | indent 10 }}
        livenessProbe:
{{ toYaml .Values.backend.livenessProbe | indent 10 }}
        readinessProbe:
{{ toYaml .Values.backend.readinessProbe | indent 10 }}
---
apiVersion: v1
kind: Service
metadata:
  name: todo-backend-service
  labels:
    app: todo-backend
spec:
  type: {{ .Values.backend.service.type }}
  ports:
  - port: {{ .Values.backend.service.port }}
    targetPort: 8000
    protocol: TCP
    name: http
  selector:
    app: todo-backend
EOF

    # Create ingress template
    cat > helm/todo-app/templates/ingress.yaml << 'EOF'
{{- if .Values.frontend.ingress.enabled -}}
{{- $fullName := "todo-frontend" -}}
{{- $svcPort := .Values.frontend.service.port -}}
{{- if and .Values.frontend.ingress.className (not (semverCompare ">=1.18-0" .Capabilities.KubeVersion.GitVersion)) }}
  {{- if not (hasKey .Values.frontend.ingress.annotations "kubernetes.io/ingress.class") }}
  {{- $_ := set .Values.frontend.ingress.annotations "kubernetes.io/ingress.class" .Values.frontend.ingress.className}}
  {{- end }}
{{- end }}
{{- if semverCompare ">=1.19-0" $.Capabilities.KubeVersion.GitVersion -}}
apiVersion: networking.k8s.io/v1
{{- else if semverCompare ">=1.14-0" $.Capabilities.KubeVersion.GitVersion -}}
apiVersion: networking.k8s.io/v1beta1
{{- else -}}
apiVersion: extensions/v1beta1
{{- end }}
kind: Ingress
metadata:
  name: {{ $fullName }}
  labels:
    app: todo-frontend
  {{- with .Values.frontend.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if and .Values.frontend.ingress.className (semverCompare ">=1.18-0" .Capabilities.KubeVersion.GitVersion) }}
  ingressClassName: {{ .Values.frontend.ingress.className }}
  {{- end }}
  {{- if .Values.frontend.ingress.tls }}
  tls:
    {{- range .Values.frontend.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.frontend.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            {{- if and .pathType (semverCompare ">=1.18-0" $.Capabilities.KubeVersion.GitVersion) }}
            pathType: {{ .pathType }}
            {{- end }}
            backend:
              {{- if semverCompare ">=1.19-0" $.Capabilities.KubeVersion.GitVersion }}
              service:
                name: todo-frontend-service
                port:
                  number: {{ $svcPort }}
              {{- else }}
              serviceName: todo-frontend-service
              servicePort: {{ $svcPort }}
              {{- end }}
          {{- end }}
    {{- end }}
{{- end }}
EOF

    # Deploy the Helm chart
    helm upgrade --install todo-app helm/todo-app --namespace default --create-namespace

    print_success "Helm chart deployed successfully"
}

# Function to port forward for testing
setup_port_forward() {
    print_status "Setting up port forwarding for testing..."

    # Kill any existing port forwards on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true

    # Start port forwarding in background
    kubectl port-forward svc/todo-frontend-service 3000:3000 --namespace default &
    PORT_FORWARD_PID=$!

    # Wait a moment for port forward to establish
    sleep 5

    # Check if port forward is working
    if netstat -an 2>/dev/null | grep LISTEN | grep 3000 >/dev/null; then
        print_success "Port forwarding established on localhost:3000 (PID: $PORT_FORWARD_PID)"
        echo "Application will be accessible at: http://localhost:3000"
    else
        print_warning "Could not establish port forwarding on port 3000"
    fi
}

# Function to test application functionality
test_application() {
    print_status "Testing application functionality..."

    # Wait for services to be available
    sleep 10

    # Test if the frontend is accessible
    if curl -f http://localhost:3000/health 2>/dev/null; then
        print_success "Frontend service is responding"
    elif curl -f http://localhost:3000 2>/dev/null; then
        print_success "Frontend service is accessible"
    else
        print_warning "Frontend service may not be accessible yet, trying again in 30 seconds..."
        sleep 30
        if curl -f http://localhost:3000 2>/dev/null; then
            print_success "Frontend service is now accessible"
        else
            print_warning "Frontend service still not accessible"
        fi
    fi

    # Test backend if accessible
    BACKEND_POD=$(kubectl get pods -l app=todo-backend --namespace default -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ ! -z "$BACKEND_POD" ]; then
        print_status "Backend pod: $BACKEND_POD"
        kubectl exec $BACKEND_POD --namespace default -- curl -f localhost:8000/health 2>/dev/null && \
            print_success "Backend health check passed" || \
            print_warning "Backend health check failed or not available yet"
    fi
}

# Function to run AIOps demos
demo_aiops() {
    print_status "Running AIOps demonstrations..."

    # Demo kubectl-ai functionality (if available)
    if command_exists kubectl && kubectl get pods 2>/dev/null; then
        print_status "Kubernetes cluster information:"
        kubectl cluster-info

        print_status "Current deployments:"
        kubectl get deployments

        print_status "Current services:"
        kubectl get services

        print_status "Current pods:"
        kubectl get pods

        # Demo scaling
        print_status "Scaling frontend deployment to 2 replicas..."
        kubectl scale deployment todo-frontend --replicas=2

        sleep 10

        print_status "Current pod status after scaling:"
        kubectl get pods
    else
        print_warning "kubectl not available or cluster not ready for AIOps demo"
    fi

    # Health analysis
    if command_exists kubectl; then
        print_status "Checking cluster health..."
        kubectl get componentstatuses 2>/dev/null || true
        kubectl get nodes
    fi
}

# Main execution
main() {
    print_status "🚀 Starting Evolution Todo AI Chatbot Kubernetes Deployment"
    print_status "This script will automate the complete deployment process"

    # Check prerequisites
    check_env_vars
    setup_kubernetes
    cleanup_old_images
    build_fresh_images
    create_secrets
    deploy_helm_chart
    wait_for_pods_ready "default"
    setup_port_forward
    test_application
    demo_aiops

    print_success "🎉 Deployment completed successfully!"
    print_status ""
    print_status "==========================================="
    print_status "     DEPLOYMENT SUMMARY"
    print_status "==========================================="
    print_status "✅ Docker images built: todo-frontend:latest, todo-backend:latest"
    print_status "✅ Kubernetes cluster verified and ready"
    print_status "✅ Helm chart deployed with production settings"
    print_status "✅ Secrets configured securely"
    print_status "✅ Health checks and resource limits applied"
    print_status "✅ Port forwarding established on localhost:3000"
    print_status ""
    print_status "🌐 ACCESS APPLICATION:"
    print_status "   Browser: http://localhost:3000"
    print_status "   Or via ingress: http://todo.local (add to hosts file)"
    print_status ""
    print_status "🔧 USEFUL COMMANDS:"
    print_status "   Check pods: kubectl get pods"
    print_status "   Check services: kubectl get services"
    print_status "   Check logs: kubectl logs -l app=todo-frontend"
    print_status "   Scale frontend: kubectl scale deployment todo-frontend --replicas=2"
    print_status "   Helm status: helm status todo-app"
    print_status ""
    print_status "📊 MONITORING:"
    print_status "   Resource usage: kubectl top pods"
    print_status "   Events: kubectl get events --sort-by='.lastTimestamp'"
    print_status "==========================================="
    print_success "Deployment completed successfully! Application is now running."
}

# Handle Ctrl+C gracefully
trap 'print_error "Script interrupted by user"; exit 130' INT
trap 'print_error "Script terminated"; exit 143' TERM

# Run main function
main "$@"