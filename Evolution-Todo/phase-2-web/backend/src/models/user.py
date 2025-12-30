from sqlmodel import  SQLModel, Field
from sqlalchemy import Column, JSON
from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel

class UserPreferences(BaseModel):
    theme: str = "system"
    notifications: bool = True
    language: str = "en"
    timezone: str = "UTC"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None)

class User(UserBase, table=True):
    """
    User model representing an authenticated user with email, password hash,
    account status, personal settings, and persistent session tokens
    """
    __tablename__ = "user"  # type: ignore

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    password_hash: str
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    preferences: Optional[UserPreferences] = Field(
        default=None,
        sa_column=Column(JSON)
    )

class UserRead(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    preferences: Optional[dict]

class UserCreate(UserBase):
    password: str

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

    