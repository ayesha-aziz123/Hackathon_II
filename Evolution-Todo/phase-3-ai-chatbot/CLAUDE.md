# Phase III - AI-Powered Todo Chatbot

## Project Overview
Full-Stack AI-powered Todo application with natural language task management using OpenAI Agents SDK and MCP (Model Context Protocol) tools.

**Current Phase:** Phase III (AI Chatbot Integration with OpenAI ChatKit)  
**Development Method:** Agentic Dev Stack → Spec-Kit Plus → Claude Code  
**Architecture:** Stateless backend with database persistence

## Core Principles
1. **Spec-Driven Development:** ALWAYS read specifications in `specs/004-ai-chatbot/` before coding
2. **AI-Native Architecture:** OpenAI Agents SDK + MCP tools for task operations
3. **Stateless Backend:** Zero in-memory sessions - all state persists in PostgreSQL database
4. **User Isolation:** JWT-based authentication - users can ONLY access their own data
5. **No Manual Coding:** All development via Claude Code CLI (we review process and iterations)

## Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with Server Components |
| **UI Framework** | Tailwind CSS + Shadcn UI | Styling and component library |
| **Chat UI** | OpenAI ChatKit | Pre-built chat interface widget |
| **Backend** | Python 3.13+ FastAPI | REST API + Chat endpoint |
| **AI Framework** | OpenAI Agents SDK | LLM orchestration and tool calling |
| **MCP Server** | Official MCP SDK | Model Context Protocol tool interface |
| **ORM** | SQLModel | Type-safe database models |
| **Database** | Neon Serverless PostgreSQL | Cloud-hosted PostgreSQL |
| **Auth (Frontend)** | Better Auth + Drizzle ORM | Session management |
| **Auth (Backend)** | JWT Verification | Shared secret validation |
| **Task Queue** | FastAPI Background Tasks | Message cleanup (2-day retention) |

## Project Structure
```
phase-3-ai-chatbot/
├── frontend/                       # Next.js 16 Application
│   ├── app/                        # App Router
│   │   ├── (auth)/                 # Login/Signup pages
│   │   ├── api/                    # API routes
│   │   ├── dashboard/              # Dashboard with tasks
│   │   ├── settings/               # User settings
│   │   └── tasks/                  # Task management pages
│   ├── components/
│   │   ├── auth/                   # AuthProvider, login forms
│   │   ├── chat/                   # ChatKit widget, floating button
│   │   ├── dashboard/              # Dashboard UI components
│   │   ├── layout/                 # Navbar, Sidebar
│   │   ├── tasks/                  # Task cards, forms, filters
│   │   └── ui/                     # Shadcn primitives
│   ├── contexts/                   # React contexts
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # Backend API client
│   │   ├── auth.ts                 # Better Auth config
│   │   └── auth-client.ts          # Client-side auth helpers
│   ├── actions/                    # Server Actions
│   └── drizzle/                    # Database schema (auth tables)
│
├── backend/                        # FastAPI + AI Service
│   ├── src/
│   │   ├── api/                    # API endpoints
│   │   │   ├── chatkit.py          # POST /api/chatkit (ChatKit protocol)
│   │   │   └── tasks.py            # REST endpoints for tasks
│   │   ├── auth/
│   │   │   └── jwt.py              # JWT validation logic
│   │   ├── db/
│   │   │   ├── session.py          # Sync database session
│   │   │   └── async_session.py    # Async database session
│   │   ├── models/                 # SQLModel entities
│   │   │   ├── task.py             # Task model
│   │   │   ├── conversation.py     # Conversation model
│   │   │   └── message.py          # Message model
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── task.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── task_service.py     # Business logic for tasks
│   │   │   └── chatkit_server.py   # ChatKit server implementation
│   │   ├── tasks/
│   │   │   └── cleanup.py          # Background task for message cleanup
│   │   ├── config.py               # Settings (LLM provider, API keys)
│   │   └── main.py                 # FastAPI app entry point
│   ├── mcp_server/                 # MCP Tools Implementation
│   │   ├── __init__.py
│   │   ├── tools/
│   │   │   ├── add_task.py         # MCP tool: add_task
│   │   │   ├── list_tasks.py       # MCP tool: list_tasks
│   │   │   ├── complete_task.py    # MCP tool: complete_task
│   │   │   ├── delete_task.py      # MCP tool: delete_task
│   │   │   ├── update_task.py      # MCP tool: update_task
│   │   │   ├── set_priority.py     # MCP tool: set_priority (optional)
│   │   │   └── get_task.py         # MCP tool: get_task (optional)
│   │   └── server.py               # MCP server setup
│   ├── tests/                      # Pytest test suite
│   │   ├── test_tasks.py
│   │   ├── test_mcp_tools.py
│   │   └── test_chatkit.py
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── pyproject.toml              # UV project config
│   └── .env                        # Backend environment variables
│
├── specs/                          # Specification files
│   └── 004-ai-chatbot/
│       ├── overview.md
│       ├── mcp-tools.md
│       └── agent-behavior.md
│
├── docker-compose.yml              # Multi-service setup
└── CLAUDE.md                       # This file
```

