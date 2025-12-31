from sqlmodel import create_engine, Session
from ..config import settings

DATABASE_URL = settings.database_url

engine = create_engine(DATABASE_URL, echo=True)

def get_session_dep():
    """FastAPI dependency for database sessions"""
    with Session(engine) as session:
        yield session


