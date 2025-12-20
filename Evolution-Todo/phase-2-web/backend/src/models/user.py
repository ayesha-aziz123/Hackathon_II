from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

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

class UserRead(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

class UserCreate(UserBase):
    password: str

    