## Database Models (SQLModel)

### Task Model
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # JWT user_id
    title: str
    description: str | None = None
    completed: bool = False
    priority: str = "medium"  # low, medium, high
    created_at: datetime
    updated_at: datetime
```

### Conversation Model
```python
class Conversation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime
    updated_at: datetime
```

### Message Model
```python
class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime
    expires_at: datetime  # Auto-cleanup after 2 days
```

## MCP Tools Specification

The MCP server exposes 7 tools for the AI agent to manage tasks:

### 1. add_task
**Purpose:** Create a new task  
**Parameters:**
- `user_id` (string, required) - JWT user_id
- `title` (string, required) - Task title
- `description` (string, optional) - Task details
- `priority` (string, optional) - "low" | "medium" | "high"

**Returns:**
```json
{
  "task_id": 5,
  "status": "created",
  "title": "Buy groceries"
}
```

### 2. list_tasks
**Purpose:** Retrieve user's tasks  
**Parameters:**
- `user_id` (string, required)
- `status` (string, optional) - "all" | "pending" | "completed"

**Returns:**
```json
[
  {"id": 1, "title": "Buy groceries", "completed": false, "priority": "medium"},
  {"id": 2, "title": "Call mom", "completed": true, "priority": "high"}
]
```

### 3. complete_task
**Purpose:** Mark task as complete  
**Parameters:**
- `user_id` (string, required)
- `task_id` (integer, required)

**Returns:**
```json
{
  "task_id": 3,
  "status": "completed",
  "title": "Call mom"
}
```

### 4. delete_task
**Purpose:** Remove a task  
**Parameters:**
- `user_id` (string, required)
- `task_id` (integer, required)

**Returns:**
```json
{
  "task_id": 2,
  "status": "deleted",
  "title": "Old task"
}
```

### 5. update_task
**Purpose:** Modify task title or description  
**Parameters:**
- `user_id` (string, required)
- `task_id` (integer, required)
- `title` (string, optional)
- `description` (string, optional)

**Returns:**
```json
{
  "task_id": 1,
  "status": "updated",
  "title": "Buy groceries and fruits"
}
```

### 6. set_priority (Optional Enhancement)
**Purpose:** Change task priority  
**Parameters:**
- `user_id` (string, required)
- `task_id` (integer, required)
- `priority` (string, required) - "low" | "medium" | "high"

### 7. get_task (Optional Enhancement)
**Purpose:** Get details of a specific task  
**Parameters:**
- `user_id` (string, required)
- `task_id` (integer, required)

## AI Agent Behavior Specification

### Natural Language Understanding
| User Input | Agent Action | MCP Tool |
|------------|-------------|----------|
| "Add a task to buy groceries" | Create task with title | `add_task` |
| "Remind me to call mom tomorrow" | Create task with description | `add_task` |
| "Show me all my tasks" | List all tasks | `list_tasks(status="all")` |
| "What's pending?" | List incomplete tasks | `list_tasks(status="pending")` |
| "Mark task 3 as done" | Complete specific task | `complete_task` |
| "I finished the groceries task" | Search + complete task | `list_tasks` → `complete_task` |
| "Delete the meeting task" | Search + delete task | `list_tasks` → `delete_task` |
| "Change task 1 to 'Call mom tonight'" | Update task title | `update_task` |
| "What have I completed?" | List completed tasks | `list_tasks(status="completed")` |
| "Make the bill payment urgent" | Search + set priority | `list_tasks` → `set_priority(priority="high")` |

### Conversational Personality
- **Greeting:** "Hi! I'm your task assistant. Need help managing your todos?"
- **Confirmation:** "Got it! I've added 'Buy groceries' to your tasks."
- **Error Handling:** "Hmm, I couldn't find that task. Can you check the task ID?"
- **Gratitude:** "You're welcome! Anything else I can help with?"
- **Off-topic:** "I'm focused on helping with tasks. What would you like to manage?"

### Priority Detection (Smart Feature)
Agent automatically detects priority from language:
- **High:** "urgent", "ASAP", "important", "critical"
- **Medium:** Default for most tasks
- **Low:** "someday", "maybe", "when free"

Example: "Urgent: Fix production bug" → Priority set to "high"

## API Endpoints

### ChatKit Endpoint (Primary Interface)
```
POST /api/chatkit
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "conversation_id": 123,  // Optional (creates new if not provided)
  "message": "Add a task to buy milk"
}

