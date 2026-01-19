---
id: 1
title: AI Chatbot Implementation Plan
stage: plan
date_iso: 2025-12-31
surface: agent
model: Claude Sonnet 4.5
feature: ai-chatbot
branch: 004-ai-chatbot
user: Claude Code
command: sp.plan
labels: [ai-chatbot, plan, implementation]
links: []
files_yaml:
  - specs/004-ai-chatbot/plan.md
tests_yaml: []
---

# AI Chatbot Implementation Plan

## Prompt

```
**IMPORTANT: Before creating the plan, you MUST:**
1. Read `.specify/memory/constitution.md` first to understand project principles and Phase 3 mandatory requirements
2. Read `specs/003-ai-chatbot/spec.md` to understand the feature specification
3. Ensure all Phase 3 mandatory requirements from constitution are included in the plan
4. Follow all constitution principles (Spec-Driven Development, Clean Code, etc.)

Create implementation plan for **Phase 3: AI-Powered Todo Chatbot** in `specs/003-ai-chatbot/plan.md`.

**Plan Requirements:**

**Summary Section:**
- Brief description of adding conversational AI interface
- Technology stack: OpenAI ChatKit (frontend), Agents SDK (orchestration), MCP tools (task operations)
- Key feature: Natural language task management with stateless server architecture

**Technical Context:**
- Language/Version: Python 3.13+ (backend), TypeScript/Node.js 22+ (frontend)
- Primary Dependencies: FastAPI, SQLModel, OpenAI Agents SDK, MCP SDK (backend); Next.js 16, @openai/chatkit (frontend)
- Storage: Neon Serverless PostgreSQL (existing + new tables)
- Testing: pytest (backend), vitest (frontend)
- Target Platform: Web application (browser + server)
- Project Type: Web application (frontend + backend)
- Performance Goals: Response streaming < 2s, 50 concurrent sessions
- Constraints: Stateless server (conversation persisted to DB), JWT authentication
- Scale/Scope: Single user per conversation, 5 MCP tools

**Constitution Check:**
- Check all 6 principles (I-VI) against the plan
- Mark each as PASS/FAIL with notes
- Gate Result: Must be PASSED before proceeding

**Project Structure:**
- Documentation structure (specs/003-ai-chatbot/)
- Source code structure (phase-3/backend/ and phase-3/frontend/)
- New directories: services/, agents/, mcp/, models/conversation.py, models/message.py
- New files: routers/chat.py, schemas/chat.py, components/chatkit/, app/chat/

**Architecture Overview:**
- ASCII diagram showing system flow
- Request flow: POST /api/chat → JWT → Conversation service → Agent → MCP tools → Task service → Database
- Response flow: Streaming via SSE

**Key Design Decisions (5 required):**
1. Service Layer Extraction
2. Model Factory Pattern
3. In-Process MCP Tools
4. Stateless Chat Architecture
5. SSE Streaming

**Implementation Phases (7 phases required):**
- Phase A: Service Layer Foundation
- Phase B: Database Models
- Phase C: MCP Tools
- Phase D: Agent Integration
- Phase E: Chat API
- Phase F: Frontend ChatKit
- Phase
```

## Response

