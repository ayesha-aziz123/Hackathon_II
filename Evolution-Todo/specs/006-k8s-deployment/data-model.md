# Data Model: Kubernetes Resources for AI Todo Chatbot Deployment

## Kubernetes Resource Entities

### 1. Deployment (Frontend)
**Fields**:
- apiVersion: apps/v1
- kind: Deployment
- metadata.name: evolution-todo-frontend
- metadata.namespace: default
- spec.replicas: 2 (configurable)
- spec.selector.matchLabels.app: evolution-todo-frontend
- spec.template.metadata.labels.app: evolution-todo-frontend
- spec.template.spec.containers[0].name: frontend
- spec.template.spec.containers[0].image: evolution-todo-frontend:latest
- spec.template.spec.containers[0].ports[0].containerPort: 3000
- spec.template.spec.containers[0].envFrom[0].configMapRef.name: frontend-config
- spec.template.spec.containers[0].envFrom[1].secretRef.name: frontend-secrets
- spec.template.spec.containers[0].resources.limits.memory: 512Mi
- spec.template.spec.containers[0].resources.limits.cpu: 200m
- spec.template.spec.containers[0].resources.requests.memory: 256Mi
- spec.template.spec.containers[0].resources.requests.cpu: 100m
- spec.template.spec.containers[0].livenessProbe.httpGet.path: /
- spec.template.spec.containers[0].livenessProbe.httpGet.port: 3000
- spec.template.spec.containers[0].livenessProbe.initialDelaySeconds: 30
- spec.template.spec.containers[0].livenessProbe.periodSeconds: 10
- spec.template.spec.containers[0].readinessProbe.httpGet.path: /
- spec.template.spec.containers[0].readinessProbe.httpGet.port: 3000
- spec.template.spec.containers[0].readinessProbe.initialDelaySeconds: 5
- spec.template.spec.containers[0].readinessProbe.periodSeconds: 5

**Relationships**:
- Depends on ConfigMap: frontend-config
- Depends on Secret: frontend-secrets
- Exposed by Service: frontend-service
- Connected to Backend via environment variables

**Validation rules**:
- Image must exist in registry
- Memory/CPU limits must be within node capacity
- Liveness/readiness probe paths must be accessible

### 2. Deployment (Backend)
**Fields**:
- apiVersion: apps/v1
- kind: Deployment
- metadata.name: evolution-todo-backend
- metadata.namespace: default
- spec.replicas: 2 (configurable)
- spec.selector.matchLabels.app: evolution-todo-backend
- spec.template.metadata.labels.app: evolution-todo-backend
- spec.template.spec.containers[0].name: backend
- spec.template.spec.containers[0].image: evolution-todo-backend:latest
- spec.template.spec.containers[0].ports[0].containerPort: 8000
- spec.template.spec.containers[0].envFrom[0].configMapRef.name: backend-config
- spec.template.spec.containers[0].envFrom[1].secretRef.name: backend-secrets
- spec.template.spec.containers[0].resources.limits.memory: 512Mi
- spec.template.spec.containers[0].resources.limits.cpu: 200m
- spec.template.spec.containers[0].resources.requests.memory: 256Mi
- spec.template.spec.containers[0].resources.requests.cpu: 100m
- spec.template.spec.containers[0].livenessProbe.httpGet.path: /health
- spec.template.spec.containers[0].livenessProbe.httpGet.port: 8000
- spec.template.spec.containers[0].livenessProbe.initialDelaySeconds: 30
- spec.template.spec.containers[0].livenessProbe.periodSeconds: 10
- spec.template.spec.containers[0].readinessProbe.httpGet.path: /ready
- spec.template.spec.containers[0].readinessProbe.httpGet.port: 8000
- spec.template.spec.containers[0].readinessProbe.initialDelaySeconds: 5
- spec.template.spec.containers[0].readinessProbe.periodSeconds: 5

**Relationships**:
- Depends on ConfigMap: backend-config
- Depends on Secret: backend-secrets
- Exposed by Service: backend-service
- Connects to Neon PostgreSQL via DATABASE_URL

**Validation rules**:
- Image must exist in registry
- Memory/CPU limits must be within node capacity
- Health endpoints must return 200 status

### 3. Service (Frontend - NodePort)
**Fields**:
- apiVersion: v1
- kind: Service
- metadata.name: frontend-service
- metadata.namespace: default
- spec.type: NodePort
- spec.selector.app: evolution-todo-frontend
- spec.ports[0].port: 80
- spec.ports[0].targetPort: 3000
- spec.ports[0].nodePort: (assigned by Kubernetes)

**Relationships**:
- Connects to: evolution-todo-frontend deployment
- Potentially exposed via: Ingress resource

**Validation rules**:
- Target port must match container port
- NodePort must be in valid range (30000-32767)

### 4. Service (Backend - ClusterIP)
**Fields**:
- apiVersion: v1
- kind: Service
- metadata.name: backend-service
- metadata.namespace: default
- spec.type: ClusterIP
- spec.selector.app: evolution-todo-backend
- spec.ports[0].port: 80
- spec.ports[0].targetPort: 8000

**Relationships**:
- Connects to: evolution-todo-backend deployment
- Accessed by: frontend pods

