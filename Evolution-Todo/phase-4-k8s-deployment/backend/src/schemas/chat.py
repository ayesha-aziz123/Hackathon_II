
"""
Chat-specific schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """
    Schema for chat requests
    """
    conversation_id: Optional[int] = None
    message: str = Field(..., min_length=1, max_length=5000)

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 13,
                "message": "Add a task to buy groceries"
            }
        }


class ChatResponse(BaseModel):
    """
    Schema for chat responses
    """
    conversation_id: int
    response: str
    tool_calls: list = []

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 13,
                "response": "I've added a new task to buy groceries.",
                "tool_calls": ["add_task"]
            }
        }