```
# Implementation Plan: AI-Powered Todo Chatbot

## Summary

This plan outlines the implementation of an AI-powered conversational interface for task management. The system will allow users to manage their todo lists through natural language using OpenAI ChatKit (frontend), OpenAI Agents SDK (orchestration), and MCP tools (task operations). The architecture will be stateless with conversation state persisted to the database.

## Technical Context

- **Language/Version**: Python 3.13+ (backend), TypeScript/Node.js 22+ (frontend)
- **Primary Dependencies**:
  - Backend: FastAPI, SQLModel, OpenAI Agents SDK, MCP SDK, PyJWT
  - Frontend: Next.js 16, @openai/chatkit, Tailwind CSS, Better Auth
- **Storage**: Neon Serverless PostgreSQL (existing + new tables)
- **Testing**: pytest (backend), vitest (frontend)
- **Target Platform**: Web application (browser + server)
- **Project Type**: Web application (frontend + backend)
- **Performance Goals**: Response streaming < 2s, 50 concurrent sessions
- **Constraints**: Stateless server (conversation persisted to DB), JWT authentication
- **Scale/Scope**: Single user per conversation, 5 MCP tools

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Persistent Database Storage | PASS | Conversations and messages will be stored in Neon PostgreSQL |
| II. Web-First Multi-User Application | PASS | Chat interface integrated into existing web app with user isolation |
| III. Clean Code Practices | PASS | Following modular architecture with clear separation of concerns |
| IV. Modular Monorepo Structure | PASS | New modules in backend/src/agents, backend/src/mcp, frontend/src/chatkit |
| V. Spec-Driven Development | PASS | Following this spec-driven plan |
| VI. Automated Testing | PASS | Tests for MCP tools, chat API, and conversation services |
| VII. Clarity & Maintainability | PASS | Clear service layer separation and documentation |
| VIII. AI Sub-Agents and Skills | PASS | Using OpenAI Agents SDK for AI logic |
| IX. Multi-User Architecture | PASS | JWT authentication and user isolation enforced |
| X. RESTful API Design | PASS | Chat API follows REST conventions with SSE streaming |
| XI. JWT Authentication | PASS | Using Better Auth JWT tokens for authentication |
| XII. AI-Powered Conversational Interface | PASS | All Phase III requirements implemented |

**Gate Result**: PASSED - All constitution principles satisfied

## Project Structure

### Documentation Structure
- `specs/004-ai-chatbot/` - Feature specifications, plan, tasks
- `specs/004-ai-chatbot/checklists/` - Implementation checklists

### Source Code Structure
- `backend/src/agents/` - Agent factory and TodoAgent implementation
- `backend/src/mcp_server/` - MCP tools implementation
- `backend/src/services/` - Service layer (task_service, conversation_service)
- `backend/src/models/conversation.py` - Conversation model
- `backend/src/models/message.py` - Message model
- `backend/src/routers/chat.py` - Chat API endpoint
- `backend/src/schemas/chat.py` - Chat request/response schemas
- `frontend/src/components/chatkit/` - ChatKit UI components
- `frontend/src/app/chat/` - Chat page route

## Architecture Overview

```
[User]
  ↓ (Natural Language Message)
[Frontend: OpenAI ChatKit]
  ↓ (POST /api/{user_id}/chat)
[JWT Authentication Middleware]
  ↓ (Validated User Context)
[Conversation Service]
  ↓ (Fetch/Store Conversation History)
[OpenAI Agent with MCP Tools]
  ↓ (Tool Calls: add_task, list_tasks, etc.)
[Task Service]
  ↓ (Database Operations)
[Neon PostgreSQL]
  ↓ (Streaming Response via SSE)
