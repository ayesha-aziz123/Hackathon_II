
"""
Conversation model for AI chatbot Phase III.

This module defines the Conversation database model for tracking
user conversations with the AI assistant.
"""

from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, SQLModel, Relationship


class Conversation(SQLModel, table=True):
    """
    Conversation model for AI chatbot.

    State Transitions: [New] → [Active] → [Archived/Deleted]
    Current Scope: Active only (no archived/deleted states implemented)

    Attributes:
        id: Unique conversation identifier (auto-increment)
        user_id: Owner of the conversation (indexed for user isolation)
        title: Conversation title (auto-generated or user-set)
        is_active: Whether conversation is still active
        created_at: Conversation creation timestamp
        updated_at: Last message timestamp
    """

    __tablename__ = "conversations" # type: ignore

    # Primary Key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign Keys & Indexes
    user_id: str = Field(index=True, nullable=False)  # User isolation (indexed for queries)

    # Conversation Data
    title: Optional[str] = Field(default="New Conversation",max_length=500, nullable=False)
    is_active: bool = Field(default=True, nullable=False, index=True) 

    # Timestamps with default_factory
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

    # Validation: user_id non-empty, created_at <= updated_at enforced at service layer
