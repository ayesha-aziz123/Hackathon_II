# from sqlmodel import create_engine, Session
# from typing import Generator
# from contextlib import contextmanager
# from ..config import settings

# # Use settings for database URL
# DATABASE_URL = settings.database_url

# # Create engine
# engine = create_engine(DATABASE_URL, echo=True)

# @contextmanager
# def get_session() -> Generator[Session, None, None]:
#     """Context manager for database sessions"""
#     with Session(engine) as session:
#         yield session

# def get_session_dep() -> Session:
#     """FastAPI dependency for database sessions"""
#     with Session(engine) as session:
#         yield session





from sqlmodel import create_engine, Session
from ..config import settings

DATABASE_URL = settings.database_url

engine = create_engine(DATABASE_URL, echo=True)

def get_session_dep():
    """FastAPI dependency for database sessions"""
    with Session(engine) as session:
        yield session


