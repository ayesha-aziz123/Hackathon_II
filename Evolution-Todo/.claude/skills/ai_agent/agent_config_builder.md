# Skill: agent_config_builder

## Purpose
Configure OpenAI Agents SDK with MCP tools for natural language task management.

## Configuration Components

1. **OpenAI Client** - Initialize API client
2. **Assistant Creation** - Create assistant with tools
3. **Tool Schema Conversion** - Convert MCP tools to OpenAI format
4. **System Instructions** - Define agent behavior
5. **Model Selection** - Choose appropriate GPT model

## Complete Implementation

```python
# backend/agent/config.py
from openai import OpenAI
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os

class AgentConfig(BaseModel):
    """
    Configuration for OpenAI Agents SDK.

    Attributes:
        model: GPT model to use (gpt-4-turbo-preview, gpt-3.5-turbo)
        temperature: Randomness in responses (0.0 - 2.0)
        max_tokens: Maximum response length
        tools: List of MCP tools in OpenAI format
    """
    model: str = "gpt-4-turbo-preview"
    temperature: float = 0.7
    max_tokens: int = 1000
    top_p: float = 1.0


class TodoAgent:
    """
    OpenAI Agent configured for todo task management.

    This agent:
    - Understands natural language commands about tasks
    - Uses MCP tools to manage tasks
    - Maintains conversational context
    - Provides friendly, helpful responses
    """

    def __init__(
        self,
        openai_api_key: str,
        mcp_tools: List[Dict[str, Any]],
        config: Optional[AgentConfig] = None
    ):
        """
        Initialize the Todo Agent.

        Args:
            openai_api_key: OpenAI API key
            mcp_tools: List of MCP tool definitions
            config: Optional agent configuration

        Example:
            >>> agent = TodoAgent(
            ...     openai_api_key="sk-...",
            ...     mcp_tools=[add_task_schema, list_tasks_schema, ...]
            ... )
        """
        self.client = OpenAI(api_key=openai_api_key)
        self.config = config or AgentConfig()
        self.tools = self._convert_mcp_tools_to_openai(mcp_tools)

        # Create assistant
        self.assistant = self._create_assistant()

    def _convert_mcp_tools_to_openai(
        self,
        mcp_tools: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Convert MCP tool schemas to OpenAI function calling format.

        MCP tools use JSON Schema format. OpenAI expects:
        {
            "type": "function",
            "function": {
                "name": "tool_name",
                "description": "Tool description",
                "parameters": {...}  # JSON Schema
            }
        }

        Args:
            mcp_tools: List of MCP tool definitions

        Returns:
            List of tools in OpenAI format

        Example MCP Tool:
            {
                "name": "add_task",
                "description": "Create a new task",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "title": {"type": "string"}
                    },
                    "required": ["user_id", "title"]
                }
            }

        Converted to OpenAI:
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "title": {"type": "string"}
                        },
                        "required": ["user_id", "title"]
                    }
                }
            }
        """
        openai_tools = []

        for mcp_tool in mcp_tools:
            openai_tool = {
                "type": "function",
                "function": {
                    "name": mcp_tool["name"],
                    "description": mcp_tool["description"],
                    "parameters": mcp_tool["input_schema"]
                }
            }
            openai_tools.append(openai_tool)

        return openai_tools

    def _create_assistant(self):
        """
        Create OpenAI assistant with configured tools.

        Returns:
            OpenAI Assistant object
        """
        assistant = self.client.beta.assistants.create(
            name="Todo Task Manager",
            instructions=self._get_system_instructions(),
            tools=self.tools,
            model=self.config.model,
            temperature=self.config.temperature
        )

        return assistant

    def _get_system_instructions(self) -> str:
        """
        Get system instructions for the agent.

        These instructions define the agent's:
        - Personality and tone
        - How to interpret user messages
        - When to use each tool
        - How to respond to users

        Returns:
            System instruction string
        """
        return """You are a helpful task management assistant.

You help users manage their todo lists through natural conversation.

# Your Capabilities

You have access to these tools:
1. add_task - Create a new task
2. list_tasks - Show tasks (all, pending, or completed)
3. complete_task - Mark a task as done
4. delete_task - Remove a task
5. update_task - Modify a task's title or description

# When to Use Each Tool

**add_task**: When user wants to:
- Add something to their list
- Remember something
- Create a task
- Track something to do
Examples: "Add buy milk", "I need to call mom", "Remember to pay bills"

**list_tasks**: When user wants to:
- See their tasks
- Know what to do
- Check their list
- Review completed items
Examples: "What's on my list?", "Show my tasks", "What did I complete?"

**complete_task**: When user says they:
- Finished something
- Completed a task
- Did something
Examples: "I bought the milk", "Finished calling mom", "Done with task 3"

**delete_task**: When user wants to:
- Remove a task
- Cancel something
- Delete an item
Examples: "Delete the milk task", "Remove task 5", "Cancel that"

**update_task**: When user wants to:
- Change a task
- Update details
- Rename something
Examples: "Change task 1 to...", "Update the title to...", "Modify task 3"

# Behavior Guidelines

1. **Be Conversational and Friendly**
   - Use natural language, not technical jargon
   - Keep responses concise but helpful
   - Show empathy and encouragement

2. **Always Confirm Actions**
   - After creating a task: "I've added 'X' to your list"
   - After completing: "Great! I've marked 'X' as complete"
   - After deleting: "I've removed 'X' from your list"

3. **Extract Clear Task Titles**
   - "I need to buy groceries" → title: "Buy groceries"
   - "Call mom tomorrow" → title: "Call mom tomorrow"
   - "Finish the report by Friday" → title: "Finish the report by Friday"

4. **Handle Ambiguity**
   - If unclear, ask for clarification
   - If multiple tasks match, list them and ask which one
   - If task not found, offer to list tasks

5. **Provide Context**
   - When listing tasks, summarize: "You have 3 pending tasks"
   - Mention important details if relevant
   - Offer to help with next steps

# Response Examples

User: "Add buy groceries to my list"
You: "I've added 'Buy groceries' to your task list. Anything else you need to remember?"

User: "What do I need to do?"
You: [calls list_tasks with status="pending"]
"Here are your pending tasks:
1. Buy groceries
2. Call mom
3. Finish report
You have 3 tasks to complete."

User: "I finished the groceries"
You: [calls complete_task]
"Excellent! I've marked 'Buy groceries' as complete. Keep up the good work!"

User: "Delete task 2"
You: [calls delete_task]
"I've removed 'Call mom' from your list."

User: "Change task 1 to buy groceries and fruits"
You: [calls update_task]
"I've updated the task to 'Buy groceries and fruits'."

# Important Notes

- Always include user_id in tool calls (you'll receive this in context)
- Be patient and helpful
- If a tool fails, explain the issue clearly
- Never make up task IDs or information
- Always use tools to perform operations, never pretend
"""

    def get_assistant_id(self) -> str:
        """Get the assistant ID for reuse."""
        return self.assistant.id

    def update_instructions(self, new_instructions: str):
        """
        Update assistant instructions.

        Args:
            new_instructions: New system instructions
        """
        self.client.beta.assistants.update(
            assistant_id=self.assistant.id,
            instructions=new_instructions
        )
```

## Loading MCP Tools

```python
# backend/agent/tool_loader.py
import httpx
from typing import List, Dict, Any

async def load_mcp_tools(mcp_server_url: str) -> List[Dict[str, Any]]:
    """
    Load tool schemas from MCP server.

    Args:
        mcp_server_url: URL of MCP server (e.g., http://localhost:8000)

    Returns:
        List of MCP tool schemas

    Example:
        >>> tools = await load_mcp_tools("http://localhost:8000")
        >>> print(len(tools))
        5
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{mcp_server_url}/tools")
        response.raise_for_status()
        return response.json()["tools"]
```

## Usage Example

```python
# backend/agent/setup.py
import os
from .config import TodoAgent, AgentConfig
from .tool_loader import load_mcp_tools

async def setup_todo_agent() -> TodoAgent:
    """
    Set up the Todo Agent with MCP tools.

    Returns:
        Configured TodoAgent instance
    """
    # Get configuration from environment
    openai_api_key = os.getenv("OPENAI_API_KEY")
    mcp_server_url = os.getenv("MCP_SERVER_URL", "http://localhost:8000")

    # Load MCP tools
    mcp_tools = await load_mcp_tools(mcp_server_url)

    # Create custom configuration
    config = AgentConfig(
        model="gpt-4-turbo-preview",
        temperature=0.7,
        max_tokens=1000
    )

    # Initialize agent
    agent = TodoAgent(
        openai_api_key=openai_api_key,
        mcp_tools=mcp_tools,
        config=config
    )

    print(f"Agent initialized with {len(mcp_tools)} tools")
    print(f"Assistant ID: {agent.get_assistant_id()}")

    return agent


# In your application startup
# agent = await setup_todo_agent()
```

