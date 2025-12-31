"""
Conversation and Message models for the AI Chatbot
These models handle conversation persistence as required in the Phase III requirements
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid


class Conversation(SQLModel, table=True):
    """
    Conversation model to persist chat conversations
    Required for conversation persistence as per Phase III requirements
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True)
    user_id: str = Field(index=True)  # Links to the authenticated user
    title: str = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    """
    Message model to persist individual chat messages
    Required for conversation persistence as per Phase III requirements
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.conversation_id", index=True)
    role: str = Field(regex="^(user|assistant|system)$")  # user, assistant, or system
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # Relationship to conversation
    conversation: Conversation = Relationship(back_populates="messages")