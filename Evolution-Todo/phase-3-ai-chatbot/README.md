# Evolution-Todo: Phase III - AI-Powered Todo Chatbot

Welcome to Phase III of the Evolution-Todo project! This phase introduces an AI-powered chatbot that allows users to manage their tasks through natural language conversations.

## 🚀 Features

- **Conversational Interface**: Manage tasks through natural language commands
- **Natural Language Processing**: Add, list, complete, delete, and update tasks using everyday language
- **Conversation Persistence**: All conversations are stored in the database with stateless server architecture
- **Streaming Responses**: Real-time chat responses using Server-Sent Events (SSE)
- **Conversation Context**: The chatbot maintains context across multiple messages
- **Error Handling**: Helpful error messages when commands can't be understood
- **Action Confirmations**: Friendly confirmations for all successful task operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS, OpenAI ChatKit
- **Backend**: FastAPI, Python 3.13+, SQLModel, Neon PostgreSQL
- **AI Framework**: OpenAI Agents SDK
- **MCP Server**: Official MCP SDK for task operation tools
- **Authentication**: Better Auth JWT tokens (same as Phase II)

## 📁 Project Structure

```
phase-3-ai-chatbot/
├── frontend/                   # Next.js application with ChatKit UI
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Reusable UI components
│   │   └── lib/               # Utilities (API client, auth)
│   └── package.json
├── backend/                    # FastAPI backend with AI integration
│   ├── src/
│   │   ├── agents/            # AI agent implementations
│   │   ├── mcp/               # MCP server with task operation tools
│   │   ├── models/            # SQLModel models (tasks, conversations, messages)
│   │   ├── routers/           # API route handlers
│   │   └── main.py            # Application entry point
│   └── requirements.txt
├── specs/                      # Phase III specifications
│   └── 004-ai-chatbot/
└── README.md
```

## 🏗️ Architecture

### Backend Architecture
- **Stateless Design**: All conversation state persisted to database
- **JWT Authentication**: Verifying tokens with shared Better Auth secret
- **User Isolation**: All queries filtered by authenticated user ID from JWT
- **MCP Tools**: Standardized interface for AI agent to perform task operations

### Frontend Architecture
- **OpenAI ChatKit**: Pre-built conversational UI components
- **Server-Sent Events**: Real-time streaming responses
- **Type Safety**: Full TypeScript support
- **Authentication**: Better Auth integration for session management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.13+ (for backend)
- Neon PostgreSQL database
- OpenAI API key

### Frontend Setup
```bash
cd phase-3-ai-chatbot/frontend
npm install
cp .env.example .env.local
# Update environment variables in .env.local
npm run dev
```

### Backend Setup
```bash
cd phase-3-ai-chatbot/backend
pip install -r requirements.txt
cp .env.example .env
# Update environment variables in .env
uvicorn src.main:app --reload --port 8001
```

### Environment Variables

#### Frontend (.env.local)
```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_CHAT_URL=http://localhost:8001/api/chat
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
```

#### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_neon_postgres_url
BETTER_AUTH_SECRET=your_better_auth_secret
BACKEND_API_URL=http://localhost:8000
```

## 🤖 AI Chatbot Capabilities

The AI assistant can understand and execute various task management commands:

- "Add a task to buy groceries" → Creates a new task
- "Show me my tasks" → Lists all tasks
- "Mark task 3 as completed" → Updates task status
- "Delete the meeting task" → Removes a specific task
- "Update task 1 to 'Call mom tomorrow'" → Modifies an existing task

## 📊 API Endpoints

### Task Operations (via MCP tools)
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks` - List tasks
- `GET /api/{user_id}/tasks/{id}` - Get specific task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Complete task

### Conversation Operations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/{id}` - Get specific conversation
- `POST /api/conversations/{id}/messages` - Add message to conversation
- `GET /api/conversations/{id}/messages` - Get conversation messages

## 🧪 Testing

### Backend Tests
```bash
cd phase-3-ai-chatbot/backend
pytest tests/
```

### Frontend Tests
```bash
cd phase-3-ai-chatbot/frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy via Vercel CLI or dashboard
```

### Backend (Railway/Render)
```bash
# Build and deploy via platform dashboard
# Ensure environment variables are configured
```

## 📄 License

This project is part of the Evolution-Todo Hackathon and follows the project's licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any issues, please open an issue in the repository with detailed information about the problem and steps to reproduce.

---

Made with ❤️ for the Hackathon II Evolution-Todo Project