## Environment Configuration

```bash
# .env
OPENAI_API_KEY=sk-your-key-here
MCP_SERVER_URL=http://localhost:8000

# Optional: Reuse existing assistant
ASSISTANT_ID=asst_abc123...
```

## Reusing Existing Assistant

```python
class TodoAgent:
    def __init__(
        self,
        openai_api_key: str,
        mcp_tools: List[Dict[str, Any]],
        config: Optional[AgentConfig] = None,
        assistant_id: Optional[str] = None  # Reuse existing
    ):
        self.client = OpenAI(api_key=openai_api_key)
        self.config = config or AgentConfig()
        self.tools = self._convert_mcp_tools_to_openai(mcp_tools)

        if assistant_id:
            # Reuse existing assistant
            self.assistant = self.client.beta.assistants.retrieve(assistant_id)
        else:
            # Create new assistant
            self.assistant = self._create_assistant()
```

## Testing the Configuration

```python
# tests/test_agent_config.py
import pytest
from backend.agent.config import TodoAgent, AgentConfig

def test_mcp_tool_conversion():
    """Test converting MCP tools to OpenAI format."""
    mcp_tools = [
        {
            "name": "add_task",
            "description": "Create a task",
            "input_schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"}
                },
                "required": ["title"]
            }
        }
    ]

    agent = TodoAgent(
        openai_api_key="test-key",
        mcp_tools=mcp_tools
    )

    assert len(agent.tools) == 1
    assert agent.tools[0]["type"] == "function"
    assert agent.tools[0]["function"]["name"] == "add_task"


def test_custom_config():
    """Test custom agent configuration."""
    config = AgentConfig(
        model="gpt-3.5-turbo",
        temperature=0.5
    )

    assert config.model == "gpt-3.5-turbo"
    assert config.temperature == 0.5
```

## Configuration Best Practices

1. **Model Selection**
   - Use `gpt-4-turbo-preview` for best results
   - Use `gpt-3.5-turbo` for cost savings
   - Test both to find the right balance

2. **Temperature**
   - 0.7 is good for conversational responses
   - Lower (0.3-0.5) for more consistent tool usage
   - Higher (0.8-1.0) for more creative responses

3. **System Instructions**
   - Be specific about when to use each tool
   - Provide clear examples
   - Define the personality you want
   - Include error handling guidance

4. **Tool Schemas**
   - Ensure descriptions are clear
   - Include parameter descriptions
   - Provide examples in descriptions

5. **Reuse Assistants**
   - Store assistant_id in environment/database
   - Reuse to save API calls
   - Update instructions as needed

## Checklist

- [ ] OpenAI API key is configured
- [ ] MCP tools are loaded correctly
- [ ] Tool schemas are converted to OpenAI format
- [ ] System instructions are comprehensive
- [ ] Model and temperature are appropriate
- [ ] Assistant is created successfully
- [ ] Assistant ID is saved for reuse
- [ ] Error handling is implemented
- [ ] Configuration is tested
