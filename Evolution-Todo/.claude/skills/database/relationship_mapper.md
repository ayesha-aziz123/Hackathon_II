# Skill: relationship_mapper

## Purpose
Define and manage relationships between SQLModel tables.

## Relationship Types

### 1. One-to-Many
One parent record can have multiple child records.

**Example**: One Conversation has many Messages

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str

    # One-to-many relationship
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id")
    content: str

    # Many-to-one relationship
    conversation: Optional[Conversation] = Relationship(
        back_populates="messages"
    )
```

### 2. Many-to-One
Multiple child records belong to one parent.

**Example**: Many Tasks belong to one User

```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str

    # One-to-many
    tasks: List["Task"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    title: str

    # Many-to-one
    user: Optional[User] = Relationship(back_populates="tasks")
```

### 3. Many-to-Many
Multiple records on both sides can be related.

**Example**: Tasks can have multiple Tags, Tags can belong to multiple Tasks

```python
class TaskTagLink(SQLModel, table=True):
    """Association table for many-to-many relationship."""
    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str

    # Many-to-many
    tags: List["Tag"] = Relationship(
        back_populates="tasks",
        link_model=TaskTagLink
    )


class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    # Many-to-many
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTagLink
    )
```

### 4. Self-Referential
A table references itself.

**Example**: Tasks can have subtasks

```python
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    parent_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    # Self-referential relationship
    parent: Optional["Task"] = Relationship(
        back_populates="subtasks",
        sa_relationship_kwargs={
            "remote_side": "Task.id"
        }
    )

    subtasks: List["Task"] = Relationship(back_populates="parent")
