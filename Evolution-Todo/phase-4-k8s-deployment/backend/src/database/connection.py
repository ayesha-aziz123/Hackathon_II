from sqlmodel import create_engine, Session, SQLModel
from ..config import settings
from contextlib import contextmanager
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from typing import Generator, AsyncGenerator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from settings (config file)
DATABASE_URL = settings.database_url

# Convert postgres:// to postgresql:// if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Remove query parameters if any
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

# Create sync engine
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"sslmode": "require"}
)

# Create async engine (for AsyncSession)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"ssl": "require"}
)

def get_session_dep():
    """FastAPI dependency for database sessions"""
    with Session(engine) as session:
        yield session

def get_session():
    """
    Generator that yields a database session.

    Usage in MCP tools:
        session = next(get_session())
        try:
            # Use session here
            session.commit()
        finally:
            session.close()
    """
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

def create_db_and_tables():
    """
    Create all database tables
    """
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created successfully")

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async session dependency for FastAPI

    Yields:
        AsyncSession: Async SQLModel database session
    """
    async with AsyncSession(async_engine) as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()