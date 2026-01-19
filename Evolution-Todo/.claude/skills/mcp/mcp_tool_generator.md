# Skill: mcp_tool_generator

## Purpose
Generate MCP (Model Context Protocol) tool definitions with proper schemas and handlers.

## MCP Tool Structure

Every MCP tool consists of:
1. **Input Schema** - Pydantic model defining tool inputs
2. **Output Schema** - Pydantic model defining tool outputs
3. **Handler Function** - Async function that executes the tool
4. **Tool Registration** - Register tool with MCP server

## Template

```python
from mcp.server import Tool
from pydantic import BaseModel, Field
from typing import Optional

# 1. Input Schema
class {ToolName}Input(BaseModel):
    """Input parameters for {tool_name} tool."""
    param1: str = Field(..., description="Description of param1")
    param2: Optional[str] = Field(None, description="Description of param2")

# 2. Output Schema
class {ToolName}Output(BaseModel):
    """Output from {tool_name} tool."""
    result_field: str
    status: str

# 3. Handler Function
async def {tool_name}_handler(input: {ToolName}Input) -> {ToolName}Output:
    """
    Execute the {tool_name} operation.

    Args:
        input: Tool input parameters

    Returns:
        Tool execution result

    Raises:
        ToolError: If operation fails
    """
    # Implementation here
    return {ToolName}Output(...)

# 4. Tool Registration
{tool_name}_tool = Tool(
    name="{tool_name}",
    description="Description of what this tool does",
    input_schema={ToolName}Input.model_json_schema(),
    handler={tool_name}_handler
)
```

## Complete Example: add_task Tool

```python
# mcp_server/tools/add_task.py
from mcp.server import Tool
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ..database import get_db_session
from ..models import Task

# Input Schema
class AddTaskInput(BaseModel):
    """
    Input for creating a new task.

    Attributes:
        user_id: Unique identifier for the user
        title: Task title (1-500 characters)
        description: Optional detailed description (max 2000 characters)
    """
    user_id: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="User identifier who owns this task"
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Task title or summary"
    )

    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Detailed task description"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        }


# Output Schema
class AddTaskOutput(BaseModel):
    """
    Result of task creation.

    Attributes:
        task_id: ID of the newly created task
        status: Operation status ("created")
        title: Title of the created task
    """
    task_id: int = Field(..., description="Unique task identifier")
    status: str = Field(..., description="Operation status")
    title: str = Field(..., description="Task title")

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": 5,
                "status": "created",
                "title": "Buy groceries"
            }
        }


# Handler Function
async def add_task_handler(input: AddTaskInput) -> AddTaskOutput:
    """
    Create a new task for the user.

    This function:
    1. Validates input parameters
    2. Creates task in database
    3. Returns task information

    Args:
        input: AddTaskInput with user_id, title, and optional description

    Returns:
        AddTaskOutput with task_id, status, and title

    Raises:
        DatabaseError: If database operation fails
        ValidationError: If input validation fails

    Example:
        >>> input = AddTaskInput(
        ...     user_id="user123",
        ...     title="Buy groceries",
        ...     description="Milk and eggs"
        ... )
        >>> result = await add_task_handler(input)
        >>> print(result.task_id)
        5
    """
    async with get_db_session() as session:
        # Create task
        task = Task(
            user_id=input.user_id,
            title=input.title.strip(),
            description=input.description.strip() if input.description else None,
            completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Save to database
        session.add(task)
        await session.commit()
        await session.refresh(task)

        # Return result
        return AddTaskOutput(
            task_id=task.id,
            status="created",
            title=task.title
        )


# Tool Registration
add_task_tool = Tool(
    name="add_task",
    description=(
        "Create a new task for the user. "
        "Use this when the user wants to add something to their todo list, "
        "remember something, or create a task."
    ),
    input_schema=AddTaskInput.model_json_schema(),
    handler=add_task_handler
)
```

## Example: list_tasks Tool

```python
# mcp_server/tools/list_tasks.py
from mcp.server import Tool
from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime
from sqlalchemy import select

class TaskItem(BaseModel):
    """Single task item."""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime


class ListTasksInput(BaseModel):
    """Input for listing tasks."""
    user_id: str = Field(..., description="User identifier")
    status: Literal["all", "pending", "completed"] = Field(
        default="all",
        description="Filter by task status: all, pending, or completed"
    )


class ListTasksOutput(BaseModel):
    """List of tasks."""
    tasks: List[TaskItem] = Field(..., description="List of tasks")
    total: int = Field(..., description="Total number of tasks")
    status_filter: str = Field(..., description="Filter applied")


async def list_tasks_handler(input: ListTasksInput) -> ListTasksOutput:
    """
    Retrieve tasks for the user with optional filtering.

    Args:
        input: ListTasksInput with user_id and status filter

    Returns:
        ListTasksOutput with tasks list and metadata
    """
    async with get_db_session() as session:
        # Build query
        query = select(Task).where(Task.user_id == input.user_id)

        # Apply status filter
        if input.status == "pending":
            query = query.where(Task.completed == False)
        elif input.status == "completed":
            query = query.where(Task.completed == True)

        # Order by creation date (newest first)
        query = query.order_by(Task.created_at.desc())

        # Execute query
        result = await session.execute(query)
        tasks = result.scalars().all()

        # Convert to output format
        task_items = [
            TaskItem(
                id=task.id,
                title=task.title,
                description=task.description,
                completed=task.completed,
                created_at=task.created_at,
                updated_at=task.updated_at
            )
            for task in tasks
        ]

        return ListTasksOutput(
            tasks=task_items,
            total=len(task_items),
            status_filter=input.status
        )


list_tasks_tool = Tool(
    name="list_tasks",
    description=(
        "Get a list of tasks for the user. "
        "Can filter by status: all (default), pending, or completed. "
        "Use this when the user wants to see their tasks."
    ),
    input_schema=ListTasksInput.model_json_schema(),
    handler=list_tasks_handler
)
```

