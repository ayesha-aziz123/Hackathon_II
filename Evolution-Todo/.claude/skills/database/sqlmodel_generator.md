# Skill: sqlmodel_generator

## Purpose
Generate SQLModel model classes from database table specifications.

## Inputs
- Table name
- Field specifications (name, type, constraints)
- Relationships to other tables
- Indexes required

## Process

### Step 1: Parse Specification
```python
# Example spec format:
spec = {
    "table_name": "tasks",
    "fields": [
        {"name": "id", "type": "int", "primary_key": True, "nullable": False},
        {"name": "user_id", "type": "str", "index": True, "max_length": 255},
        {"name": "title", "type": "str", "nullable": False, "max_length": 500},
        {"name": "description", "type": "str", "nullable": True, "max_length": 2000},
        {"name": "completed", "type": "bool", "default": False},
        {"name": "created_at", "type": "datetime", "default": "utcnow"},
        {"name": "updated_at", "type": "datetime", "default": "utcnow"}
    ],
    "relationships": []
}
```

### Step 2: Generate Model Class

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class {TableName}(SQLModel, table=True):
    """
    {Description of the table}
    """

    __tablename__ = "{table_name}"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Indexed fields
    {field_name}: {field_type} = Field(index=True, {constraints})

    # Regular fields
    {field_name}: {field_type} = Field({constraints})

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                # Example data
            }
        }
```

### Step 3: Add Field Type Mapping

```python
TYPE_MAPPING = {
    "int": "int",
    "str": "str",
    "bool": "bool",
    "datetime": "datetime",
    "float": "float",
    "text": "str"  # Large text fields
}

FIELD_CONSTRAINTS = {
    "max_length": lambda x: f"max_length={x}",
    "nullable": lambda x: f"nullable={x}",
    "default": lambda x: f"default={x}",
    "unique": lambda x: f"unique={x}",
    "index": lambda x: f"index={x}"
}
```

### Step 4: Generate Validators (if needed)

```python
from pydantic import validator

class {TableName}(SQLModel, table=True):
    # ... fields ...

    @validator('email')
    def validate_email(cls, v):
        # Email validation logic
        return v

    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        return v.strip()
```

## Complete Example Output

```python
# backend/database/models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from pydantic import validator

class Task(SQLModel, table=True):
    """
    Task model for storing user todo items.

    Attributes:
        id: Unique task identifier
        user_id: User who owns this task
        title: Task title/description
        description: Optional detailed description
        completed: Whether task is completed
        created_at: When task was created
        updated_at: When task was last modified
    """

    __tablename__ = "tasks"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # User reference (indexed for fast lookups)
    user_id: str = Field(
        index=True,
        nullable=False,
        max_length=255,
        description="User identifier"
    )

    # Task content
    title: str = Field(
        nullable=False,
        max_length=500,
        description="Task title"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Detailed task description"
    )

    # Status
    completed: bool = Field(
        default=False,
        description="Task completion status"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    @validator('title')
    def validate_title(cls, v):
        """Ensure title is not empty."""
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        return v.strip()

    @validator('user_id')
    def validate_user_id(cls, v):
        """Ensure user_id is not empty."""
        if not v or len(v.strip()) == 0:
            raise ValueError('User ID cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False
            }
        }


class Conversation(SQLModel, table=True):
    """
    Conversation model for chat sessions.

    A conversation groups related messages together.
    """

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: str = Field(
        index=True,
        nullable=False,
        max_length=255,
        description="User identifier"
    )

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123"
            }
        }


class Message(SQLModel, table=True):
    """
    Message model for chat history.

    Stores individual messages within a conversation.
    """

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: str = Field(
        index=True,
        nullable=False,
        max_length=255,
        description="User identifier"
    )

    conversation_id: int = Field(
        foreign_key="conversations.id",
        description="Parent conversation ID"
    )

    role: str = Field(
        nullable=False,
        max_length=50,
        description="Message role: user or assistant"
    )

    content: str = Field(
        nullable=False,
        description="Message content"
    )

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional[Conversation] = Relationship(
        back_populates="messages"
    )

    @validator('role')
    def validate_role(cls, v):
        """Ensure role is either 'user' or 'assistant'."""
        if v not in ['user', 'assistant']:
            raise ValueError('Role must be "user" or "assistant"')
        return v

    @validator('content')
    def validate_content(cls, v):
        """Ensure content is not empty."""
        if not v or len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "conversation_id": 1,
                "role": "user",
                "content": "Add buy groceries to my list"
            }
        }
```

## Usage in Agent

When the Database Schema Agent needs to create models:

```
1. Receive table specifications
2. Use sqlmodel_generator skill
3. Generate complete model file
4. Include validators and relationships
5. Add documentation and examples
6. Save to backend/database/models.py
```

## Best Practices

1. **Always add indexes** on foreign keys and frequently queried fields
2. **Use proper types** - don't use str for everything
3. **Add validators** for business logic constraints
4. **Document fields** with descriptions
5. **Provide examples** in Config class
6. **Use Optional** for nullable fields
7. **Set sensible defaults** for boolean and timestamp fields
8. **Add relationships** with proper cascade rules

## Common Patterns

### Timestamp Fields
```python
created_at: datetime = Field(default_factory=datetime.utcnow)
updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Indexed Foreign Keys
```python
user_id: str = Field(index=True, foreign_key="users.id")
```

### Enum Fields
```python
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

status: TaskStatus = Field(default=TaskStatus.PENDING)
```

### JSON Fields
```python
from sqlalchemy import Column, JSON
from sqlmodel import Field

metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))
```

## Output Checklist

- [ ] All fields have proper types
- [ ] Primary key is defined
- [ ] Indexes are added where needed
- [ ] Foreign keys are configured
- [ ] Relationships are bidirectional
- [ ] Validators are implemented
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] Config class is added
- [ ] Imports are correct
