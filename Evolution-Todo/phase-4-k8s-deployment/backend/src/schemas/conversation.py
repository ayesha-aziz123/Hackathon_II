"""
Conversation and Message schemas for AI chatbot Phase III.

This module defines Pydantic models for conversation management
request validation and response formatting.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MessageSchema(BaseModel):
    """
    Message schema for conversation history.

    Attributes:
        id: Message ID
        role: Message sender ("user" | "assistant" | "system")
        content: Message text
        tool_calls: JSON object containing tool invocations (assistant role only)
        created_at: Message timestamp (ISO 8601 format)
        expires_at: Message expiration timestamp (ISO 8601 format)
    """

    id: int
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    tool_calls: Optional[dict] = None
    created_at: datetime  # ISO 8601 formatted datetime
    expires_at: datetime  # ISO 8601 formatted datetime

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": 1,
                "role": "user",
                "content": "Show me all my tasks",
                "tool_calls": None,
                "created_at": "2025-12-14T10:30:00Z",
                "expires_at": "2025-12-16T10:30:00Z"
            }
        }


class ConversationSchema(BaseModel):
    """
    Conversation schema for conversation metadata.

    Attributes:
        id: Conversation ID
        title: Conversation title
        is_active: Whether conversation is still active
        created_at: Conversation creation timestamp (ISO 8601 format)
        updated_at: Last message timestamp (ISO 8601 format)
    """

    id: int
    title: str
    is_active: bool
    created_at: datetime  # ISO 8601 formatted datetime
    updated_at: datetime  # ISO 8601 formatted datetime

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "New Conversation",
                "is_active": True,
                "created_at": "2025-12-14T10:30:00Z",
                "updated_at": "2025-12-14T10:35:00Z"
            }
        }


class ConversationCreateRequest(BaseModel):
    """
    Request schema for creating a new conversation.

    Attributes:
        title: Optional conversation title (auto-generated if not provided)
    """

    title: Optional[str] = Field(
        default="New Chat",
        max_length=500,
        description="Conversation title (auto-generated as 'New Chat' if not provided)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "New Chat"
            }
        }


class ConversationResponse(BaseModel):
    """
    Response schema for conversation operations.

    Attributes:
        success: Whether operation was successful
        data: Conversation data
    """

    success: bool
    data: ConversationSchema

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "id": 1,
                    "title": "New Chat",
                    "is_active": True,
                    "created_at": "2025-12-14T10:30:00Z",
                    "updated_at": "2025-12-14T10:30:00Z"
                }
            }
        }


class ConversationListResponse(BaseModel):
    """
    Response schema for listing conversations.

    Attributes:
        success: Whether operation was successful
        data: List of conversations
    """

    success: bool
    data: List[ConversationSchema]

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": [
                    {
                        "id": 1,
                        "title": "New Chat",
                        "is_active": True,
                        "created_at": "2025-12-14T10:30:00Z",
                        "updated_at": "2025-12-14T10:35:00Z"
                    }
                ]
            }
        }


class ConversationWithMessagesResponse(BaseModel):
    """
    Response schema for getting conversation with messages.

    Attributes:
        success: Whether operation was successful
        data: Conversation data with messages
    """

    success: bool
    data: ConversationSchema
    messages: List[MessageSchema]

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "id": 1,
                    "title": "New Chat",
                    "is_active": True,
                    "created_at": "2025-12-14T10:30:00Z",
                    "updated_at": "2025-12-14T10:35:00Z"
                },
                "messages": [
                    {
                        "id": 1,
                        "role": "user",
                        "content": "Show me all my tasks",
                        "tool_calls": None,
                        "created_at": "2025-12-14T10:30:00Z",
                        "expires_at": "2025-12-16T10:30:00Z"
                    },
                    {
                        "id": 2,
                        "role": "assistant",
                        "content": "Here are your tasks...",
                        "tool_calls": None,
                        "created_at": "2025-12-14T10:30:05Z",
                        "expires_at": "2025-12-16T10:30:05Z"
                    }
                ]
            }
        }