Response (SSE Stream):
data: {"type": "text", "content": "Got it! I've added..."}
data: {"type": "tool_call", "tool": "add_task", "result": {...}}
data: {"type": "done"}
```

### REST Endpoints (Legacy/Direct Access)
```
GET    /api/tasks          # List user's tasks
POST   /api/tasks          # Create task (no AI)
GET    /api/tasks/{id}     # Get task details
PUT    /api/tasks/{id}     # Update task (no AI)
DELETE /api/tasks/{id}     # Delete task (no AI)
POST   /api/tasks/{id}/complete  # Mark complete
```

## Authentication Flow

### Frontend → Backend Handshake
1. User logs in via Better Auth (frontend)
2. Better Auth stores session in database
3. Frontend sends JWT in `Authorization: Bearer <token>` header
4. Backend verifies JWT using shared secret (`BETTER_AUTH_SECRET`)
5. Backend extracts `user_id` from JWT payload
6. All database queries filter by `user_id`

### Critical Security Rule
**NEVER trust user_id from request body or query params!**  
Always extract `user_id` from verified JWT token.

```python
# ✅ CORRECT
def get_current_user(authorization: str = Header(...)):
    token = authorization.split("Bearer ")[1]
    payload = jwt.decode(token, SECRET_KEY)
    return payload["userId"]  # or payload["sub"]

# ❌ WRONG
def create_task(user_id: str, task: TaskCreate):
    # user_id can be forged by attacker!
```

## Environment Variables

### Frontend (.env.local)
```bash
# Database (Better Auth tables: user, session, account)
DATABASE_URL=postgresql://user:pass@host/database

# Better Auth Configuration
BETTER_AUTH_SECRET=your-256-bit-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHATKIT_URL=http://localhost:8000/api/chatkit

# OpenAI ChatKit (if using hosted version)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key  # Only needed for production
```

### Backend (.env)
```bash
# Database (SQLModel tables: tasks, conversations, messages)
DATABASE_URL=postgresql://user:pass@host/database

# Better Auth Secret (MUST match frontend!)
BETTER_AUTH_SECRET=your-256-bit-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# LLM Provider Configuration
LLM_PROVIDER=openai  # Options: openai, gemini, groq, openrouter
OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=...
# GROQ_API_KEY=...
# OPENROUTER_API_KEY=...

# Message Retention (days)
MESSAGE_RETENTION_DAYS=2
```

## Development Commands

### Initial Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd phase-3-ai-chatbot

# 2. Frontend setup
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values

# 3. Backend setup
cd ../backend
uv sync  # Installs Python dependencies
cp .env.example .env
# Edit .env with your values

# 4. Database setup
cd ../frontend
npx drizzle-kit push  # Push Better Auth schema

cd ../backend
uv run alembic upgrade head  # Push Tasks + Chat schema
```

### Daily Development
```bash
# Terminal 1: Start Backend
cd backend
uv run uvicorn src.main:app --reload --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev  # Runs on port 3000

# Terminal 3: Watch Logs (optional)
cd backend
tail -f logs/app.log
```

### Database Migrations
```bash
# Create new migration
cd backend
uv run alembic revision --autogenerate -m "Add priority field to tasks"

# Apply migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1
```

