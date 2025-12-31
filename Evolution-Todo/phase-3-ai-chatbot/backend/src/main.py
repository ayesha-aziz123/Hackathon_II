from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from .routers import tasks
from .routers import auth
from .routers import users
from .routers import conversations  # AI Chatbot router
from .database.connection import engine
from .models.conversation_models import Conversation, Message  # AI Chatbot models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup"""
    print("Creating database tables...")
    # Create all tables including conversation and message models
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    yield
    print("Shutting down...")


app = FastAPI(
    title="Evolution-Todo AI Chatbot API",
    description="Backend API for the AI-powered Todo Chatbot with conversation persistence",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware - Updated to be more permissive for AI chat functionality
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000/dashboard/tasks",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Common port for AI chatbot frontend
        "*"  # More permissive for AI service integration - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include existing routers
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router)
app.include_router(users.router, prefix="/api")

# Include new router for AI chatbot functionality
app.include_router(conversations.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Evolution-Todo AI Chatbot Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "AI Chatbot Backend"}


@app.get("/api/test-auth")
def test_auth():
    """Test endpoint to verify authentication is working"""
    return {"message": "Authentication endpoint is working"}