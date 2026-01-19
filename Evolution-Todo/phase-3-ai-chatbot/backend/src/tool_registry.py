"""
Direct Tool Registry - Simple task tool calling without MCP protocol.
Works with OpenAI function calling format (GPT-4o-mini, etc.)
"""

import logging
import re
from typing import Literal, Optional
from sqlmodel import Session

from src.database.connection import get_session
from src.services.task_service import TaskService
from src.schemas.requests import CreateTaskRequest

logger = logging.getLogger("tools")

# Tool definitions for OpenAI function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User's unique identifier"},
                    "title": {"type": "string", "description": "Task title (max 200 chars)"},
                    "description": {"type": "string", "description": "Task description (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Task priority"},
                },
                "required": ["user_id", "title"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Retrieve user's tasks with optional filtering",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User's unique identifier"},
                    "status": {"type": "string", "enum": ["all", "pending", "completed"], "description": "Filter by status"},
                },
                "required": ["user_id"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as complete",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User's unique identifier"},
                    "task_id": {"type": "integer", "description": "Task ID to complete"},
                },
                "required": ["user_id", "task_id"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task permanently",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User's unique identifier"},
                    "task_id": {"type": "integer", "description": "Task ID to delete"},
                },
                "required": ["user_id", "task_id"],
            },
        }
    },
]


def detect_priority_from_text(text: str) -> str:
    """Detect priority from task text."""
    text_lower = text.lower()
    high_patterns = [r'\bhigh\s*priority\b', r'\burgent\b', r'\bcritical\b', r'\bimportant\b', r'\basap\b']
    low_patterns = [r'\blow\s*priority\b', r'\bminor\b', r'\boptional\b', r'\bwhen\s*you\s*have\s*time\b']

    for p in high_patterns:
        if re.search(p, text_lower):
            return "high"
    for p in low_patterns:
        if re.search(p, text_lower):
            return "low"
    return "medium"


def add_task(user_id: str, title: str, description: Optional[str] = None, priority: Optional[str] = None) -> dict:
    """Add a new task."""
    logger.info(f"[TOOL] add_task called: user_id={user_id}, title={title}")

    session = next(get_session())
    try:
        if priority is None:
            priority = detect_priority_from_text(f"{title} {description or ''}")

        task_data = CreateTaskRequest(
            title=title,
            description=description,
            priority=priority,
            due_date=None,
            tags=None,
        )

        task = TaskService.create_task(db=session, user_id=user_id, task_data=task_data)

        result = {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "priority": task.priority,
        }
        logger.info(f"[TOOL] add_task result: {result}")
        return result
    finally:
        session.close()


def list_tasks(user_id: str, status: str = "all") -> dict:
    """List user's tasks."""
    logger.info(f"[TOOL] list_tasks called: user_id={user_id}, status={status}")

    session = next(get_session())
    try:
        from src.schemas.query_params import TaskQueryParams

        query_params = TaskQueryParams(status=status, page=1, limit=100)
        tasks, _ = TaskService.get_tasks(db=session, user_id=user_id, query_params=query_params)

        result = {
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "completed": t.completed,
                    "priority": t.priority,
                }
                for t in tasks
            ],
            "count": len(tasks),
        }
        logger.info(f"[TOOL] list_tasks result: {result['count']} tasks")
        return result
    finally:
        session.close()


def complete_task(user_id: str, task_id: int) -> dict:
    """Complete a task."""
    logger.info(f"[TOOL] complete_task called: user_id={user_id}, task_id={task_id}")

    session = next(get_session())
    try:
        task = TaskService.toggle_complete(db=session, user_id=user_id, task_id=task_id, completed=True)
        result = {"task_id": task.id, "status": "completed", "title": task.title}
        logger.info(f"[TOOL] complete_task result: {result}")
        return result
    finally:
        session.close()


def delete_task(user_id: str, tool_id: int) -> dict:
    """Delete a task."""
    logger.info(f"[TOOL] delete_task called: user_id={user_id}, task_id={tool_id}")

    session = next(get_session())
    try:
        task = TaskService.get_task_by_id(db=session, user_id=user_id, task_id=tool_id)
        title = task.title
        TaskService.delete_task(db=session, user_id=user_id, task_id=tool_id)
        result = {"task_id": tool_id, "status": "deleted", "title": title}
        logger.info(f"[TOOL] delete_task result: {result}")
        return result
    finally:
        session.close()


# Tool executor
def execute_tool(tool_name: str, args: dict) -> dict:
    """Execute a tool by name with arguments."""
    logger.info(f"[TOOL] execute_tool: name={tool_name}, args={args}")

    if tool_name == "add_task":
        return add_task(**args)
    elif tool_name == "list_tasks":
        return list_tasks(**args)
    elif tool_name == "complete_task":
        return complete_task(**args)
    elif tool_name == "delete_task":
        return delete_task(**args)
    else:
        raise ValueError(f"Unknown tool: {tool_name}")
