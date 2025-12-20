from typing import List, Optional
from src.todo.models import Task

class InMemoryStorage:
    _instance: Optional["InMemoryStorage"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InMemoryStorage, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self._tasks: List[Task] = []
        self._next_id = 1

    def get_all(self) -> List[Task]:
        return list(self._tasks)

    def get_by_id(self, task_id: int) -> Optional[Task]:
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def add(self, task: Task) -> Task:
        if task.id == 0:  # Assign new ID if not set
            task.id = self._next_id
            self._next_id += 1
        self._tasks.append(task)
        return task

    def update(self, updated_task: Task) -> Optional[Task]:
        for i, task in enumerate(self._tasks):
            if task.id == updated_task.id:
                self._tasks[i] = updated_task
                return updated_task
        return None

    def delete(self, task_id: int) -> bool:
        initial_length = len(self._tasks)
        self._tasks = [task for task in self._tasks if task.id != task_id]
        return len(self._tasks) < initial_length

    def reset(self):
        """Resets the storage for testing purposes."""
        self._tasks = []
        self._next_id = 1
