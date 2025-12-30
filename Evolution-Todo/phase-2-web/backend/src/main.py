from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .routers import tasks
from .routers import auth
from .routers import users
from .database.connection import engine

app = FastAPI(
    title="Todo API",
    description="FastAPI backend for Evolution of Todo Phase 2",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000/dashboard/tasks",
        "http://localhost:3000",
        "https://fullstack-todo-app-three-six.vercel.app/",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables on startup
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


# Include routers
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router)
app.include_router(users.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}
