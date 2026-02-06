# Master Deployment Script for Evolution Todo AI Chatbot

This directory contains the master deployment automation script for the Kubernetes deployment of the Evolution Todo AI Chatbot application.

## Master Deployment Script

### `master-deploy.sh`

The main orchestration script that automates the complete deployment process:

- Builds Docker images from the frontend and backend directories
- Loads images to Minikube
- Installs Helm charts with secrets
- Deploys the application and waits for pods to be ready
- Tests the deployed application (chatbot functionality, tasks in Neon DB, Gemini calls)
- Runs AIOps tools (kubectl-ai for scaling, kagent for health checks)
- Verifies success criteria (uptime, response time)

### Features

- **Self-contained**: No manual input required
- **Comprehensive logging**: Detailed output for each step
- **Error handling**: Proper cleanup on failure
- **AI Operations**: Integration with kubectl-ai and kagent
- **Success validation**: Verifies all success criteria are met

### Prerequisites

Before running the script, ensure you have:

1. **Environment variables** set:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: JWT secret for authentication

2. **Required tools installed**:
   - Minikube 1.32+
   - Helm 3.x
   - kubectl
   - Docker 24+
   - (Optional) kubectl-ai and kagent for AIOps features

### Usage

```bash
# Make the script executable
chmod +x master-deploy.sh

# Run the deployment
./master-deploy.sh
```

### Environment Setup

You can set up your environment variables using a `.env` file:

```bash
# Create .env file
cp ../.env.example .env
# Edit .env to add your actual values
nano .env

# Source the environment
source .env
```

### Success Criteria

The script verifies the following success criteria:
- All pods are running and healthy
- Application is accessible
- Database integration works
- Gemini API integration is configured
- AIOps tools can interact with the cluster
- Response time under 3 seconds

## Additional Scripts

- `build-images.sh`: Build Docker images only
- `deploy.sh`: Deploy to Kubernetes only
- `test-deployment.sh`: Test deployed application
- `validate-deployment.sh`: Validate deployment completeness
- `demo-script.sh`: Demonstrate AI operations

## Troubleshooting

- If you encounter permission errors, ensure the script is executable: `chmod +x master-deploy.sh`
- If Docker builds fail, check your Docker daemon is running
- If Minikube fails to start, try: `minikube delete` followed by `minikube start`
- If secrets aren't configured properly, verify your environment variables are set

## Expected Output

Upon successful completion, you should see:
- All pods in "Running" status
- Services accessible in the `todo-app` namespace
- Ingress configured for external access
- HPA configured for auto-scaling
- All AIOps tools functional