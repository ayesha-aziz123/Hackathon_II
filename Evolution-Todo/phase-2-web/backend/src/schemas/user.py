from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.user import UserRead, UserCreate

class UserResponse(UserRead):
    """Response schema for user data"""
    pass

class UserRequest(UserCreate):
    """Request schema for user creation"""
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None