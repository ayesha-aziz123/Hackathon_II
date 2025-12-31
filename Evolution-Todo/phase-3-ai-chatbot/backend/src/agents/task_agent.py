"""
AI Task Agent for handling natural language task management operations.
This agent will be used by the OpenAI Agents SDK to perform task operations
based on natural language input from users.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import requests
import os
from datetime import datetime


class Task(BaseModel):
    """Task model matching the existing task structure"""
    id: int
    title: str
    description: str
    completed: bool = False
    created_at: str
    updated_at: str
    priority: Optional[str] = None
    due_date: Optional[str] = None


class TaskAgent:
    """AI Agent for handling task management operations"""

    def __init__(self, api_base_url: str, auth_token: str):
        self.api_base_url = api_base_url
        self.auth_token = auth_token
        self.headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }

    def add_task(self, title: str, description: str = "", priority: str = "medium", due_date: str = "") -> Dict:
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
                    "task": task
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

    def list_tasks(self, status: str = "all", priority: str = "all") -> Dict:
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

    def update_task(self, task_id: int, title: str = None, description: str = None,
                   completed: bool = None, priority: str = None, due_date: str = None) -> Dict:
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

    def delete_task(self, task_id: int) -> Dict:
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

    def complete_task(self, task_id: int) -> Dict:
        """
        Mark a task as completed based on natural language input
        """
        try:
            response = self.update_task(task_id, completed=True)

            if response["success"]:
                response["message"] = response["message"].replace("updated", "completed")

            return response
        except Exception as e:
            return {
                "success": False,
                "message": f"Error completing task: {str(e)}"
            }