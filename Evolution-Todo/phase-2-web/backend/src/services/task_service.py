from sqlmodel import Session, select
from datetime import datetime
from typing import Optional
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

    if task_data.due_date and task_data.due_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date must be in the future"
        )

    # if task_data.recurrence_end_date and task_data.due_date and task_data.recurrence_end_date < task_data.due_date:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Recurrence end date must be after due date"
    #     )

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

    if task_update.due_date and task_update.due_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date must be in the future"
        )

    # if task_update.recurrence_end_date and task_update.due_date and task_update.recurrence_end_date < task_update.due_date:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Recurrence end date must be after due date"
    #     )

    if task_update.notification_time_before is not None and task_update.notification_time_before < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification time before must be non-negative"
        )

def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
    validate_task_data(task_data)
    db_task = Task(**task_data.dict(), user_id=user_id)  # user_id manually set
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_task_by_id(session: Session, task_id: str, user_id: str) -> Optional[Task]:
    """Get a specific task by ID for the specified user"""
    task = session.get(Task, task_id)
    if task and task.user_id != user_id:
        return None  # Task exists but belongs to another user
    return task


def update_task(session: Session, task_id: str, task_update: TaskUpdate, user_id: str) -> Optional[Task]:
    """Update a task with validation"""
    validate_task_update_data(task_update)

    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return None  # Task doesn't exist or belongs to another user

    # Update fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)

    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def delete_task(session: Session, task_id: str, user_id: str) -> bool:
    """Delete a task"""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return False  # Task doesn't exist or belongs to another user

    session.delete(db_task)
    session.commit()
    return True


def update_task_completion(session: Session, task_id: str, completed: bool, user_id: str) -> Optional[Task]:
    """Update a task's completion status"""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        return None  # Task doesn't exist or belongs to another user

    db_task.completed = completed
    if completed:
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.completed_at = None

    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_user_tasks(session: Session, user_id: str) -> list[Task]:
    """Get all tasks for a specific user"""
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks