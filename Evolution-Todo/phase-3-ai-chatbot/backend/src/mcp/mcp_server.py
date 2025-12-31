"""
MCP Server for AI Chatbot Task Operations
This server implements the task operations as tools that can be used by the OpenAI Agents SDK.
"""
import asyncio
from typing import Dict, Any, List
from mcp.server import Server
from mcp.types import TextContent, Tool, Completion, Prompt, PromptMessage
import os
import requests
from datetime import datetime


# Initialize the MCP server
server = Server(
    name="task-operations-server",
    version="1.0.0"
)


class TaskOperations:
    """Class containing all task operations that can be exposed as MCP tools"""

    def __init__(self):
        # Get the API base URL and auth token from environment or use defaults
        self.api_base_url = os.getenv("TASK_API_BASE_URL", "http://localhost:8000/api/tasks")
        self.auth_token = os.getenv("TASK_API_TOKEN", "")
        self.headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }

    async def add_task(self, title: str, description: str = "", priority: str = "medium", due_date: str = "") -> Dict[str, Any]:
        """
        Add a new task based on natural language input
        """
        try:
            task_data = {
                "title": title,
                "description": description,
                "completed": False,
                "priority": priority,
                "due_date": due_date,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            response = requests.post(
                f"{self.api_base_url}/tasks",
                json=task_data,
                headers=self.headers
            )

            if response.status_code == 200:
                task = response.json()
                return {
                    "success": True,
                    "message": f"Task '{title}' has been added successfully!",
                    "task_id": task["id"]
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to add task: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error adding task: {str(e)}"
            }

    async def list_tasks(self, status: str = "all", priority: str = "all") -> Dict[str, Any]:
        """
        List tasks based on natural language query
        """
        try:
            params = {}
            if status != "all":
                params["status"] = status
            if priority != "all":
                params["priority"] = priority

            response = requests.get(
                f"{self.api_base_url}/tasks",
                headers=self.headers,
                params=params
            )

            if response.status_code == 200:
                tasks = response.json()

                if not tasks:
                    return {
                        "success": True,
                        "message": "You don't have any tasks at the moment.",
                        "tasks": []
                    }

                task_list = []
                for task in tasks:
                    status = "completed" if task.get("completed", False) else "pending"
                    task_list.append(f"- [{status}] {task['title']} (ID: {task['id']})")

                return {
                    "success": True,
                    "message": f"You have {len(tasks)} task(s):\n" + "\n".join(task_list),
                    "tasks": tasks
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to list tasks: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error listing tasks: {str(e)}"
            }

    async def update_task(self, task_id: int, title: str = None, description: str = None,
                         completed: bool = None, priority: str = None, due_date: str = None) -> Dict[str, Any]:
        """
        Update a task based on natural language input
        """
        try:
            # First get the current task to preserve unchanged fields
            current_response = requests.get(
                f"{self.api_base_url}/tasks/{task_id}",
                headers=self.headers
            )

            if current_response.status_code != 200:
                return {
                    "success": False,
                    "message": f"Task with ID {task_id} not found."
                }

            current_task = current_response.json()

            # Prepare update data with existing values as defaults
            update_data = {
                "title": title if title is not None else current_task["title"],
                "description": description if description is not None else current_task["description"],
                "completed": completed if completed is not None else current_task["completed"],
                "priority": priority if priority is not None else current_task.get("priority", "medium"),
                "due_date": due_date if due_date is not None else current_task.get("due_date", ""),
                "updated_at": datetime.now().isoformat()
            }

            response = requests.put(
                f"{self.api_base_url}/tasks/{task_id}",
                json=update_data,
                headers=self.headers
            )

            if response.status_code == 200:
                updated_task = response.json()
                action = "completed" if completed else "updated"
                return {
                    "success": True,
                    "message": f"Task '{updated_task['title']}' has been {action} successfully!",
                    "task": updated_task
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to update task: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error updating task: {str(e)}"
            }

    async def delete_task(self, task_id: int) -> Dict[str, Any]:
        """
        Delete a task based on natural language input
        """
        try:
            # First get the task to know its title
            current_response = requests.get(
                f"{self.api_base_url}/tasks/{task_id}",
                headers=self.headers
            )

            if current_response.status_code != 200:
                return {
                    "success": False,
                    "message": f"Task with ID {task_id} not found."
                }

            task_title = current_response.json()["title"]

            response = requests.delete(
                f"{self.api_base_url}/tasks/{task_id}",
                headers=self.headers
            )

            if response.status_code == 200:
                return {
                    "success": True,
                    "message": f"Task '{task_title}' has been deleted successfully!"
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to delete task: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting task: {str(e)}"
            }

    async def complete_task(self, task_id: int) -> Dict[str, Any]:
        """
        Mark a task as completed based on natural language input
        """
        try:
            response = await self.update_task(task_id, completed=True)

            if response["success"]:
                response["message"] = response["message"].replace("updated", "completed")

            return response
        except Exception as e:
            return {
                "success": False,
                "message": f"Error completing task: {str(e)}"
            }


# Create an instance of the task operations
task_ops = TaskOperations()


@server.tools.list
async def list_tools() -> List[Tool]:
    """List all available tools for task management"""
    return [
        Tool(
            name="add_task",
            description="Add a new task with title, description, priority, and due date",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The title of the task"},
                    "description": {"type": "string", "description": "The description of the task"},
                    "priority": {"type": "string", "description": "Priority of the task (high, medium, low)", "default": "medium"},
                    "due_date": {"type": "string", "description": "Due date for the task in YYYY-MM-DD format", "default": ""}
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List all tasks with optional filtering by status and priority",
            input_schema={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Filter by status (all, completed, pending)", "default": "all"},
                    "priority": {"type": "string", "description": "Filter by priority (all, high, medium, low)", "default": "all"}
                }
            }
        ),
        Tool(
            name="update_task",
            description="Update an existing task by ID",
            input_schema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "The ID of the task to update"},
                    "title": {"type": "string", "description": "New title for the task"},
                    "description": {"type": "string", "description": "New description for the task"},
                    "completed": {"type": "boolean", "description": "Whether the task is completed"},
                    "priority": {"type": "string", "description": "New priority for the task (high, medium, low)"},
                    "due_date": {"type": "string", "description": "New due date for the task in YYYY-MM-DD format"}
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task by ID",
            input_schema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed by ID",
            input_schema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "The ID of the task to mark as completed"}
                },
                "required": ["task_id"]
            }
        )
    ]


