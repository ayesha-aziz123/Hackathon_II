from sqlmodel import Session, select
from datetime import datetime, timezone
from typing import Optional, List
from ..models.task import Task, TaskCreate, TaskUpdate
from fastapi import HTTPException, status


def validate_task_data(task_data: TaskCreate):
    """Validate task data before creation or update"""
    if not task_data.title or len(task_data.title.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task title is required"
        )

    if len(task_data.title) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task title must be 255 characters or less"
        )

    if task_data.due_date:
        # Make current time timezone-aware
        now_utc = datetime.now(timezone.utc)

        # Ensure due_date is timezone-aware
        if task_data.due_date.tzinfo is None:
            # If naive, assume UTC
            due_date_aware = task_data.due_date.replace(tzinfo=timezone.utc)
        else:
            due_date_aware = task_data.due_date

        if due_date_aware < now_utc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Due date must be in the future"
            )

    if task_data.notification_time_before is not None and task_data.notification_time_before < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification time before must be non-negative"
        )


def validate_task_update_data(task_update: TaskUpdate):
    """Validate task update data"""
    if task_update.title is not None:
        if len(task_update.title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task title cannot be empty"
            )

        if len(task_update.title) > 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task title must be 255 characters or less"
            )

    # ✅ FIXED: Proper datetime validation
    if task_update.due_date:
        now_utc = datetime.now(timezone.utc)

        if task_update.due_date.tzinfo is None:
            due_date_aware = task_update.due_date.replace(tzinfo=timezone.utc)
        else:
            due_date_aware = task_update.due_date

        if due_date_aware < now_utc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Due date must be in the future"
            )

    if task_update.notification_time_before is not None and task_update.notification_time_before < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification time before must be non-negative"
        )


async def create_task(session: Session, user_id: str, task_data: dict) -> Task:
    """Create a new task asynchronously."""
    # Create TaskCreate instance from dict for validation
    task_create = TaskCreate(**task_data)
    validate_task_data(task_create)

    # Convert TaskCreate to dict and add user_id
    task_dict = task_create.model_dump()
    if task_dict.get('due_date') and task_dict['due_date'].tzinfo is None:
        task_dict['due_date'] = task_dict['due_date'].replace(tzinfo=timezone.utc)

    task_dict['user_id'] = user_id
    db_task = Task(**task_dict)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


async def get_tasks(session: Session, user_id: str, status_filter: str = "all") -> List[Task]:
    """Get tasks for a user with optional status filter."""
    statement = select(Task).where(Task.user_id == user_id)

    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    statement = statement.order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return tasks


async def get_task_by_id(session: Session, user_id: str, task_id: int) -> Optional[Task]:
    """Get a specific task by ID for the specified user."""
    task = session.get(Task, task_id)
    if task and task.user_id != user_id:
        return None  # Task exists but belongs to another user
    return task


async def update_task_status(session: Session, user_id: str, task_id: int, completed: bool) -> Optional[Task]:
    """Update a task's completion status asynchronously."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return None  # Task doesn't exist or belongs to another user

    db_task.completed = completed
    if completed:
        db_task.completed_at = datetime.now(timezone.utc)
    else:
        db_task.completed_at = None

    db_task.updated_at = datetime.now(timezone.utc)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


async def delete_task(session: Session, user_id: str, task_id: int) -> bool:
    """Delete a task asynchronously."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return False  # Task doesn't exist or belongs to another user

    session.delete(db_task)
    session.commit()
    return True


async def update_task_details(session: Session, user_id: str, task_id: int, updates: dict) -> Optional[Task]:
    """Update task details asynchronously."""
    # Create a temporary TaskUpdate for validation
    temp_update = TaskUpdate(**updates)
    validate_task_update_data(temp_update)

    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return None  # Task doesn't exist or belongs to another user

    # Apply updates
    for field, value in updates.items():
        setattr(db_task, field, value)

    db_task.updated_at = datetime.now(timezone.utc)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task