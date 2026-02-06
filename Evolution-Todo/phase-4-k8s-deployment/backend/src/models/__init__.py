
"""
Models package for Todo backend application.

This package contains all SQLModel database models.
"""

# Import models from parent models.py file using importlib
import importlib.util
import sys
from pathlib import Path
from .user import User
from .task import Task
from .message import Message
from .conversation import Conversation


# Import from models/ package subdirectories
from .conversation import Conversation  # type: ignore
from .message import Message  # type: ignore
from .user import User
from .task import Task


__all__ = ["User", "Task", "Conversation", "Message"]
