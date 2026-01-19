"""
Main FastAPI application for Evolution Todo Phase 3.
Includes AI-powered chatbot with MCP tool integration.
"""

# Setup logging FIRST before any other imports
from .logging_config import setup_debug_logging
setup_debug_logging()

import logging
logger = logging.getLogger(__name__)

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from src.routers import tasks
from src.routers import auth
from src.routers import users
from src.routers import chat
from src.routers import conversations
from src.database.connection import engine
from fastapi.openapi.utils import get_openapi

logger.info("Starting Evolution Todo Phase 3 Backend...")

app = FastAPI(
    title="Todo API",
    description="FastAPI backend for Evolution of Todo Phase 3 with AI Chatbot",
    swagger_ui_parameters={
        "persistAuthorization": True
    }
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Evolution Todo API",
        version="1.0.0",
        routes=app.routes,
    )

    # Add Bearer token security
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Apply to all routes
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3000/dashboard/settings",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/api",
        "http://localhost:8000",
        "http://localhost:8000/api",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000",
        *(os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS", "") else [])  # Fixed: removed wildcard when credentials are used
    ],  # Specific frontend origin (removed wildcard '*' due to credentials usage)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Create all database tables including conversations and messages"""
    logger.info("Backend startup: Initializing database tables...")

    # Import models to register them with SQLModel
    from src.models.conversation import Conversation
    from src.models.message import Message
    from src.models.task import Task
    from src.models.user import User

    # Create tables using sync engine
    SQLModel.metadata.create_all(engine)
    logger.info("✅ Database tables created successfully")
    logger.info("Backend is ready to accept requests")


# Include routers
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router)
app.include_router(users.router, prefix="/api")
app.include_router(chat.router)
app.include_router(conversations.router)
# app.include_router(simple_chat.router)


@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}
