"""
Conversation API endpoints for AI-powered task management (Phase III).

This module provides endpoints for conversation management including:
- Creating new conversations
- Listing user's conversations
- Getting conversation with messages
- Deleting conversations (with cascade)
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.jwt import get_current_user
from src.database.connection import get_async_session
from src.models.conversation import Conversation
from src.models.message import Message
from src.schemas.conversation import (
    ConversationCreateRequest,
    ConversationResponse,
    ConversationListResponse,
    ConversationWithMessagesResponse,
)
from src.services.conversation_service import (
    get_user_conversations,
    get_conversation_history,
)

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["conversations"])


@router.post(
    "/{user_id}/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    user_id: str,
    request: ConversationCreateRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Create a new conversation for the user.

    Args:
        user_id: User ID from path (verified against JWT)
        request: Conversation creation request with optional title
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        ConversationResponse: Created conversation data

    Raises:
        HTTPException: 401 if user_id doesn't match JWT
    """
    # Verify user_id matches authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: user_id mismatch"
        )

    # Create new conversation
    conversation = Conversation(
        user_id=user_id,
        title=request.title,
    )

    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)

    logger.info(f"✅ Created conversation {conversation.id} for user {user_id}")

    return ConversationResponse(
        success=True,
        data=conversation
    )


@router.get("/{user_id}/conversations")
async def list_user_conversations(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = 50,
    offset: int = 0,
):
    """
    List all conversations for the user (compatible with frontend).

    Args:
        user_id: User ID from path (verified against JWT)
        current_user: Authenticated user from JWT
        session: Database session
        limit: Number of conversations to return (default 50)
        offset: Offset for pagination (default 0)

    Returns:
        dict: Compatible response format for frontend

    Raises:
        HTTPException: 401 if user_id doesn't match JWT
    """
    try:
        # Verify user_id matches authenticated user
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: user_id mismatch"
            )

        # Validate and cap limit
        limit = min(limit, 100)

        # Get conversations from service
        conversations = await get_user_conversations(session, user_id, limit=limit, offset=offset)

        # Format response compatible with frontend
        formatted_conversations = []
        for conv in conversations:
            # Safely convert datetime objects to string
            created_at_str = conv.created_at.isoformat() if hasattr(conv.created_at, 'isoformat') else str(conv.created_at)
            updated_at_str = conv.updated_at.isoformat() if hasattr(conv.updated_at, 'isoformat') else str(conv.updated_at)

            formatted_conversations.append({
                "id": conv.id,
                "title": conv.title,
                "is_active": conv.is_active,
                "created_at": created_at_str,
                "updated_at": updated_at_str,
            })

        logger.info(f"✅ Retrieved {len(formatted_conversations)} conversations for user {user_id}")

        return {
            "success": True,
            "data": {
                "conversations": formatted_conversations,
                "count": len(formatted_conversations),
                "limit": limit,
                "offset": offset,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversations for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversations"
        )


@router.get("/{user_id}/conversations/{conversation_id}")
async def get_conversation_with_messages(
    user_id: str,
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get a specific conversation with all its messages (compatible with frontend).

    Args:
        user_id: User ID from path (verified against JWT)
        conversation_id: Conversation ID to retrieve
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        dict: Compatible response format for frontend

    Raises:
        HTTPException: 401 if user_id doesn't match JWT
        HTTPException: 404 if conversation not found or access denied
    """
    # Verify user_id matches authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: user_id mismatch"
        )

    # Get conversation
    conversation_statement = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .where(Conversation.user_id == user_id)
    )
    conversation_result = await session.execute(conversation_statement)
    conversation = conversation_result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied"
        )

    # Get messages for conversation
    messages = await get_conversation_history(session, user_id, conversation_id)

    # Format messages for frontend compatibility
    formatted_messages = []
    for msg in messages:
        # Safely convert datetime objects to string
        created_at_str = msg.created_at.isoformat() if hasattr(msg.created_at, 'isoformat') else str(msg.created_at)
        expires_at_str = msg.expires_at.isoformat() if hasattr(msg.expires_at, 'isoformat') else str(msg.expires_at)

        formatted_messages.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "tool_calls": msg.tool_calls,
            "created_at": created_at_str,
            "expires_at": expires_at_str,
        })

    logger.info(f"✅ Retrieved conversation {conversation_id} with {len(messages)} messages for user {user_id}")

    # Safely convert datetime objects to string
    conv_created_at_str = conversation.created_at.isoformat() if hasattr(conversation.created_at, 'isoformat') else str(conversation.created_at)
    conv_updated_at_str = conversation.updated_at.isoformat() if hasattr(conversation.updated_at, 'isoformat') else str(conversation.updated_at)

    return {
        "success": True,
        "data": {
            "id": conversation.id,
            "title": conversation.title,
            "is_active": conversation.is_active,
            "created_at": conv_created_at_str,
            "updated_at": conv_updated_at_str,
        },
        "messages": formatted_messages
    }


@router.delete("/{user_id}/conversations/{conversation_id}")
async def delete_conversation(
    user_id: str,
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Delete a conversation and all its messages (cascade delete).

    Args:
        user_id: User ID from path (verified against JWT)
        conversation_id: Conversation ID to delete
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        dict: Success response

    Raises:
        HTTPException: 401 if user_id doesn't match JWT
        HTTPException: 404 if conversation not found or access denied
    """
    # Verify user_id matches authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: user_id mismatch"
        )

    try:
        # Get conversation to verify ownership
        conversation_statement = (
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .where(Conversation.user_id == user_id)
        )
        conversation_result = await session.execute(conversation_statement)
        conversation = conversation_result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied"
            )

        # Delete conversation (messages will be cascade deleted due to foreign key constraint)
        await session.delete(conversation)
        await session.commit()

        logger.info(f"✅ Deleted conversation {conversation_id} and its messages for user {user_id}")

        return {"success": True, "message": "Conversation deleted successfully"}

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )


from sqlmodel import select