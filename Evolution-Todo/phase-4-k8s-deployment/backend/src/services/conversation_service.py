# from sqlmodel import Session, select
# from datetime import datetime
# from typing import List, Optional
# from ..models.conversation import Conversation
# from ..models.message import Message
# from ..database.connection import get_session
# from sqlmodel import create_engine, SQLModel, Session
# from pydantic import BaseModel


# class ConversationService:
#     """
#     Service for managing conversations and messages.
#     """

#     def __init__(self, session: Session):
#         self.session = session

#     async def get_or_create_conversation(self, user_id: str, conversation_id: Optional[int] = None) -> Conversation:
#         """Get existing conversation or create new one."""
#         if conversation_id:
#             # Verify user owns this conversation
#             conversation = self.session.get(Conversation, conversation_id)
#             if conversation and conversation.user_id == user_id:
#                 return conversation
#             else:
#                 raise ValueError("Conversation not found or access denied")
#         else:
#             # Create new conversation
#             conversation = Conversation(user_id=user_id)
#             self.session.add(conversation)
#             self.session.commit()
#             self.session.refresh(conversation)
#             return conversation

#     async def add_message(self, user_id: str, conversation_id: int, role: str, content: str, tool_calls: Optional[str] = None) -> Message:
#         """Add a message to a conversation."""
#         # Verify user owns this conversation
#         conversation = self.session.get(Conversation, conversation_id)
#         if not conversation or conversation.user_id != user_id:
#             raise ValueError("d")

#         message = Message(
#             user_id=user_id,
#             conversation_id=conversation_id,
#             role=role,
#             content=content,
#             tool_calls=tool_calls
#         )
#         self.session.add(message)
#         self.session.commit()
#         self.session.refresh(message)
#         return message

#     async def get_conversation_history(self, user_id: str, conversation_id: int) -> List[Message]:
#         """Get all messages in a conversation."""
#         # Verify user owns this conversation
#         conversation = self.session.get(Conversation, conversation_id)
#         if not conversation or conversation.user_id != user_id:
#             raise ValueError("Conversation not found or access denied")

#         statement = select(Message).where(
#             Message.conversation_id == conversation_id
#         ).order_by(Message.created_at.asc())
#         messages = self.session.exec(statement).all()
#         return messages # type: ignore

#     async def get_user_conversations(self, user_id: str) -> List[Conversation]:
#         """Get all conversations for a user."""
#         statement = select(Conversation).where(
#             Conversation.user_id == user_id
#         ).order_by(Conversation.created_at.desc())
#         conversations = self.session.exec(statement).all()
#         return conversations


# # Async wrapper functions for easier use
# async def get_or_create_conversation(session: Session, user_id: str, conversation_id: Optional[int] = None) -> Conversation:
#     service = ConversationService(session)
#     return await service.get_or_create_conversation(user_id, conversation_id)


# async def add_message(session: Session, user_id: str, conversation_id: int, role: str, content: str, tool_calls: Optional[str] = None) -> Message:
#     service = ConversationService(session)
#     return await service.add_message(user_id, conversation_id, role, content, tool_calls)


# async def get_conversation_history(session: Session, user_id: str, conversation_id: int) -> List[Message]:
#     service = ConversationService(session)
#     return await service.get_conversation_history(user_id, conversation_id)


# async def get_user_conversations(session: Session, user_id: str) -> List[Conversation]:
#     service = ConversationService(session)
#     return await service.get_user_conversations(user_id)


# src/services/conversation_service.py



from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime
from typing import List, Optional
from ..models.conversation import Conversation
from ..models.message import Message
from fastapi import HTTPException


class ConversationService:
    """
    Service for managing conversations and messages.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_conversation(
        self, user_id: str, conversation_id: Optional[int] = None
    ) -> Conversation:
        """Get existing conversation or create new one."""
        if conversation_id:
            conversation = await self.session.get(Conversation, conversation_id)

            if conversation and conversation.user_id == user_id:
                return conversation
            else:
                raise HTTPException(
                    status_code=404, detail="Conversation not found or access denied"
                )
        else:
            # Create new conversation
            conversation = Conversation(user_id=user_id, created_at=datetime.utcnow())
            self.session.add(conversation)
            await self.session.commit()
            await self.session.refresh(conversation)
            return conversation

    async def update_conversation_title(
        self, conversation_id: int, new_title: str
    ) -> Conversation:
        """Update conversation title."""
        conversation = await self.session.get(Conversation, conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=404, detail="Conversation not found"
            )

        conversation.title = new_title
        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_first_message_in_conversation(self, conversation_id: int) -> Optional[Message]:
        """Get the first message in a conversation to use for title generation."""
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(1)
        )
        result = await self.session.execute(statement)
        message = result.scalar_one_or_none()
        return message

    async def add_message(
        self,
        user_id: str,
        conversation_id: int,
        role: str,
        content: str,
        # tool_calls: Optional[str] = None,
        tool_calls: Optional[dict] = None,
    ) -> Message:
        """Add a message to a conversation."""
        conversation = await self.session.get(Conversation, conversation_id)

        if not conversation or conversation.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="Conversation not found or access denied"
            )

        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=datetime.utcnow(),
        )
        self.session.add(message)

        # Update the conversation's updated_at timestamp
        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)

        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def get_conversation_history(
        self, user_id: str, conversation_id: int, limit: int = 20  # ✅ ADDED
    ) -> List[Message]:
        """Get all messages in a conversation."""
        conversation = await self.session.get(Conversation, conversation_id)

        if not conversation or conversation.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="Conversation not found or access denied"
            )

        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )  # ✅ ADDED .limit(limit)

        result = await self.session.execute(statement)
        messages = result.scalars().all()
        return list(messages)

    async def get_user_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Conversation]:
        """Get all conversations for a user with pagination."""
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(statement)
        conversations = result.scalars().all()
        return list(conversations)


# Async wrapper functions
async def get_or_create_conversation(
    session: AsyncSession, user_id: str, conversation_id: Optional[int] = None
) -> Conversation:
    service = ConversationService(session)
    return await service.get_or_create_conversation(user_id, conversation_id)


async def update_conversation_title(
    session: AsyncSession, conversation_id: int, new_title: str
) -> Conversation:
    service = ConversationService(session)
    return await service.update_conversation_title(conversation_id, new_title)


async def get_first_message_in_conversation(
    session: AsyncSession, conversation_id: int
) -> Optional[Message]:
    service = ConversationService(session)
    return await service.get_first_message_in_conversation(conversation_id)


async def add_message(
    session: AsyncSession,
    user_id: str,
    conversation_id: int,
    role: str,
    content: str,
    tool_calls: Optional[dict] = None,
) -> Message:
    service = ConversationService(session)
    return await service.add_message(
        user_id, conversation_id, role, content, tool_calls
    )


async def get_conversation_history(
    session: AsyncSession,
    user_id: str,
    conversation_id: int,
    limit: int = 20,  # ✅ ADDED
) -> List[Message]:
    service = ConversationService(session)
    return await service.get_conversation_history(
        user_id, conversation_id, limit
    )  # ✅ Pass limit


async def get_user_conversations(
    session: AsyncSession, user_id: str, limit: int = 50, offset: int = 0
) -> List[Conversation]:
    service = ConversationService(session)
    return await service.get_user_conversations(user_id, limit, offset)
