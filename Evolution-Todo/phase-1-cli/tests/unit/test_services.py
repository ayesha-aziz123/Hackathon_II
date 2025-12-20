import pytest
from datetime import datetime, timedelta
from src.todo.models import Task
from src.todo.storage import InMemoryStorage
from src.todo.services import TodoService

# Fixture for a clean InMemoryStorage instance for each test
@pytest.fixture
def clean_storage():
    storage = InMemoryStorage()
    storage.reset()  # Ensure it's clean before each test
    return storage

# Fixture for a TodoService instance
@pytest.fixture
def todo_service(clean_storage):
    return TodoService(clean_storage)

class TestTodoService:

    def test_add_task(self, todo_service):
        task = todo_service.add_task("Test Task", "This is a test description")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "This is a test description"
        assert not task.completed
        # Check if created_at and updated_at are recent ISO formatted strings
        assert isinstance(task.created_at, str)
        assert isinstance(task.updated_at, str)
        created_dt = datetime.fromisoformat(task.created_at)
        updated_dt = datetime.fromisoformat(task.updated_at)
        assert datetime.now() - created_dt < timedelta(seconds=5)
        assert datetime.now() - updated_dt < timedelta(seconds=5)

        # Verify task is in storage
        tasks = todo_service.list_tasks()
        assert len(tasks) == 1
        assert tasks[0] == task

    def test_add_task_only_title(self, todo_service):
        task = todo_service.add_task("Another Task")
        assert task.id == 1
        assert task.title == "Another Task"
        assert task.description == ""
        assert not task.completed

    def test_add_task_empty_title_raises_error(self, todo_service):
        with pytest.raises(ValueError, match="Task title cannot be empty."):
            todo_service.add_task("")
        assert len(todo_service.list_tasks()) == 0

    def test_add_task_generates_unique_ids(self, todo_service):
        task1 = todo_service.add_task("Task 1")
        task2 = todo_service.add_task("Task 2")
        assert task1.id == 1
        assert task2.id == 2
        assert task1.id != task2.id

    def test_list_tasks_empty(self, todo_service):
        tasks = todo_service.list_tasks()
        assert len(tasks) == 0

    def test_list_tasks_with_multiple_tasks(self, todo_service):
        task1 = todo_service.add_task("Task 1")
        task2 = todo_service.add_task("Task 2")
        tasks = todo_service.list_tasks()
        assert len(tasks) == 2
        assert task1 in tasks
        assert task2 in tasks

    def test_mark_task_complete(self, todo_service):
        task = todo_service.add_task("Task to complete")
        completed_task = todo_service.mark_task_complete(task.id)
        assert completed_task is not None
        assert completed_task.completed
        assert completed_task.updated_at > task.created_at # Should be updated

        retrieved_task = todo_service.list_tasks()[0]
        assert retrieved_task.completed
        assert retrieved_task.updated_at == completed_task.updated_at

    def test_mark_task_complete_already_complete(self, todo_service):
        task = todo_service.add_task("Task already complete")
        task.completed = True
        # Manually update to simulate prior completion
        initial_updated_at = task.updated_at 
        
        completed_task = todo_service.mark_task_complete(task.id)
        assert completed_task is not None
        assert completed_task.completed
        # updated_at should not change if task was already complete and no actual change occurred
        assert completed_task.updated_at == initial_updated_at 

    def test_mark_task_complete_non_existent_id(self, todo_service):
        completed_task = todo_service.mark_task_complete(999)
        assert completed_task is None # Should return None if task not found

    def test_mark_task_incomplete(self, todo_service):
        task = todo_service.add_task("Task to incomplete")
        task.completed = True # Make it complete first
        # Manually update to simulate prior completion
        initial_updated_at = task.updated_at
        
        incomplete_task = todo_service.mark_task_incomplete(task.id)
        assert incomplete_task is not None
        assert not incomplete_task.completed
        assert incomplete_task.updated_at > initial_updated_at # Should be updated

        retrieved_task = todo_service.list_tasks()[0]
        assert not retrieved_task.completed
        assert retrieved_task.updated_at == incomplete_task.updated_at

    def test_mark_task_incomplete_already_incomplete(self, todo_service):
        task = todo_service.add_task("Task already incomplete")
        # Manually update to simulate prior state
        initial_updated_at = task.updated_at

        incomplete_task = todo_service.mark_task_incomplete(task.id)
        assert incomplete_task is not None
        assert not incomplete_task.completed
        # updated_at should not change if task was already incomplete and no actual change occurred
        assert incomplete_task.updated_at == initial_updated_at

    def test_mark_task_incomplete_non_existent_id(self, todo_service):
        incomplete_task = todo_service.mark_task_incomplete(999)
        assert incomplete_task is None # Should return None if task not found

    def test_update_task_title(self, todo_service):
        task = todo_service.add_task("Old Title", "Old Description")
        updated_task = todo_service.update_task(task.id, title="New Title")
        assert updated_task is not None
        assert updated_task.title == "New Title"
        assert updated_task.description == "Old Description" # Description should be unchanged
        assert updated_task.updated_at > task.created_at

        retrieved_task = todo_service.list_tasks()[0]
        assert retrieved_task.title == "New Title"
        assert retrieved_task.updated_at == updated_task.updated_at

    def test_update_task_description(self, todo_service):
        task = todo_service.add_task("Original Title", "Old Description")
        updated_task = todo_service.update_task(task.id, description="New Description")
        assert updated_task is not None
        assert updated_task.title == "Original Title" # Title should be unchanged
        assert updated_task.description == "New Description"
        assert updated_task.updated_at > task.created_at

    def test_update_task_both_title_and_description(self, todo_service):
        task = todo_service.add_task("Original Title", "Old Description")
        updated_task = todo_service.update_task(task.id, title="New Title", description="New Description")
        assert updated_task is not None
        assert updated_task.title == "New Title"
        assert updated_task.description == "New Description"
        assert updated_task.updated_at > task.created_at

    def test_update_task_no_change(self, todo_service):
        task = todo_service.add_task("Title", "Description")
        initial_updated_at = task.updated_at
        updated_task = todo_service.update_task(task.id, title="Title", description="Description")
        assert updated_task is not None
        assert updated_task.updated_at == initial_updated_at # updated_at should not change

    def test_update_task_empty_title_raises_error(self, todo_service):
        task = todo_service.add_task("Valid Title")
        with pytest.raises(ValueError, match="Task title cannot be empty."):
            todo_service.update_task(task.id, title="")
        
        # Verify task was not changed
        retrieved_task = todo_service.list_tasks()[0]
        assert retrieved_task.title == "Valid Title"

    def test_update_task_non_existent_id(self, todo_service):
        updated_task = todo_service.update_task(999, title="Non Existent")
        assert updated_task is None # Should return None if task not found

    def test_delete_task_success(self, todo_service):
        task1 = todo_service.add_task("Task 1")
        task2 = todo_service.add_task("Task 2")
        
        deleted = todo_service.delete_task(task1.id)
        assert deleted is True
        
        tasks = todo_service.list_tasks()
        assert len(tasks) == 1
        assert task2 in tasks
        assert task1 not in tasks

    def test_delete_task_non_existent_id(self, todo_service):
        todo_service.add_task("Existing Task")
        
        deleted = todo_service.delete_task(999)
        assert deleted is False
        
        tasks = todo_service.list_tasks()
        assert len(tasks) == 1 # Should not have changed


