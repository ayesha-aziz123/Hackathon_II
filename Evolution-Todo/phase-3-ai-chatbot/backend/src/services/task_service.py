from sqlmodel import Session, select
from datetime import datetime
from typing import Optional
from ..models.task import Task, TaskCreate, TaskUpdate
from fastapi import HTTPException, status


# def validate_task_data(task_data: TaskCreate):
#     """Validate task data before creation or update"""
#     if not task_data.title or len(task_data.title.strip()) == 0:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Task title is required"
#         )

#     if len(task_data.title) > 255:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Task title must be 255 characters or less"
#         )

#     if task_data.due_date and task_data.due_date < datetime.utcnow():
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Due date must be in the future"
#         )



#     if task_data.notification_time_before is not None and task_data.notification_time_before < 0:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Notification time before must be non-negative"
#         )


# def validate_task_update_data(task_update: TaskUpdate):
#     """Validate task update data"""
#     if task_update.title is not None:
#         if len(task_update.title.strip()) == 0:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Task title cannot be empty"
#             )

#         if len(task_update.title) > 255:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Task title must be 255 characters or less"
#             )

#     if task_update.due_date and task_update.due_date < datetime.utcnow():
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Due date must be in the future"
#         )


#     if task_update.notification_time_before is not None and task_update.notification_time_before < 0:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Notification time before must be non-negative"
#         )

# # def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
# #     validate_task_data(task_data)
# #     db_task = Task(**task_data.dict(), user_id=user_id)  # user_id manually set
# #     session.add(db_task)
# #     session.commit()
# #     session.refresh(db_task)
# #     return db_task

# def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
#     validate_task_data(task_data)
    
#     # Convert TaskCreate to dict and add user_id
#     task_dict = task_data.model_dump(exclude_unset=True)
#     task_dict['user_id'] = user_id
    
#     # Create Task instance
#     db_task = Task(**task_dict)
    
#     session.add(db_task)
#     session.commit()
#     session.refresh(db_task)
#     return db_task

from sqlmodel import Session, select
from datetime import datetime, timezone 
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

def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
    validate_task_data(task_data)
    
    # ✅ Ensure due_date is stored as timezone-aware
    task_dict = task_data.model_dump()
    if task_dict.get('due_date') and task_dict['due_date'].tzinfo is None:
        task_dict['due_date'] = task_dict['due_date'].replace(tzinfo=timezone.utc)
    
    task_dict['user_id'] = user_id
    db_task = Task(**task_dict)
    
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

    update_dict = task_update.model_dump(exclude_unset=True)
    
    # ✅ Ensure due_date is timezone-aware
    if 'due_date' in update_dict and update_dict['due_date'] and update_dict['due_date'].tzinfo is None:
        update_dict['due_date'] = update_dict['due_date'].replace(tzinfo=timezone.utc)
    
    for field, value in update_dict.items():
        setattr(db_task, field, value)

    db_task.updated_at = datetime.now(timezone.utc)
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


def search_user_tasks(session: Session, user_id: str, query: str) -> list[Task]:
    """Search tasks for a specific user by title or description"""
    from sqlalchemy import or_

    statement = select(Task).where(
        Task.user_id == user_id,
        or_(
            Task.title.ilike(f"%{query}%"),
            Task.description.ilike(f"%{query}%") if Task.description is not None else False
        )
    )
    tasks = session.exec(statement).all()
    return tasks