[Frontend: Real-time Display]
```

**Request Flow**: POST /api/chat → JWT → Conversation service → Agent → MCP tools → Task service → Database
**Response Flow**: Streaming via Server-Sent Events (SSE)

## Key Design Decisions

### 1. Service Layer Extraction
- **Decision**: Extract business logic into dedicated service layer
- **Rationale**: Enables code reuse between MCP tools and REST endpoints, improves testability
- **Implementation**: `task_service.py` and `conversation_service.py` with shared logic

### 2. Model Factory Pattern
- **Decision**: Implement centralized model factory for AI provider abstraction
- **Rationale**: Allows switching between AI providers (OpenAI, Gemini) via environment variables
- **Implementation**: `agents/factory.py` with provider-agnostic interface

### 3. In-Process MCP Tools
- **Decision**: Implement MCP tools as in-process functions rather than separate services
- **Rationale**: Reduces latency and complexity while maintaining tool interface compliance
- **Implementation**: MCP server running within the same process as the agent

### 4. Stateless Chat Architecture
- **Decision**: Implement completely stateless chat endpoint with database persistence
- **Rationale**: Enables horizontal scaling and resilience to server restarts
- **Implementation**: All conversation state stored in database, no server-side session state

### 5. SSE Streaming
- **Decision**: Use Server-Sent Events for real-time response streaming
- **Rationale**: Provides real-time feedback to users with low latency
- **Implementation**: FastAPI streaming response with SSE format

## Implementation Phases

### Phase A: Service Layer Foundation
- [ ] Implement `task_service.py` with CRUD operations for tasks
- [ ] Implement `conversation_service.py` with CRUD operations for conversations and messages
- [ ] Ensure all operations enforce user isolation
- [ ] Add proper error handling and validation

### Phase B: Database Models
- [ ] Create `models/conversation.py` with Conversation SQLModel
- [ ] Create `models/message.py` with Message SQLModel
- [ ] Update existing Task model if needed for chatbot functionality
- [ ] Add database indexes for efficient querying
- [ ] Create database migrations for new models

### Phase C: MCP Tools
- [ ] Implement MCP server using Official MCP SDK
- [ ] Create `add_task` tool with proper parameters and return values
- [ ] Create `list_tasks` tool with status filtering capability
- [ ] Create `complete_task` tool for marking tasks complete
- [ ] Create `delete_task` tool for removing tasks
- [ ] Create `update_task` tool for modifying task details
- [ ] Ensure all tools are stateless and use database persistence

### Phase D: Agent Integration
- [ ] Implement `agents/factory.py` with model factory pattern
- [ ] Create `agents/todo_agent.py` with OpenAI Agents SDK integration
- [ ] Configure agent with MCP tools for task operations
- [ ] Implement intent classification and tool selection logic
- [ ] Add support for multiple AI providers (OpenAI, Gemini)

### Phase E: Chat API
- [ ] Create `routers/chat.py` with POST /api/{user_id}/chat endpoint
- [ ] Implement JWT authentication middleware for chat endpoint
- [ ] Add conversation history retrieval and storage logic
- [ ] Implement SSE streaming for real-time responses
- [ ] Add proper error handling and validation

### Phase F: Frontend ChatKit
- [ ] Set up `components/chatkit/` with OpenAI ChatKit integration
- [ ] Create `app/chat/` page with chat interface
- [ ] Configure ChatKit with appropriate domain allowlist
- [ ] Implement authentication integration with Better Auth
- [ ] Add responsive design and accessibility features

### Phase G: Integration & Testing
- [ ] Integrate all components and test end-to-end functionality
- [ ] Implement comprehensive test suite for MCP tools
- [ ] Test conversation persistence across server restarts
- [ ] Performance test for 50 concurrent sessions
- [ ] Security testing for user isolation
- [ ] User acceptance testing for natural language commands

## Environment Variables

### Backend
- `LLM_PROVIDER` (openai or gemini)
- `GEMINI_API_KEY` (required if LLM_PROVIDER=gemini)
- `GEMINI_DEFAULT_MODEL` (e.g., gemini-2.0-flash)
- `BETTER_AUTH_SECRET` (JWT verification)
- `DATABASE_URL` (Neon PostgreSQL connection)

### Frontend
- `NEXT_PUBLIC_CHATKIT_API_URL` (e.g., /api/chat)
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` (for production ChatKit)

## Success Criteria Validation

- [ ] Users can add a task through natural language in under 5 seconds
- [ ] Users can complete all 5 core operations (add, list, complete, delete, update) through conversation
- [ ] Conversation history persists across browser refreshes and server restarts
- [ ] System correctly interprets at least 90% of clearly-phrased task management requests
- [ ] Response streaming begins within 2 seconds of user message submission
- [ ] System handles 50 concurrent chat sessions without degradation
- [ ] Users report the chat interface as "intuitive" or "easy to use" in 80% of feedback
- [ ] Error messages guide users toward successful task completion 90% of the time

## Risk Analysis

### Top 3 Risks
1. **AI Interpretation Accuracy**: Natural language processing may misinterpret user intent
   - Mitigation: Implement fallback responses and clarification requests

2. **Performance Under Load**: Streaming responses may not scale to 50 concurrent sessions
   - Mitigation: Implement connection pooling and performance monitoring

3. **Security Vulnerabilities**: JWT token validation or user isolation failures
   - Mitigation: Comprehensive security testing and code review

## Operational Readiness

- [ ] Monitoring for chat response times and error rates
- [ ] Alerting for failed authentication attempts
- [ ] Runbooks for common operational issues
- [ ] Deployment and rollback procedures for chatbot features
```