## Field Validation Patterns

### Required String Field
```python
name: str = Field(..., min_length=1, max_length=100)
```

### Optional String Field
```python
description: Optional[str] = Field(None, max_length=500)
```

### Enum Field
```python
from typing import Literal

status: Literal["all", "pending", "completed"] = Field(default="all")
```

### Integer with Range
```python
priority: int = Field(..., ge=1, le=5, description="Priority 1-5")
```

### Email Field
```python
from pydantic import EmailStr

email: EmailStr = Field(..., description="User email address")
```

### URL Field
```python
from pydantic import HttpUrl

url: HttpUrl = Field(..., description="Website URL")
```

### List Field
```python
tags: List[str] = Field(default_factory=list, max_items=10)
```

### Nested Model
```python
class Address(BaseModel):
    street: str
    city: str

address: Address = Field(..., description="User address")
```

## Error Handling in Tools

```python
class TaskNotFoundError(Exception):
    """Raised when task is not found."""
    pass


class ValidationError(Exception):
    """Raised when input validation fails."""
    pass


async def complete_task_handler(input: CompleteTaskInput) -> CompleteTaskOutput:
    """Complete a task."""
    async with get_db_session() as session:
        # Find task
        query = select(Task).where(
            Task.id == input.task_id,
            Task.user_id == input.user_id
        )
        result = await session.execute(query)
        task = result.scalar_one_or_none()

        # Handle not found
        if not task:
            raise TaskNotFoundError(
                f"Task {input.task_id} not found for user {input.user_id}"
            )

        # Update task
        task.completed = True
        task.updated_at = datetime.utcnow()
        await session.commit()

        return CompleteTaskOutput(
            task_id=task.id,
            status="completed",
            title=task.title
        )
```

## Tool Description Best Practices

Good tool descriptions help the AI know when to use the tool:

```python
Tool(
    name="add_task",
    description=(
        "Create a new task for the user. "
        "Use this when the user wants to:\n"
        "- Add something to their todo list\n"
        "- Remember something for later\n"
        "- Create a new task or item\n"
        "- Track something they need to do\n"
        "\n"
        "Examples:\n"
        "- 'Add buy groceries to my list'\n"
        "- 'I need to remember to call mom'\n"
        "- 'Create a task for finishing the report'"
    ),
    input_schema=AddTaskInput.model_json_schema(),
    handler=add_task_handler
)
```

## Testing Tools

```python
# tests/test_add_task.py
import pytest
from mcp_server.tools.add_task import (
    add_task_handler,
    AddTaskInput,
    AddTaskOutput
)

@pytest.mark.asyncio
async def test_add_task_success():
    """Test successful task creation."""
    input_data = AddTaskInput(
        user_id="test_user",
        title="Test task",
        description="Test description"
    )

    result = await add_task_handler(input_data)

    assert isinstance(result, AddTaskOutput)
    assert result.status == "created"
    assert result.title == "Test task"
    assert result.task_id > 0


@pytest.mark.asyncio
async def test_add_task_without_description():
    """Test task creation without description."""
    input_data = AddTaskInput(
        user_id="test_user",
        title="Simple task"
    )

    result = await add_task_handler(input_data)

    assert result.status == "created"


@pytest.mark.asyncio
async def test_add_task_validation_error():
    """Test that empty title fails validation."""
    with pytest.raises(ValidationError):
        input_data = AddTaskInput(
            user_id="test_user",
            title=""  # Empty title
        )
```

## Tool Generation Checklist

- [ ] Input schema defined with Pydantic
- [ ] All required fields marked with `...`
- [ ] Optional fields have default values
- [ ] Field descriptions are clear
- [ ] Validation constraints added (min_length, max_length, etc.)
- [ ] Output schema defined
- [ ] Handler function is async
- [ ] Handler has comprehensive docstring
- [ ] Error handling is implemented
- [ ] Database session is properly managed
- [ ] Tool is registered with clear description
- [ ] Examples are provided in docstring
- [ ] Unit tests are written

## Complete Tool File Template

```python
# mcp_server/tools/{tool_name}.py
\"\"\"
{Tool Name} MCP Tool

This tool handles {description}.
\"\"\"
from mcp.server import Tool
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ..database import get_db_session
from ..models import Task  # or relevant model


# Custom Exceptions
class {ToolName}Error(Exception):
    \"\"\"Raised when {tool_name} operation fails.\"\"\"
    pass


# Input Schema
class {ToolName}Input(BaseModel):
    \"\"\"Input parameters for {tool_name}.\"\"\"
    # Fields here

    class Config:
        json_schema_extra = {"example": {...}}


# Output Schema
class {ToolName}Output(BaseModel):
    \"\"\"Output from {tool_name}.\"\"\"
    # Fields here

    class Config:
        json_schema_extra = {"example": {...}}


# Handler
async def {tool_name}_handler(input: {ToolName}Input) -> {ToolName}Output:
    \"\"\"
    {Description of what this handler does}

    Args:
        input: {ToolName}Input with parameters

    Returns:
        {ToolName}Output with results

    Raises:
        {ToolName}Error: If operation fails
    \"\"\"
    async with get_db_session() as session:
        # Implementation
        pass


# Tool Registration
{tool_name}_tool = Tool(
    name="{tool_name}",
    description="Clear description of tool purpose and when to use it",
    input_schema={ToolName}Input.model_json_schema(),
    handler={tool_name}_handler
)
```

This template ensures consistency across all MCP tools!
