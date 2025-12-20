from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..models.task import Task, TaskCreate, TaskUpdate, TaskRead
from ..auth.jwt import get_current_user
from ..database.connection import get_session_dep
from ..services.task_service import (
    create_task as service_create_task,
    get_user_tasks as service_get_user_tasks,
    get_task_by_id as service_get_task_by_id,
    update_task as service_update_task,
    delete_task as service_delete_task,
    update_task_completion as service_update_task_completion
)
from fastapi import Body

router = APIRouter(tags=["tasks"])

def verify_user_access(user_id: str, current_user_id: str):
    """Verify that URL user_id matches JWT user_id"""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in URL does not match authenticated user"
        )
    
    

@router.get("/{user_id}/tasks", response_model=List[TaskRead])
def get_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Get all tasks for the specified user"""
    verify_user_access(user_id, current_user_id)

    tasks = service_get_user_tasks(session, user_id)
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: str,  # URL se aa raha
    task: TaskCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    verify_user_access(user_id, current_user_id)

    # TaskCreate model se user_id hata do ya ignore karo
    db_task = service_create_task(session, task, user_id)  # user_id URL se pass kar rahe ho
    return db_task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskRead)
def get_task(
    user_id: str,
    task_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Get a specific task for the specified user"""
    verify_user_access(user_id, current_user_id)

    task = service_get_task_by_id(session, task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
def update_task(
    user_id: str,
    task_id: str,
    task_update: TaskUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Update a specific task for the specified user"""
    verify_user_access(user_id, current_user_id)

    db_task = service_update_task(session, task_id, task_update, user_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: str,
    task_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Delete a specific task for the specified user"""
    verify_user_access(user_id, current_user_id)

    success = service_delete_task(session, task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return



@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=dict)
def update_task_completion(
    user_id: str,
    task_id: str,
    completed: bool = Body(..., embed=True),  # ← Ye add karo!
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    verify_user_access(user_id, current_user_id)

    db_task = service_update_task_completion(session, task_id, completed, user_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"completed": db_task.completed}


