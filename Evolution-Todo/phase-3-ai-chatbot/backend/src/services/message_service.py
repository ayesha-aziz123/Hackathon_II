"""
Message service - handles message operations
"""
from sqlmodel import Session, select
from typing import List, Optional
import logging

from ..models.message import Message

logger = logging.getLogger(__name__)


def store_message(
    session: Session,
    conversation_id: int,
    user_id: str,
    role: str,
    content: str,
    tool_calls: Optional[List[str]] = None
) -> Message:
    """
    Store a new message in the database
    
    Args:
        session: Database session
        conversation_id: Conversation ID
        user_id: User ID
        role: Message role ("user" or "assistant")
        content: Message content
        tool_calls: List of tool calls (optional)
    
    Returns:
        Created message object
    """
    try:
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            tool_calls=str(tool_calls) if tool_calls else None
        )
        
        session.add(message)
        session.commit()
        session.refresh(message)
        
        logger.info(f"✅ Stored {role} message in conversation {conversation_id}")
        return message
        
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Error storing message: {str(e)}")
        raise