### Testing
```bash
# Backend tests
cd backend
uv run pytest                    # Run all tests
uv run pytest -v                 # Verbose output
uv run pytest tests/test_mcp_tools.py  # Specific file
uv run pytest -k "test_add_task" # Specific test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
uv run ruff check src/           # Check for issues
uv run ruff check --fix src/     # Auto-fix issues
uv run mypy src/                 # Type checking

# Frontend linting
cd frontend
npm run lint
npm run type-check
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Development Workflow (Claude Code)

### Phase III Implementation Steps
1. **Read Spec:** Review `specs/004-ai-chatbot/` thoroughly
2. **Generate Plan:** Use Spec-Kit Plus to create implementation plan
3. **Break into Tasks:** Create atomic tasks via Claude Code
4. **Implement:** Let Claude Code write all code (no manual coding!)
5. **Verify:** Run tests, linting, and manual testing
6. **Document:** Update this CLAUDE.md with learnings

### Claude Code Prompts Examples
```
# 1. Setup MCP Server
"Create MCP server implementation in backend/mcp_server/ with add_task, list_tasks, complete_task, delete_task, and update_task tools. Follow spec in specs/006-ai-chatbot/mcp-tools.md"

# 2. Implement ChatKit Endpoint
"Create /api/chatkit endpoint in backend/src/api/chatkit.py that integrates OpenAI Agents SDK with MCP tools. Use stateless architecture - fetch conversation history from database."

# 3. Add ChatKit UI
"Integrate OpenAI ChatKit widget in frontend with floating button. Show on all authenticated pages. Connect to NEXT_PUBLIC_CHATKIT_URL."

# 4. Add Priority Detection
"Enhance MCP add_task tool to detect priority from user input. Keywords: urgent/ASAP/critical → high, someday/maybe → low, default → medium"

# 5. Implement Message Cleanup
"Create FastAPI background task to delete messages older than 2 days. Run daily at midnight."
```

## Key Architecture Decisions

### 1. Stateless Backend
**Why:** Horizontal scalability, resilience to restarts  
**How:** All conversation state stored in PostgreSQL  
**Trade-off:** Slightly higher latency per request (database fetch)

### 2. MCP Tools vs Direct DB Access
**Why:** Standardized interface for AI, easier testing  
**How:** Agent calls MCP tools → Tools call database  
**Trade-off:** Extra abstraction layer

### 3. OpenAI ChatKit vs Custom UI
**Why:** Faster development, better UX out-of-box  
**How:** Pre-built widget with streaming support  
**Trade-off:** Less customization flexibility

### 4. Multi-Provider LLM Support
**Why:** Flexibility, cost optimization  
**How:** Abstract LLM client in `config.py`  
**Trade-off:** Need to test with each provider

### 5. 2-Day Message Retention
**Why:** Privacy compliance, cost control  
**How:** Background task + `expires_at` field  
**Trade-off:** Users lose old conversation history

## Troubleshooting Guide

### Problem: "JWT token invalid"
**Solution:**
- Verify `BETTER_AUTH_SECRET` matches in both `.env` files
- Check token expiration
- Ensure JWT payload has `userId` or `sub` field

### Problem: "MCP tool not found"
**Solution:**
- Check tool registration in `backend/mcp_server/server.py`
- Verify tool name matches exactly (case-sensitive)
- Restart backend after adding new tools

### Problem: ChatKit widget not loading
**Solution:**
- Check `NEXT_PUBLIC_CHATKIT_URL` is correct
- Verify backend is running on correct port
- Check browser console for CORS errors
- For production: Ensure domain is whitelisted in OpenAI dashboard

### Problem: Tasks not showing in chat
**Solution:**
- Verify JWT token is being sent in Authorization header
- Check backend logs for database errors
- Ensure `user_id` extraction is working correctly

### Problem: "Database connection failed"
**Solution:**
- Check `DATABASE_URL` format is correct
- Verify Neon database is running
- Run `alembic upgrade head` to create tables
- Check firewall/network settings

## Testing Strategy

### Backend Tests (Pytest)
```python
# Test MCP tool
def test_add_task_tool():
    result = add_task(user_id="test_user", title="Test Task")
    assert result["status"] == "created"
    assert "task_id" in result

# Test JWT validation
def test_jwt_validation():
    token = create_test_token(user_id="test_user")
    user_id = verify_jwt(token)
    assert user_id == "test_user"

# Test conversation persistence
def test_conversation_persistence():
    conv_id = create_conversation(user_id="test_user")
    add_message(conv_id, role="user", content="Hello")
    messages = get_conversation_history(conv_id)
    assert len(messages) == 1
