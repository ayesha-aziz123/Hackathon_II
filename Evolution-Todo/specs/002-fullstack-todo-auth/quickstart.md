# Quickstart Guide: Full-Stack Multi-User Todo Web Application

## Prerequisites
- Node.js 18+ and npm
- Python 3.13+
- UV package manager
- Neon Serverless PostgreSQL account
- Git

## Setup Instructions

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd evolution-of-todo
cd phase-2-web
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install Python dependencies with UV
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi sqlmodel python-jose python-multipart python-dotenv

# Create environment file
cp ../.env.example .env
# Edit .env with your Neon PostgreSQL connection string and BETTER_AUTH_SECRET
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install Node.js dependencies
npm install

# Create environment file
cp ../.env.example .env.local
# Edit .env.local with your BETTER_AUTH_SECRET and NEXTAUTH_URL
```

### 4. Database Setup
```bash
# In frontend directory
npx drizzle-kit generate  # Generate schema based on drizzle/schema.ts
npx drizzle-kit migrate   # Apply migrations to Neon database
```

### 5. Run Applications

#### Backend (API Server)
```bash
# From backend directory
cd backend
uvicorn src.main:app --reload --port 8000
```
API will be available at http://localhost:8000

#### Frontend (Web Application)
```bash
# From frontend directory
cd frontend
npm run dev
```
Frontend will be available at http://localhost:3000

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
```

### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

## API Testing
The backend provides the following endpoints:
- GET    `/api/{user_id}/tasks` - Get all tasks for user
- POST   `/api/{user_id}/tasks` - Create a new task
- GET    `/api/{user_id}/tasks/{id}` - Get specific task
- PUT    `/api/{user_id}/tasks/{id}` - Update specific task
- DELETE `/api/{user_id}/tasks/{id}` - Delete specific task
- PATCH  `/api/{user_id}/tasks/{id}/complete` - Mark task complete/incomplete


## Authentication Flow
1. User registers/signs in via Better Auth at `/api/auth/`
2. Better Auth issues JWT token
3. Frontend stores token and attaches to all API requests
4. Backend verifies JWT using BETTER_AUTH_SECRET
5. Backend enforces user data isolation by comparing JWT user_id with URL user_id

## Development Commands

### Backend
```bash
# Run tests
pytest tests/

# Run with auto-reload
uvicorn src.main:app --reload --port 8000

# Format code
black src/
```

### Frontend
```bash
# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run linter
npm run lint
```

## Folder Structure
```
phase-2-web/
├── frontend/
│   ├── src/app/           # Next.js pages and routing
│   ├── src/components/    # Reusable React components
│   ├── src/lib/          # API client, auth utilities
│   ├── drizzle/          # Database schema and migrations
│   └── package.json
└── backend/
    ├── src/
    │   ├── models/       # SQLModel database models
    │   ├── schemas/      # Pydantic request/response schemas
    │   ├── routers/      # API route handlers
    │   └── main.py       # FastAPI application entry point
    ├── tests/            # Pytest test suite
    └── requirements.txt
```


