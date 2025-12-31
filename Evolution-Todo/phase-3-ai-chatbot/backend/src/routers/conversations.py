"""
Conversations API Router
Handles conversation persistence and message management for the AI chatbot
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
from datetime import datetime

from ..database.connection import get_session
from ..models.conversation_models import Conversation, Message
from ..auth import get_current_user

router = APIRouter()


@router.post("/conversations", response_model=Conversation)
def create_conversation(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new conversation for the authenticated user"""
    conversation = Conversation(
        user_id=current_user_id,
        title="New Conversation",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@router.get("/conversations", response_model=List[Conversation])
def get_user_conversations(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user)
) -> List[Conversation]:
    """Get all conversations for the authenticated user"""
    statement = select(Conversation).where(Conversation.user_id == current_user_id)
    conversations = session.exec(statement).all()
    return conversations


@router.get("/conversations/{conversation_id}", response_model=Conversation)
def get_conversation(
    *,
    conversation_id: str,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user)
) -> Conversation:
    """Get a specific conversation by ID"""
    statement = select(Conversation).where(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user_id
    )
    conversation = session.exec(statement).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/conversations/{conversation_id}/messages", response_model=Message)
def add_message(
    *,
    conversation_id: str,
    message: Message,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user)
) -> Message:
    """Add a message to a conversation"""
    # Verify that the conversation belongs to the current user
    conversation_statement = select(Conversation).where(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user_id
    )
    conversation = session.exec(conversation_statement).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Set the conversation_id for the message
    message.conversation_id = conversation_id
    message.timestamp = datetime.now()

    session.add(message)
    session.commit()
    session.refresh(message)
    return message


@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
def get_conversation_messages(
    *,
    conversation_id: str,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user)
) -> List[Message]:
    """Get all messages for a specific conversation"""
    # Verify that the conversation belongs to the current user
    conversation_statement = select(Conversation).where(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user_id
    )
    conversation = session.exec(conversation_statement).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.timestamp)
    messages = session.exec(statement).all()
    return messages