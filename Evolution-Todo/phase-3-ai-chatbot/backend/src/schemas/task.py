from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.task import TaskRead, TaskCreate, TaskUpdate

class TaskResponse(TaskRead):
    """Response schema for task data"""
    pass

class TaskRequest(TaskCreate):
    """Request schema for task creation"""
    pass

class TaskUpdateRequest(TaskUpdate):
    """Request schema for task updates"""
    pass

class TaskCompletionRequest(BaseModel):
    """Request schema for task completion"""
    completed: bool