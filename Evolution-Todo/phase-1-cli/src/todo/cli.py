from rich.console import Console
from rich.table import Table
from src.todo.services import TodoService
from src.todo.storage import InMemoryStorage
import sys

console = Console()
storage = InMemoryStorage()
service = TodoService(storage)

def display_menu():
    """Displays the interactive menu options to the user."""
    console.print("\n[bold blue]Todo CLI Menu:[/bold blue]")
    console.print("1. [green]Add Task[/green]")
    console.print("2. [blue]List Tasks[/blue]")
    console.print("3. [yellow]Update Task[/yellow]")
    console.print("4. [magenta]Mark Task Complete[/magenta]")
    console.print("5. [cyan]Mark Task Incomplete[/cyan]")
    console.print("6. [red]Delete Task[/red]")
    console.print("7. [dim]Exit[/dim]")
    console.print("8. [dim]Reset Storage (DANGEROUS)[/dim]")

def print_tasks_table(tasks):
    """Prints a table of tasks using rich."""
    if not tasks:
        console.print("[yellow]No tasks found.[/yellow]")
        return

    table = Table(
        show_header=True,
        header_style="bold green",
        title="[bold underline]Your Todo List[/bold underline]"
    )
    table.add_column("ID", style="dim", width=5)
    table.add_column("Title", style="cyan", min_width=20)
    table.add_column("Description", style="white", min_width=30)
    table.add_column("Status", style="magenta", width=12)
    table.add_column("Created At", style="blue", width=22)
    table.add_column("Updated At", style="blue", width=22)

    for task in tasks:
        status_text = "[green]✓ Complete[/green]" if task.completed else "[red]✗ Incomplete[/red]"
        table.add_row(
            str(task.id),
            task.title,
            task.description,
            status_text,
            task.created_at,
            task.updated_at
        )
    console.print(table)

def get_task_id_input(prompt_message="Enter Task ID:"):
    """Helper to get and validate task ID input."""
    while True:
        try:
            task_id_str = console.input(f"[bold]{prompt_message}[/bold] ")
            task_id = int(task_id_str)
            if task_id <= 0:
                console.print("[red]Task ID must be a positive integer.[/red]")
            else:
                return task_id
        except ValueError:
            console.print("[red]Invalid input. Please enter a number for Task ID.[/red]")

def handle_add_task():
    title = console.input("[bold green]Enter task title:[/bold green] ")
    if not title:
        console.print("[red]Task title cannot be empty. Aborting add operation.[/red]")
        return
    description = console.input("[bold green]Enter task description (optional):[/bold green] ")
    try:
        task = service.add_task(title, description)
        console.print(f"[green]Task added successfully:[/green] ID {task.id}, Title: {task.title}")
    except ValueError as e:
        console.print(f"[red]Error adding task:[/red] {e}")

def handle_list_tasks():
    tasks = service.list_tasks()
    print_tasks_table(tasks)

def handle_update_task():
    task_id = get_task_id_input("Enter ID of task to update:")
    task_to_update = service._storage.get_by_id(task_id) # Access storage directly to check existence
    if not task_to_update:
        console.print(f"[red]Error:[/red] Task with ID {task_id} not found.")
        return
    
    console.print(f"[bold yellow]Updating Task {task_id}: {task_to_update.title}[/bold yellow]")
    new_title = console.input(f"Enter new title (leave blank for '{task_to_update.title}'): ")
    new_description = console.input(f"Enter new description (leave blank for '{task_to_update.description}'): ")

    # Use None for unchanged fields to avoid updating to empty string if user just presses Enter
    title_to_send = new_title if new_title else None
    description_to_send = new_description if new_description else None

    # If both are blank, no update was requested
    if not title_to_send and not description_to_send:
        console.print("[yellow]No changes provided. Task not updated.[/yellow]")
        return

    try:
        updated_task = service.update_task(task_id, title=title_to_send, description=description_to_send)
        if updated_task:
            console.print(f"[green]Task {task_id} updated successfully.[/green]")
        else:
            console.print(f"[red]Error updating task:[/red] Task with ID {task_id} not found (should not happen here).")
    except ValueError as e:
        console.print(f"[red]Error updating task:[/red] {e}")

def handle_mark_complete():
    task_id = get_task_id_input("Enter ID of task to mark complete:")
    task = service._storage.get_by_id(task_id)
    if not task:
        console.print(f"[red]Error:[/red] Task with ID {task_id} not found.")
        return
    if task.completed:
        console.print(f"[yellow]Task {task_id} is already complete.[/yellow]")
        return

    updated_task = service.mark_task_complete(task_id)
    if updated_task:
        console.print(f"[green]Task {task_id} marked as complete.[/green]")
    else:
        console.print(f"[red]Error marking task {task_id} complete.[/red]")

def handle_mark_incomplete():
    task_id = get_task_id_input("Enter ID of task to mark incomplete:")
    task = service._storage.get_by_id(task_id)
    if not task:
        console.print(f"[red]Error:[/red] Task with ID {task_id} not found.")
        return
    if not task.completed:
        console.print(f"[yellow]Task {task_id} is already incomplete.[/yellow]")
        return
    
    updated_task = service.mark_task_incomplete(task_id)
    if updated_task:
        console.print(f"[green]Task {task_id} marked as incomplete.[/green]")
    else:
        console.print(f"[red]Error marking task {task_id} incomplete.[/red]")

def handle_delete_task():
    task_id = get_task_id_input("Enter ID of task to delete:")
    if service.delete_task(task_id):
        console.print(f"[green]Task {task_id} deleted successfully.[/green]")
    else:
        console.print(f"[red]Error:[/red] Task with ID {task_id} not found.")

def handle_reset_storage():
    confirm = console.input("[bold red]Are you sure you want to reset all tasks? This cannot be undone. (yes/no):[/bold red] ").lower()
    if confirm == 'yes':
        storage.reset()
        console.print("[bold red]All tasks have been reset.[/bold red]")
    else:
        console.print("[yellow]Reset cancelled.[/yellow]")

def interactive_cli():
    """Main interactive loop for the CLI."""
    console.print("[bold blue]Welcome to the Interactive Todo CLI![/bold blue]")

    while True:
        display_menu()
        choice = console.input("[bold]Enter your choice (1-8):[/bold] ")

        if choice == '1':
            handle_add_task()
        elif choice == '2':
            handle_list_tasks()
        elif choice == '3':
            handle_update_task()
        elif choice == '4':
            handle_mark_complete()
        elif choice == '5':
            handle_mark_incomplete()
        elif choice == '6':
            handle_delete_task()
        elif choice == '7':
            console.print("[bold dim]Exiting Todo CLI. Goodbye![/bold dim]")
            break
        elif choice == '8':
            handle_reset_storage()
        else:
            console.print("[red]Invalid choice. Please enter a number between 1 and 8.[/red]")

def cli_main():
    """Entry point for the CLI. Will now launch the interactive mode."""
    # The original argparse logic is removed as we are going interactive
    # Any arguments passed to main.py will be ignored in this interactive mode.
    interactive_cli()