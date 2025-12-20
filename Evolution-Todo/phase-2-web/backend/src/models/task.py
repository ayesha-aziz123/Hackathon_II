# from sqlmodel import SQLModel, Field
# from typing import Optional
# from datetime import datetime
# import uuid
# from enum import Enum

# class PriorityEnum(str, Enum):
#     high = "high"
#     medium = "medium"
#     low = "low"

# class RecurrencePatternEnum(str, Enum):
#     daily = "daily"
#     weekly = "weekly"
#     monthly = "monthly"

# class TaskBase(SQLModel):
#     title: str = Field(min_length=1, max_length=255)
#     description: Optional[str] = Field(default=None, max_length=1000)
#     priority: Optional[PriorityEnum] = Field(default=PriorityEnum.medium)
#     tags: Optional[str] = Field(default=None)  # Store as JSON string
#     due_date: Optional[datetime] = Field(default=None)
#     completed: bool = Field(default=False)
#     recurrence_pattern: Optional[RecurrencePatternEnum] = Field(default=None)
#     recurrence_end_date: Optional[datetime] = Field(default=None)
#     notification_time_before: Optional[int] = Field(default=None, ge=0)  # Minutes before due time
#     user_id: str = Field(foreign_key="user.id", index=True)

# class Task(TaskBase, table=True):
#     """
#     Task model representing a todo item with title, description, priority (high/medium/low),
#     user-defined tags, due date, completion status, recurrence pattern with self-replication,
#     custom notification timing, and creation/modification timestamps
#     """
#     id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
#     completed_at: Optional[datetime] = Field(default=None)
#     created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
#     updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

# class TaskRead(TaskBase):
#     id: str
#     completed_at: Optional[datetime]
#     created_at: datetime
#     updated_at: datetime

# class TaskCreate(SQLModel):
#     title: str = Field(min_length=1, max_length=255)
#     description: Optional[str] = None
#     priority: Optional[PriorityEnum] = PriorityEnum.medium
#     tags: Optional[str] = None
#     due_date: Optional[datetime] = None
#     recurrence_pattern: Optional[RecurrencePatternEnum] = None
#     recurrence_end_date: Optional[datetime] = None
#     notification_time_before: Optional[int] = None\

# class TaskUpdate(SQLModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     priority: Optional[PriorityEnum] = None
#     tags: Optional[str] = None
#     due_date: Optional[datetime] = None
#     completed: Optional[bool] = None
#     recurrence_pattern: Optional[RecurrencePatternEnum] = None
#     recurrence_end_date: Optional[datetime] = None
#     notification_time_before: Optional[int] = None













from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum

class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: Optional[PriorityEnum] = Field(default=PriorityEnum.medium)
    tags: Optional[str] = Field(default=None)  # Store as JSON string
    due_date: Optional[datetime] = Field(default=None)
    completed: bool = Field(default=False)
    notification_time_before: Optional[int] = Field(default=None, ge=0)  # Minutes before due time
    user_id: str = Field(foreign_key="user.id", index=True)

class Task(TaskBase, table=True):
    """
    Task model representing a todo item with title, description, priority (high/medium/low),
    user-defined tags, due date, completion status, custom notification timing, 
    and creation/modification timestamps
    """
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

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    notification_time_before: Optional[int] = None