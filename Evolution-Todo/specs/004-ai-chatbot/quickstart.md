# Quickstart Guide: AI-Powered Todo Chatbot

**Feature**: 004-ai-chatbot
**Date**: 2026-01-01
**Status**: Complete

## Overview

This guide provides a quick setup and deployment process for the AI-Powered Todo Chatbot feature. The implementation extends the existing Phase 2 Todo application with conversational AI capabilities using OpenAI Agents SDK, MCP tools, and natural language task management.

## Prerequisites

- Python 3.13+ with UV package manager
- Node.js 22+ with pnpm
- Neon PostgreSQL database account
- OpenAI or Google Gemini API key
- Better Auth account for authentication

## Environment Setup

### 1. Backend Environment Variables

Create `backend/.env` with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-jwt-key-here-32-chars-min"
BETTER_AUTH_URL="http://localhost:3000"

# LLM Provider Configuration
LLM_PROVIDER="openai"  # or "gemini"
OPENAI_API_KEY="your-openai-api-key"  # Required if LLM_PROVIDER=openai
OPENAI_DEFAULT_MODEL="gpt-4o"  # Default model for OpenAI
GEMINI_API_KEY="your-gemini-api-key"  # Required if LLM_PROVIDER=gemini
GEMINI_DEFAULT_MODEL="gemini-2.0-flash"  # Default model for Gemini

# CORS and Security
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
ENVIRONMENT="development"
LOG_LEVEL="INFO"
```

### 2. Frontend Environment Variables

Create `frontend/.env.local` with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-jwt-key-here-32-chars-min"
BETTER_AUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_CHATKIT_API_URL="http://localhost:8000"
```

## Installation

### 1. Backend Setup

```bash
# Navigate to backend directory
cd phase-3-ai-chatbot/backend

# Install dependencies with UV
uv sync

# Run database migrations
uv run alembic upgrade head

# Start the backend server
uv run uvicorn src.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd phase-3-ai-chatbot/frontend

# Install dependencies with pnpm
pnpm install

# Start the frontend development server
pnpm dev
```

## API Endpoints

### Chat API

- **POST** `/api/{user_id}/chat` - Chat endpoint with SSE streaming
  - Headers: `Authorization: Bearer <jwt_token>`
  - Request: `{"conversation_id": null, "message": "Add buy groceries"}`

### Conversation Management

- **GET** `/api/{user_id}/conversations` - List user's conversations
  - Headers: `Authorization: Bearer <jwt_token>`

### Existing Task API (Phase 2)

- **GET** `/api/{user_id}/tasks` - List user's tasks
- **POST** `/api/{user_id}/tasks` - Create a new task
- **PUT** `/api/{user_id}/tasks/{id}` - Update a task
- **DELETE** `/api/{user_id}/tasks/{id}` - Delete a task
- **PATCH** `/api/{user_id}/tasks/{id}/complete` - Toggle task completion

## Natural Language Commands

The AI chatbot supports the following natural language patterns:

### Task Creation
- "Add a task to buy groceries"
- "Create a task to call mom tonight"
- "Remember to pay bills tomorrow"

### Task Listing
- "Show me all my tasks"
- "What's pending?"
- "What have I completed?"
- "List my tasks"

### Task Completion
- "Mark task 3 as complete"
- "Complete the meeting task"
- "I finished buying groceries"
- "Finish task 5"

### Task Deletion
- "Delete task 2"
- "Remove the shopping task"
- "Cancel task 7"

### Task Update
- "Change task 1 to 'Call mom tonight'"
- "Update task 2 with title 'Buy groceries' and description 'Milk, eggs, bread'"

## Database Schema

The implementation adds two new tables to the existing Phase 2 database:

### conversations Table
- `id`: Primary key
- `user_id`: User identifier (indexed)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### messages Table
- `id`: Primary key
- `conversation_id`: Foreign key to conversations (indexed)
- `user_id`: User identifier (indexed)
- `role`: "user" or "assistant"
- `content`: Message content
- `tool_calls`: JSON string of tool calls (assistant only)
- `created_at`: Timestamp (indexed)

## MCP Tools Architecture

The system uses MCP (Model Context Protocol) tools for task operations:

### Available Tools
1. `add_task` - Create new tasks
2. `list_tasks` - Retrieve tasks with filters
3. `complete_task` - Mark tasks as complete
4. `delete_task` - Remove tasks
5. `update_task` - Modify task details

### Tool Integration
- MCP tools run as in-process components within FastAPI
- Tools use the same service layer as REST endpoints
- Agent communicates with tools via OpenAI Agents SDK

## Development Workflow

### 1. Running Locally

```bash
# Terminal 1: Start backend
cd phase-3-ai-chatbot/backend
uv run uvicorn src.main:app --reload --port 8000

# Terminal 2: Start frontend
cd phase-3-ai-chatbot/frontend
pnpm dev
```

### 2. Testing

```bash
# Backend tests
cd phase-3-ai-chatbot/backend
uv run pytest

# Frontend tests
cd phase-3-ai-chatbot/frontend
pnpm test
```

### 3. Database Migrations

```bash
# Create new migration
cd phase-3-ai-chatbot/backend
uv run alembic revision --autogenerate -m "Add conversation and message tables"

# Apply migrations
uv run alembic upgrade head
```

## Deployment

### 1. Backend Deployment

```bash
# Build backend Docker image
cd phase-3-ai-chatbot/backend
docker build -t todo-backend .

# Run backend container
docker run -p 8000:8000 \
  -e DATABASE_URL="..." \
  -e BETTER_AUTH_SECRET="..." \
  -e OPENAI_API_KEY="..." \
  todo-backend
```

### 2. Frontend Deployment

Deploy to Vercel or Netlify with the environment variables configured in the deployment platform.

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure `OPENAI_API_KEY` or `GEMINI_API_KEY` is set correctly
2. **Database Connection**: Verify `DATABASE_URL` format and connectivity
3. **Authentication**: Check that JWT tokens are properly configured
4. **SSE Streaming**: Verify that the chat endpoint returns proper SSE format

### Debugging Commands

```bash
# Check environment variables
cd phase-3-ai-chatbot/backend
uv run python -c "import os; print(os.getenv('LLM_PROVIDER'))"

# Test database connection
uv run python -c "from database import engine; engine.connect(); print('Connected')"

# Check available models
uv run python -c "from agents.factory import create_model; print(create_model())"
```

## Next Steps

1. **Customize AI Instructions**: Update the agent instructions in `todo_agent.py`
2. **Extend MCP Tools**: Add additional tools for new functionality
3. **Enhance UI**: Customize the ChatKit widget appearance
4. **Add Analytics**: Track conversation metrics and user engagement
5. **Scale Deployment**: Configure load balancing and multiple instances