```

### Frontend Tests (Jest/React Testing Library)
```typescript
// Test ChatKit integration
test('ChatKit widget renders', () => {
  render(<ChatWidget />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Test auth context
test('User is authenticated', async () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isAuthenticated).toBe(true);
});
```

### Manual Testing Checklist
- [ ] User can sign up and log in
- [ ] ChatKit widget appears on dashboard
- [ ] Natural language task creation works
- [ ] Task listing shows correct data
- [ ] Task completion works
- [ ] Task deletion works
- [ ] Conversation persists after page reload
- [ ] Messages are deleted after 2 days
- [ ] Different users see only their own tasks
- [ ] Error messages are user-friendly

## Performance Considerations

### Database Optimization
- Index on `user_id` fields (tasks, conversations, messages)
- Index on `conversation_id` in messages table
- Index on `expires_at` for cleanup query

### Caching Strategy (Future Enhancement)
- Cache conversation history in Redis (5 min TTL)
- Cache user's active tasks (invalidate on mutation)

### Rate Limiting (Future Enhancement)
- 10 messages per minute per user
- 100 API calls per hour per user

## Security Checklist
- [x] JWT signature verification on every request
- [x] User data isolation (filter by `user_id`)
- [x] SQL injection prevention (SQLModel parameterized queries)
- [x] CORS configuration (only allowed origins)
- [x] Environment variables (secrets not in code)
- [x] HTTPS in production (handled by Vercel/Railway)
- [ ] Rate limiting (TODO)
- [ ] Input validation (Pydantic schemas)

## Deployment Guide

### Frontend (Vercel)
```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel dashboard
# 3. Set environment variables
# 4. Deploy

# 5. Add domain to OpenAI allowlist
# Platform: https://platform.openai.com/settings/organization/security/domain-allowlist
# Add: https://your-app.vercel.app
```

### Backend (Railway/Render)
```bash
# 1. Create new project in Railway
# 2. Connect GitHub repo
# 3. Set environment variables
# 4. Deploy

# Note: Ensure DATABASE_URL points to production database
```

### Database (Neon)
```bash
# 1. Create project in Neon dashboard
# 2. Copy connection string
# 3. Update DATABASE_URL in both .env files
# 4. Run migrations:
#    - Frontend: npx drizzle-kit push
#    - Backend: uv run alembic upgrade head
```

## Recent Changes (Phase III)
- ✅ Integrated OpenAI Agents SDK for AI orchestration
- ✅ Built MCP server with 5 core tools (add, list, complete, delete, update)
- ✅ Implemented ChatKit protocol endpoint (`/api/chatkit`)
- ✅ Added conversation persistence with 2-day retention
- ✅ Created global floating chat button on all authenticated pages
- ✅ Implemented priority detection from natural language
- ✅ Added stateless architecture with database-backed sessions
- ✅ Multi-provider LLM support (OpenAI, Gemini, Groq, OpenRouter)

## Next Steps (Future Enhancements)
- [ ] Add file attachment support in chat
- [ ] Implement recurring tasks ("every Monday")
- [ ] Add task reminders/notifications
- [ ] Create task templates ("grocery shopping template")
- [ ] Add task sharing between users
- [ ] Implement voice input in ChatKit
- [ ] Add analytics dashboard (task completion rate, etc.)
- [ ] Support for sub-tasks (task hierarchy)

## Support & Resources
- **Specification:** `specs/004-ai-chatbot/`
- **OpenAI Agents SDK:** https://github.com/openai/openai-agents-sdk
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Better Auth Docs:** https://better-auth.com/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **SQLModel Docs:** https://sqlmodel.tiangolo.com/

---


## Getting Help

- **Backend Questions**: See `@backend/CLAUDE.md`
- **Frontend Questions**: See `@frontend/CLAUDE.md`
- **Architecture Questions**: See `@specs/architecture.md`
- **API Questions**: See `@specs/api/rest-endpoints.md`
- **Database Questions**: See `@specs/database/schema.md`

## Constitution

All development MUST follow the principles defined in `.specify/memory/constitution.md`. This includes:
- Phase II Mandatory Requirements
- User isolation and security
- Type safety and testing
- MCP server usage
- Spec-driven development workflow


**Remember:** This is a learning project. Document your iterations, prompts, and learnings as you work with Claude Code. The goal is to understand the Agentic Dev Stack workflow!