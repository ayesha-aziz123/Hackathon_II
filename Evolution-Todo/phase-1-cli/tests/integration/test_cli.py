import pytest
import subprocess
import sys
import os

# Helper function to run the CLI command and capture output
def run_cli_command(command_args: list) -> subprocess.CompletedProcess:
    # Ensure the main.py is found in src/todo/
    script_path = os.path.join(os.path.dirname(__file__), '../../src/todo/main.py')
    
    # Construct the full command
    full_command = [sys.executable, script_path] + command_args
    
    # Run the command
    result = subprocess.run(
        full_command,
        capture_output=True,
        text=True,
        check=False  # Do not raise an exception for non-zero exit codes
    )
    return result

class TestCliIntegration:

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        """Resets the in-memory storage before each test."""
        # This is a bit of a hack for in-memory storage across subprocesses.
        # Ideally, we'd pass a flag or have a test-specific entry point
        # to ensure storage is clean. For now, rely on `add` and `list`
        # commands to implicitly manage state for simple tests.
        # A more robust solution might involve passing an environment variable
        # to main.py that triggers a storage reset.
        
        # For current tests, directly calling list and expecting empty or
        # using the add command will implicitly test isolation for basic cases.
        pass

    def test_add_command_success(self):
        # Add a task
        result_add = run_cli_command(["add", "Buy milk", "Remember lactose-free"])
        assert "Task added successfully" in result_add.stdout
        assert result_add.returncode == 0

        # List tasks to verify
        result_list = run_cli_command(["list"])
        assert "1 | Buy milk" in result_list.stdout
        assert "Remember lactose-free" in result_list.stdout
        assert "False" in result_list.stdout # Check completed status
        assert result_list.returncode == 0
    
    def test_add_command_only_title(self):
        result_add = run_cli_command(["add", "Walk the dog"])
        assert "Task added successfully" in result_add.stdout
        assert result_add.returncode == 0

        result_list = run_cli_command(["list"])
        assert "1 | Walk the dog" in result_list.stdout
        assert result_list.returncode == 0

    def test_add_command_empty_title_failure(self):
        result = run_cli_command(["add"])
        assert "Task title cannot be empty" in result.stderr or "Error: The 'add' command requires a title." in result.stderr
        assert result.returncode != 0
        
        # Verify no task was added
        result_list = run_cli_command(["list"])
        assert "No tasks found." in result_list.stdout or len(result_list.stdout.strip().splitlines()) <= 1 # Header line

    def test_list_command_no_tasks(self):
        # Ensure storage is empty
        run_cli_command(["reset"])
        
        result = run_cli_command(["list"])
        assert "No tasks found." in result.stdout
        assert result.returncode == 0

    def test_list_command_with_tasks(self):
        # Ensure storage is empty
        run_cli_command(["reset"])

        run_cli_command(["add", "Task Alpha"])
        run_cli_command(["add", "Task Beta", "Description Beta"])
        
        result = run_cli_command(["list"])
        assert "1 | Task Alpha" in result.stdout
        assert "2 | Task Beta" in result.stdout
        assert "Description Beta" in result.stdout
        assert "False" in result.stdout # Check completed status
        assert result.returncode == 0
    
    def test_reset_command(self):
        # Add a task
        run_cli_command(["add", "Task to be reset"])
        
        # Verify it's there
        result_list_before = run_cli_command(["list"])
        assert "Task to be reset" in result_list_before.stdout

        # Reset storage
        result_reset = run_cli_command(["reset"])
        assert "In-memory storage reset." in result_reset.stdout
        assert result_reset.returncode == 0

        # Verify storage is empty
        result_list_after = run_cli_command(["list"])
        assert "No tasks found." in result_list_after.stdout

    def test_complete_command_success(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Task to complete"])
        
        result_complete = run_cli_command(["complete", "1"])
        assert "Task 1 marked as complete." in result_complete.stdout
        assert result_complete.returncode == 0

        result_list = run_cli_command(["list"])
        assert "True" in result_list.stdout

    def test_complete_command_non_existent_id(self):
        run_cli_command(["reset"])
        result = run_cli_command(["complete", "999"])
        assert "Error: Task with ID 999 not found." in result.stderr
        assert result.returncode != 0

    def test_complete_command_already_complete(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Already completed task"])
        run_cli_command(["complete", "1"]) # Mark it complete first
        
        result = run_cli_command(["complete", "1"])
        assert "Task 1 is already complete." in result.stderr or "Task 1 marked as complete." in result.stdout
        assert result.returncode == 0 # Or 1 depending on desired behavior for idempotency

    def test_incomplete_command_success(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Task to incomplete"])
        run_cli_command(["complete", "1"]) # Make it complete first

        result_incomplete = run_cli_command(["incomplete", "1"])
        assert "Task 1 marked as incomplete." in result_incomplete.stdout
        assert result_incomplete.returncode == 0

        result_list = run_cli_command(["list"])
        assert "False" in result_list.stdout

    def test_incomplete_command_non_existent_id(self):
        run_cli_command(["reset"])
        result = run_cli_command(["incomplete", "999"])
        assert "Error: Task with ID 999 not found." in result.stderr
        assert result.returncode != 0

    def test_incomplete_command_already_incomplete(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Already incomplete task"])
        
        result = run_cli_command(["incomplete", "1"])
        assert "Task 1 is already incomplete." in result.stderr or "Task 1 marked as incomplete." in result.stdout
        assert result.returncode == 0 # Or 1 depending on desired behavior for idempotency

    def test_update_command_update_title(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Old Title", "Description"])

        result_update = run_cli_command(["update", "1", "--title", "New Title"])
        assert "Task 1 updated successfully." in result_update.stdout
        assert result_update.returncode == 0

        result_list = run_cli_command(["list"])
        assert "New Title" in result_list.stdout
        assert "Description" in result_list.stdout

    def test_update_command_update_description(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Title", "Old Description"])

        result_update = run_cli_command(["update", "1", "--description", "New Description"])
        assert "Task 1 updated successfully." in result_update.stdout
        assert result_update.returncode == 0

        result_list = run_cli_command(["list"])
        assert "Title" in result_list.stdout
        assert "New Description" in result_list.stdout

    def test_update_command_update_both(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Old Title", "Old Description"])

        result_update = run_cli_command(["update", "1", "--title", "New Title", "--description", "New Description"])
        assert "Task 1 updated successfully." in result_update.stdout
        assert result_update.returncode == 0

        result_list = run_cli_command(["list"])
        assert "New Title" in result_list.stdout
        assert "New Description" in result_list.stdout

    def test_update_command_non_existent_id(self):
        run_cli_command(["reset"])
        result = run_cli_command(["update", "999", "--title", "Non Existent"])
        assert "Error: Task with ID 999 not found." in result.stderr
        assert result.returncode != 0

    def test_update_command_no_arguments(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Test Task"])
        result = run_cli_command(["update", "1"]) # No --title or --description
        assert "No update arguments provided." in result.stderr
        assert result.returncode != 0
    
    def test_update_command_empty_title_failure(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Test Task"])
        result = run_cli_command(["update", "1", "--title", ""])
        assert "Task title cannot be empty." in result.stderr
        assert result.returncode != 0

    def test_delete_command_success(self):
        run_cli_command(["reset"])
        run_cli_command(["add", "Task to delete"])
        
        result_delete = run_cli_command(["delete", "1"])
        assert "Task 1 deleted successfully." in result_delete.stdout
        assert result_delete.returncode == 0

        result_list = run_cli_command(["list"])
        assert "No tasks found." in result_list.stdout

    def test_delete_command_non_existent_id(self):
        run_cli_command(["reset"])
        result = run_cli_command(["delete", "999"])
        assert "Error: Task with ID 999 not found." in result.stderr
        assert result.returncode != 0

    def test_help_command(self):
        result = run_cli_command(["help"])
        assert "usage: main.py" in result.stdout
        assert "Add a new todo task" in result.stdout
        assert "List all todo tasks" in result.stdout
        assert "Update an existing todo task" in result.stdout
        assert "Mark a todo task as complete" in result.stdout
        assert "Mark a todo task as incomplete" in result.stdout
        assert "Delete a todo task" in result.stdout
        assert "Show this help message" in result.stdout
        assert "Exit the application" in result.stdout
        assert "Resets the in-memory storage" in result.stdout
        assert result.returncode == 0

    def test_no_arguments_shows_help(self):
        result = run_cli_command([])
        assert "usage: main.py" in result.stderr # Help is printed to stderr
        assert "Add a new todo task" in result.stderr
        assert result.returncode != 0 # Should exit with non-zero due to printing to stderr

    def test_unrecognized_command(self):
        result = run_cli_command(["foobar"])
        assert "Error: Command 'foobar' not implemented yet." in result.stderr
        assert result.returncode != 0






