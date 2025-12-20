from typing import List, Optional
from datetime import datetime
from src.todo.models import Task
from src.todo.storage import InMemoryStorage

class TodoService:
    def __init__(self, storage: InMemoryStorage):
        self._storage = storage

    def add_task(self, title: str, description: str = "") -> Task:
        if not title:
            raise ValueError("Task title cannot be empty.")
        new_task = Task(id=0, title=title, description=description) # ID will be set by storage
        return self._storage.add(new_task)

    def list_tasks(self) -> List[Task]:
        return self._storage.get_all()

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]:
        task = self._storage.get_by_id(task_id)
        if not task:
            return None

        updated = False
        if title is not None and title != task.title:
            if not title:
                raise ValueError("Task title cannot be empty.")
            task.title = title
            updated = True
        if description is not None and description != task.description:
            task.description = description
            updated = True
        
        if updated:
            task.updated_at = datetime.now().isoformat()
            return self._storage.update(task)
        return task # No actual change, return original task

    def mark_task_complete(self, task_id: int) -> Optional[Task]:
        task = self._storage.get_by_id(task_id)
        if task and not task.completed:
            task.completed = True
            task.updated_at = datetime.now().isoformat()
            return self._storage.update(task)
        return task

    def mark_task_incomplete(self, task_id: int) -> Optional[Task]:
        task = self._storage.get_by_id(task_id)
        if task and task.completed:
            task.completed = False
            task.updated_at = datetime.now().isoformat()
            return self._storage.update(task)
        return task

    def delete_task(self, task_id: int) -> bool:
        return self._storage.delete(task_id)