@server.tools.call("add_task")
async def handle_add_task(title: str, description: str = "", priority: str = "medium", due_date: str = "") -> Dict[str, Any]:
    """Handle the add_task tool call"""
    return await task_ops.add_task(title, description, priority, due_date)


@server.tools.call("list_tasks")
async def handle_list_tasks(status: str = "all", priority: str = "all") -> Dict[str, Any]:
    """Handle the list_tasks tool call"""
    return await task_ops.list_tasks(status, priority)


@server.tools.call("update_task")
async def handle_update_task(task_id: int, title: str = None, description: str = None,
                           completed: bool = None, priority: str = None, due_date: str = None) -> Dict[str, Any]:
    """Handle the update_task tool call"""
    return await task_ops.update_task(task_id, title, description, completed, priority, due_date)


@server.tools.call("delete_task")
async def handle_delete_task(task_id: int) -> Dict[str, Any]:
    """Handle the delete_task tool call"""
    return await task_ops.delete_task(task_id)


@server.tools.call("complete_task")
async def handle_complete_task(task_id: int) -> Dict[str, Any]:
    """Handle the complete_task tool call"""
    return await task_ops.complete_task(task_id)


if __name__ == "__main__":
    import uvicorn
    import sys

    # Run the MCP server
    uvicorn.run(
        "mcp_server:server",
        host="127.0.0.1",
        port=3000,
        reload=True
    )