```

## Cascade Operations

### CASCADE
Delete parent → delete all children

```python
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"}
)
```

**Common cascade options:**
- `"all"` - All operations cascade
- `"delete"` - Delete cascades
- `"delete-orphan"` - Delete orphaned children
- `"save-update"` - Save/update cascades
- `"merge"` - Merge cascades
- `"all, delete-orphan"` - **Most common** for one-to-many

### SET NULL
Delete parent → set foreign key to NULL in children

```python
# In migration
op.create_foreign_key(
    'fk_tasks_user_id',
    'tasks',
    'users',
    ['user_id'],
    ['id'],
    ondelete='SET NULL'
)
```

### RESTRICT
Prevent deletion if children exist

```python
op.create_foreign_key(
    'fk_tasks_user_id',
    'tasks',
    'users',
    ['user_id'],
    ['id'],
    ondelete='RESTRICT'
)
```

## Lazy Loading Options

### selectin (Recommended for async)
Loads relationship in separate SELECT

```python
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={"lazy": "selectin"}
)
```

### joined
Load relationship with JOIN

```python
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={"lazy": "joined"}
)
```

### subquery
Load relationship with subquery

```python
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={"lazy": "subquery"}
)
```

## Complete Example: Todo App Relationships

```python
# backend/database/models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    """User model."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    conversations: List["Conversation"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Task(SQLModel, table=True):
    """Task model."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str
    completed: bool = Field(default=False)

    # Relationship to user
    user: Optional[User] = Relationship(back_populates="tasks")


class Conversation(SQLModel, table=True):
    """Conversation model."""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: Optional[User] = Relationship(back_populates="conversations")

    # Relationship to messages
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"  # Good for async
        }
    )


class Message(SQLModel, table=True):
    """Message model."""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional[Conversation] = Relationship(
        back_populates="messages"
    )
```

## Using Relationships in Queries

### Eager Loading (Load relationships immediately)

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async with get_db_session() as session:
    # Load conversation with messages
    query = select(Conversation).options(
        selectinload(Conversation.messages)
    ).where(Conversation.id == conversation_id)

    result = await session.execute(query)
    conversation = result.scalar_one()

    # Messages are already loaded
    for message in conversation.messages:
        print(message.content)
```

### Lazy Loading (Load when accessed)

```python
async with get_db_session() as session:
    # Load conversation
    query = select(Conversation).where(Conversation.id == conversation_id)
    result = await session.execute(query)
    conversation = result.scalar_one()

    # This triggers another query
    messages = conversation.messages
```

### Accessing Parent from Child

```python
async with get_db_session() as session:
    # Load message with conversation
    query = select(Message).options(
        selectinload(Message.conversation)
    ).where(Message.id == message_id)

    result = await session.execute(query)
    message = result.scalar_one()

    # Access parent conversation
    print(message.conversation.created_at)
```

## Relationship Patterns

### Pattern 1: Cascade Delete
**When to use**: Child records are meaningless without parent

```python
# Delete conversation → delete all messages
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"}
)
```

### Pattern 2: Set NULL
**When to use**: Child records can exist without parent

```python
# Delete user → tasks remain but user_id becomes NULL
# In migration:
ondelete='SET NULL'

# In model:
user_id: Optional[int] = Field(default=None, foreign_key="users.id")
```

### Pattern 3: Restrict Delete
**When to use**: Prevent accidental deletion

```python
# Cannot delete user if they have tasks
# In migration:
ondelete='RESTRICT'
```

## Advanced Relationship Features

### Backref Alternative
```python
# Instead of defining both sides separately
class Conversation(SQLModel, table=True):
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "backref": "conversation"  # Creates reverse automatically
        }
    )
```

### Order By
```python
messages: List["Message"] = Relationship(
    back_populates="conversation",
    sa_relationship_kwargs={
        "order_by": "Message.created_at.asc()"
    }
)
```

### Filter By Default
```python
# Only get uncompleted tasks
active_tasks: List["Task"] = Relationship(
    sa_relationship_kwargs={
        "primaryjoin": "and_(User.id == Task.user_id, Task.completed == False)"
    }
)
```

## Testing Relationships

```python
# tests/test_relationships.py
import pytest
from backend.database.models import Conversation, Message
from backend.database.connection import get_db_session

@pytest.mark.asyncio
async def test_cascade_delete():
    """Test that deleting conversation deletes messages."""
    async with get_db_session() as session:
        # Create conversation with messages
        conversation = Conversation(user_id="test_user")
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

        message = Message(
            conversation_id=conversation.id,
            user_id="test_user",
            role="user",
            content="Test"
        )
        session.add(message)
        await session.commit()

        # Delete conversation
        await session.delete(conversation)
        await session.commit()

        # Verify message is also deleted
        query = select(Message).where(Message.conversation_id == conversation.id)
        result = await session.execute(query)
        assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_relationship_access():
    """Test accessing relationships."""
    async with get_db_session() as session:
        conversation = Conversation(user_id="test_user")
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

        # Add messages
        for i in range(3):
            message = Message(
                conversation_id=conversation.id,
                user_id="test_user",
                role="user",
                content=f"Message {i}"
            )
            session.add(message)

        await session.commit()

        # Load with relationship
        query = select(Conversation).options(
            selectinload(Conversation.messages)
        ).where(Conversation.id == conversation.id)

        result = await session.execute(query)
        loaded_conversation = result.scalar_one()

        assert len(loaded_conversation.messages) == 3
```

## Common Pitfalls

### 1. Circular Imports
```python
# Use string references for forward declarations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Message

class Conversation(SQLModel, table=True):
    messages: List["Message"] = Relationship(...)
```

### 2. Missing back_populates
```python
# Both sides must reference each other
class Parent(SQLModel, table=True):
    children: List["Child"] = Relationship(back_populates="parent")

class Child(SQLModel, table=True):
    parent: Optional[Parent] = Relationship(back_populates="children")
```

### 3. Forgetting Foreign Key
```python
# Child must have foreign key field
class Message(SQLModel, table=True):
    conversation_id: int = Field(foreign_key="conversations.id")  # Required!
    conversation: Optional[Conversation] = Relationship(...)
```

## Best Practices Checklist

- [ ] Both sides of relationship are defined
- [ ] Foreign key field exists in child table
- [ ] Cascade behavior is appropriate
- [ ] Lazy loading strategy is chosen (selectin for async)
- [ ] Indexes are added to foreign keys
- [ ] Delete constraints are set in migrations
- [ ] Relationships are tested
- [ ] Documentation explains relationship purpose
- [ ] Circular imports are avoided
- [ ] Type hints include Optional where appropriate

## Output Example

```python
# Final relationship documentation
"""
Database Relationships

1. User → Tasks (one-to-many)
   - Cascade: delete-orphan
   - User deletion deletes all their tasks

2. User → Conversations (one-to-many)
   - Cascade: delete-orphan
   - User deletion deletes all their conversations

3. Conversation → Messages (one-to-many)
   - Cascade: delete-orphan
   - Conversation deletion deletes all messages
   - Lazy loading: selectin
   - Ordered by: created_at ASC

All foreign keys are indexed for performance.
"""
```
