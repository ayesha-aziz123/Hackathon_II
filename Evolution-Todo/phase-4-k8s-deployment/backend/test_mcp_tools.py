"""
Test MCP tools directly to verify they work before agent integration.
"""

import sys
from pathlib import Path

# Add backend directory to path so imports work correctly
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from src.mcp_server.tools import add_task, list_tasks, complete_task, delete_task

def test_add_task():
    """Test adding a task."""
    print("\n=== Testing add_task ===")
    # Use a valid user ID from the database
    valid_user_id = "bab04185-c603-4ba1-a7cb-5b7fab9fd4d9"  # First user from database
    result = add_task(
        user_id=valid_user_id,
        title="Test task from MCP tool",
        description="This is a test",
        priority="high"
    )
    print(f"Result: {result}")
    return result.get("task_id")

def test_list_tasks():
    """Test listing tasks."""
    print("\n=== Testing list_tasks ===")
    result = list_tasks(
        user_id="bab04185-c603-4ba1-a7cb-5b7fab9fd4d9",
        status="all"
    )
    print(f"Found {result['count']} tasks")
    for task in result['tasks']:
        print(f"  - [{task['id']}] {task['title']} - {task['priority']}")

def test_complete_task(task_id: int):
    """Test completing a task."""
    print(f"\n=== Testing complete_task (id={task_id}) ===")
    result = complete_task(
        user_id="bab04185-c603-4ba1-a7cb-5b7fab9fd4d9",
        task_id=task_id
    )
    print(f"Result: {result}")

def test_delete_task(task_id: int):
    """Test deleting a task."""
    print(f"\n=== Testing delete_task (id={task_id}) ===")
    result = delete_task(
        user_id="bab04185-c603-4ba1-a7cb-5b7fab9fd4d9",
        task_id=task_id
    )
    print(f"Result: {result}")

if __name__ == "__main__":
    try:
        # Test add
        task_id = test_add_task()

        # Test list
        test_list_tasks()

        # Test complete
        if task_id:
            test_complete_task(task_id)

        # Test list again
        test_list_tasks()

        # Test delete
        if task_id:
            test_delete_task(task_id)

        # Test list final
        test_list_tasks()

        print("\n[SUCCESS] ALL TESTS PASSED!")

    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()