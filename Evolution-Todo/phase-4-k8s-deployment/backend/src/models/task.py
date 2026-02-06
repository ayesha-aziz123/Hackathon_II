from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum
from pydantic import field_validator  # ✅ Add this import

class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: Optional[PriorityEnum] = Field(default=PriorityEnum.medium)
    tags: Optional[str] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    completed: bool = Field(default=False)
    notification_time_before: Optional[int] = Field(default=None, ge=0)
    user_id: str = Field(foreign_key="user.id", index=True)

class Task(TaskBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class TaskRead(TaskBase):
    id: str
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = PriorityEnum.medium
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    notification_time_before: Optional[int] = None
    
    # ✅ ADD THIS VALIDATOR
    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, v):
        """Convert ISO string to datetime object"""
        if v is None or v == "":
            return None
        if isinstance(v, str):
            try:
                # Parse ISO format string
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except Exception as e:
                print(f"❌ Date parsing error: {e}")
                raise ValueError(f"Invalid date format: {v}")
        return v

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    notification_time_before: Optional[int] = None
    
    # ✅ ADD THIS VALIDATOR TOO
    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, v):
        """Convert ISO string to datetime object"""
        if v is None or v == "":
            return None
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except Exception as e:
                print(f"❌ Date parsing error: {e}")
                raise ValueError(f"Invalid date format: {v}")
        return v