**Validation rules**:
- Target port must match container port

### 5. ConfigMap (Frontend)
**Fields**:
- apiVersion: v1
- kind: ConfigMap
- metadata.name: frontend-config
- metadata.namespace: default
- data.NEXT_PUBLIC_API_URL: http://backend-service:80
- data.NODE_ENV: production

**Relationships**:
- Referenced by: evolution-todo-frontend deployment

**Validation rules**:
- Keys must be valid environment variable names
- Values must be valid strings

### 6. ConfigMap (Backend)
**Fields**:
- apiVersion: v1
- kind: ConfigMap
- metadata.name: backend-config
- metadata.namespace: default
- data.HOST: 0.0.0.0
- data.PORT: "8000"
- data.NODE_ENV: production

**Relationships**:
- Referenced by: evolution-todo-backend deployment

**Validation rules**:
- Keys must be valid environment variable names
- Values must be valid strings

### 7. Secret (Frontend)
**Fields**:
- apiVersion: v1
- kind: Secret
- metadata.name: frontend-secrets
- metadata.namespace: default
- type: Opaque
- stringData.BETTER_AUTH_SECRET: (to be provided)
- stringData.NEXTAUTH_URL: (to be determined from ingress/service)

**Relationships**:
- Referenced by: evolution-todo-frontend deployment

**Validation rules**:
- Sensitive data must be stored in Secret, not ConfigMap
- Values must be encrypted at rest

### 8. Secret (Backend)
**Fields**:
- apiVersion: v1
- kind: Secret
- metadata.name: backend-secrets
- metadata.namespace: default
- type: Opaque
- stringData.BETTER_AUTH_SECRET: (to be provided)
- stringData.DATABASE_URL: (Neon PostgreSQL connection string)
- stringData.COHERE_API_KEY: (Cohere API key for chatbot)

**Relationships**:
- Referenced by: evolution-todo-backend deployment

**Validation rules**:
- Sensitive data must be stored in Secret, not ConfigMap
- Values must be encrypted at rest

### 9. Ingress
**Fields**:
- apiVersion: networking.k8s.io/v1
- kind: Ingress
- metadata.name: evolution-todo-ingress
- metadata.namespace: default
- metadata.annotations.kubernetes.io/ingress.class: nginx
- metadata.annotations.nginx.ingress.kubernetes.io/rewrite-target: /
- spec.rules[0].host: evolution-todo.local
- spec.rules[0].http.paths[0].path: /
- spec.rules[0].http.paths[0].pathType: Prefix
- spec.rules[0].http.paths[0].backend.service.name: frontend-service
- spec.rules[0].http.paths[0].backend.service.port.number: 80

**Relationships**:
- Routes to: frontend-service
- Depends on: ingress-nginx controller

**Validation rules**:
- Hostname must be resolvable (or added to hosts file)
- Paths must be valid prefixes

### 10. HorizontalPodAutoscaler (Optional)
**Fields**:
- apiVersion: autoscaling/v2
- kind: HorizontalPodAutoscaler
- metadata.name: frontend-hpa
- metadata.namespace: default
- spec.scaleTargetRef.apiVersion: apps/v1
- spec.scaleTargetRef.kind: Deployment
- spec.scaleTargetRef.name: evolution-todo-frontend
- spec.minReplicas: 2
- spec.maxReplicas: 10
- spec.metrics[0].type: Resource
- spec.metrics[0].resource.name: cpu
- spec.metrics[0].resource.target.type: Utilization
- spec.metrics[0].resource.target.averageUtilization: 70

**Relationships**:
- Controls scaling of: evolution-todo-frontend deployment

**Validation rules**:
- Metrics server must be available
- minReplicas must be <= maxReplicas

## State Transitions

### Deployment Lifecycle
1. **Pending**: Pod scheduled but not yet running
2. **ContainerCreating**: Container being pulled and started
3. **Running**: Pod running and passing readiness probe
4. **Terminating**: Pod shutting down gracefully
5. **Failed/Succeeded**: Terminal states for job-based pods

### Service Discovery
1. **Service Creation**: Service resource created in Kubernetes
2. **Endpoint Creation**: Kubernetes creates endpoints mapping to pods
3. **DNS Registration**: Service becomes available via DNS name
4. **Traffic Routing**: Traffic routed to healthy pods

## Configuration Parameters

### Helm Values Structure
```yaml
global:
  imagePullPolicy: IfNotPresent
  backendUrl: http://backend-service:80

frontend:
  replicaCount: 2
  image:
    repository: evolution-todo-frontend
    tag: latest
  service:
    type: NodePort
    port: 80
  resources:
    limits:
      memory: 512Mi
      cpu: 200m
    requests:
      memory: 256Mi
      cpu: 100m
  ingress:
    enabled: true
    hostname: evolution-todo.local

backend:
  replicaCount: 2
  image:
    repository: evolution-todo-backend
    tag: latest
  service:
    port: 80
  resources:
    limits:
      memory: 512Mi
      cpu: 200m
    requests:
      memory: 256Mi
      cpu: 100m

secrets:
  betterAuthSecret: ""
  cohereApiKey: ""
  databaseUrl: ""
```