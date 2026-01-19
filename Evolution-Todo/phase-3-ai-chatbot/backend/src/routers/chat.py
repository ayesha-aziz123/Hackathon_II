"""
Chat API endpoint for AI-powered task management (Phase III).

This module provides the chat endpoint that integrates TodoAgent
with conversation persistence and SSE streaming.

Endpoint: POST /api/{user_id}/chat
"""

import asyncio
import json
import logging
import os
from typing import AsyncIterator

from agents.run import Runner
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from openai import (
    APIError,
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    InternalServerError,
)
from sqlmodel.ext.asyncio.session import AsyncSession

from src.agent_config.todo_agent import create_todo_agent
from src.auth.jwt import get_current_user
from src.database.connection import get_async_session
from src.schemas.chat import ChatRequest, ChatResponse
from src.models.conversation import Conversation
from src.services.conversation_service import (
    add_message,
    get_conversation_history,
    get_or_create_conversation,
)


# Configure logger
logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0  # seconds
MAX_RETRY_DELAY = 10.0  # seconds


# Create router
router = APIRouter(prefix="/api", tags=["chat"])


async def run_agent_with_retry(
    agent, agent_messages: list, max_retries: int = MAX_RETRIES
):
    """
    Run agent with exponential backoff retry logic for transient errors.

    This function handles:
    - Rate limit errors (429) - Retry with exponential backoff
    - API connection errors - Retry with exponential backoff
    - API timeout errors - Retry with exponential backoff
    - Internal server errors (500, 503) - Retry with exponential backoff

    Args:
        agent: Configured Agent instance
        agent_messages: List of message dictionaries for agent
        max_retries: Maximum number of retry attempts (default 3)

    Returns:
        AsyncIterator: Agent streaming result

    Raises:
        HTTPException: User-friendly error after all retries exhausted
    """
    for attempt in range(max_retries):
        try:
            # Run agent with streaming - this ensures tools are executed properly
            result = Runner.run_streamed(agent, agent_messages)
            return result

        except RateLimitError as e:
            # Rate limit error - retry with exponential backoff
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2**attempt), MAX_RETRY_DELAY)
                logger.warning(
                    f"Rate limit error on attempt {attempt + 1}/{max_retries}. "
                    f"Retrying in {retry_delay}s. Error: {str(e)}"
                )
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error(f"Rate limit error after {max_retries} attempts: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "success": False,
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "The AI service is currently experiencing high demand. Please try again in a moment.",
                        },
                    },
                )

        except (APIConnectionError, APITimeoutError) as e:
            # Network/timeout error - retry with exponential backoff
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2**attempt), MAX_RETRY_DELAY)
                logger.warning(
                    f"Network/timeout error on attempt {attempt + 1}/{max_retries}. "
                    f"Retrying in {retry_delay}s. Error: {str(e)}"
                )
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error(
                    f"Network/timeout error after {max_retries} attempts: {str(e)}"
                )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "success": False,
                        "error": {
                            "code": "NETWORK_ERROR",
                            "message": "Unable to connect to the AI service. Please check your internet connection and try again.",
                        },
                    },
                )

        except InternalServerError as e:
            # API internal server error - retry with exponential backoff
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2**attempt), MAX_RETRY_DELAY)
                logger.warning(
                    f"API server error on attempt {attempt + 1}/{max_retries}. "
                    f"Retrying in {retry_delay}s. Error: {str(e)}"
                )
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error(f"API server error after {max_retries} attempts: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "success": False,
                        "error": {
                            "code": "AI_SERVICE_UNAVAILABLE",
                            "message": "The AI service is temporarily unavailable. Please try again later.",
                        },
                    },
                )

        except APIError as e:
            # Generic API error (includes 401, 403, invalid API key, etc.)
            logger.error(f"API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error": {
                        "code": "AI_SERVICE_ERROR",
                        "message": "An error occurred while processing your request. Please try again.",
                    },
                },
            )

        except ValueError as e:
            # Configuration error (missing API keys, invalid provider)
            logger.error(f"Configuration error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error": {
                        "code": "CONFIGURATION_ERROR",
                        "message": "The AI service is not properly configured. Please contact support.",
                    },
                },
            )

        except Exception as e:
            # Unexpected error
            logger.error(f"Unexpected error running agent: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An unexpected error occurred. Please try again.",
                    },
                },
            )


async def stream_chat_response(
    user_id: str,
    conversation_id: int,
    user_message: str,
    session: AsyncSession,
) -> AsyncIterator[str]:
    """
    Generate SSE stream for chat response.
    """
    try:
        # 1. Fetch conversation history from database
        history_messages = await get_conversation_history(
            session=session,
            user_id=user_id,
            conversation_id=conversation_id,
            limit=50,
        )

        # 2. Build message array for agent
        agent_messages = []

        # Add conversation history
        for msg in history_messages:
            agent_messages.append(
                {
                    "role": msg.role,
                    "content": msg.content,
                }
            )

        # Add new user message
        agent_messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )

        # 3. Store USER message in database
        await add_message(
            session=session,
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=user_message,
            tool_calls=None,
        )

        # 4. Initialize response tracking variables
        assistant_response = ""
        tool_calls_log = []

        # 5. Fetch user info from database
        try:
            from ..services.user_service import UserService
            user_info = await UserService.get_user_by_id(
                db=session,
                user_id=user_id
            )
            user_name = user_info.name if user_info else "User"
            user_email = user_info.email if user_info else ""
        except Exception as e:
            logger.warning(f"Could not fetch user info: {e}")
            user_name = "User"
            user_email = ""

        # 5. Create TodoAgent with user info
        logger.info(f"Running agent for user: {user_name} ({user_email})")

        # Pass user info to agent
        todo_agent = create_todo_agent(
            provider="groq",
            model=os.getenv("GROQ_DEFAULT_MODEL", "llama-3.1-70b-versatile"),
            user_id=user_id,
            user_name=user_name,
            user_email=user_email
        )
        agent = todo_agent.get_agent()

        # 6. Run agent with simplified approach and thinking indicator
        try:
            logger.info(f"Starting MCP server context for user: {user_id}")

            # Skip sending thinking indicator to keep responses concise
            # yield f"data: {json.dumps({'type': 'message', 'content': '🤔 Thinking...', 'done': False})}\n\n"

            async with todo_agent.mcp_server:
                logger.info(f"Running agent with {len(agent_messages)} messages")
                result = await run_agent_with_retry(agent, agent_messages)

                # Process the agent result and collect all responses
                logger.info("Processing agent response...")

                # Collect the full response from the agent by iterating through the streaming result
                full_response = ""

                # Track what we've already sent to avoid duplicates
                sent_content = set()
                seen_events = set()  # Track event IDs/types to prevent processing same event multiple times
                last_sent_content = ""  # Track the last sent content to prevent consecutive duplicates

                # Counter to track consecutive duplicate attempts to prevent infinite loops
                consecutive_duplicate_attempts = 0
                MAX_CONSECUTIVE_DUPLICATE_ATTEMPTS = 5

                # Iterate through all events from the streaming result
                async for event in result.stream_events():
                    try:
                        # Create a unique identifier for this event to prevent processing duplicates
                        event_identifier = str(hash(str(event)))[:10]  # Short hash of event
                        if event_identifier in seen_events:
                            logger.info(f"Skipping duplicate event: {event_identifier}")
                            continue
                        seen_events.add(event_identifier)

                        # Comprehensive logging to identify actual event types
                        logger.info(f"*** EVENT ANALYSIS ***")
                        logger.info(f"Event object type: {type(event)}")
                        logger.info(f"Event object: {event}")

                        # Check if event has various attributes
                        logger.info(f"Has 'type' attribute: {hasattr(event, 'type')}")
                        if hasattr(event, 'type'):
                            logger.info(f"Event.type: {event.type}")

                        logger.info(f"Has 'event' attribute: {hasattr(event, 'event')}")
                        if hasattr(event, 'event'):
                            logger.info(f"Event.event: {event.event}")

                        logger.info(f"Has 'data' attribute: {hasattr(event, 'data')}")
                        if hasattr(event, 'data'):
                            logger.info(f"Event.data type: {type(event.data)}")
                            logger.info(f"Event.data: {event.data}")

                        # Log the event in detail for debugging
                        event_attrs = [attr for attr in dir(event) if not attr.startswith('_')]
                        logger.info(f"Event attributes: {event_attrs}")

                        # Try to convert event to dict if possible
                        try:
                            event_dict = {}
                            for attr in event_attrs:
                                try:
                                    attr_val = getattr(event, attr)
                                    if not callable(attr_val):
                                        event_dict[attr] = str(attr_val)[:200]  # Limit length
                                except:
                                    event_dict[attr] = "<error accessing>"
                            logger.info(f"Event as dict: {event_dict}")
                        except Exception as dict_e:
                            logger.info(f"Could not convert event to dict: {dict_e}")

                        logger.info(f"*** END EVENT ANALYSIS ***")

                        # Handle different types of events based on the logs
                        # From the logs, I can see RawResponsesStreamEvent is being generated

                        # Check if it's a RawResponsesStreamEvent (from the logs I can see this type)
                        event_type_str = str(type(event)).lower()

                        if 'rawresponsesstreamevent' in event_type_str and hasattr(event, 'data'):
                            logger.info("Processing RawResponsesStreamEvent")

                            event_data = event.data
                            logger.info(f"RawResponsesStreamEvent data type: {type(event_data)}")

                            # Handle different types of RawResponsesStreamEvent data
                            if hasattr(event_data, 'type'):
                                data_type = event_data.type
                                logger.info(f"RawResponsesStreamEvent data type: {data_type}")

                                if 'response.output_text.delta' in data_type:
                                    # This is a text delta event
                                    if hasattr(event_data, 'delta'):
                                        delta_text = event_data.delta
                                        if delta_text and isinstance(delta_text, str):
                                            full_response += delta_text
                                            assistant_response += delta_text
                                            logger.info(f"Found text delta from RawResponsesStreamEvent: {delta_text[:100]}...")

                                            # Check if this text contains a tool call JSON that needs to be executed
                                            import re
                                            import json as json_lib
                                            # Look for JSON tool call patterns in the text - looking for tool call format
                                            # Pattern: {"name": "tool_name", ...}
                                            json_pattern = r'\{"name"\s*:\s*"[^"]+"\s*,[^}]*\}'
                                            json_matches = re.findall(json_pattern, delta_text)

                                            for match in json_matches:
                                                try:
                                                    # Clean up the match to make it valid JSON
                                                    clean_match = match.strip()
                                                    tool_call_data = json_lib.loads(clean_match)
                                                    if isinstance(tool_call_data, dict) and 'name' in tool_call_data:
                                                        tool_name = tool_call_data['name']
                                                        tool_args = tool_call_data.get('parameters', tool_call_data.get('arguments', {}))

                                                        # Log and execute the tool call
                                                        tool_calls_log.append({"tool": tool_name, "args": tool_args})
                                                        logger.info(f"✅ Detected and executing tool call from text: {tool_name}, Args: {tool_args}")

                                                        # Send tool call data to frontend
                                                        tool_call_data_response = {
                                                            "type": "tool_call",
                                                            "tool": tool_name,
                                                            "args": tool_args,
                                                        }
                                                        yield f"data: {json.dumps(tool_call_data_response)}\n\n"
                                                except json_lib.JSONDecodeError:
                                                    # Not a valid JSON, continue
                                                    pass

                                            # Skip sending if it's a duplicate
                                            content_hash = hash(delta_text.strip())
                                            if content_hash in sent_content:
                                                logger.info(f"Skipping duplicate content: {delta_text[:50]}...")
                                                continue

                                            # Skip if contains unwanted patterns
                                            SKIP_PATTERNS = [
                                                'thinking', 'reasoning', 'nameadd_task',
                                                'namelist_tasks', 'user_id', 'task_id',
                                                'add [task]', 'create [task]', 'remind me to [task]',
                                                'show tasks', 'list tasks', 'what\'s on my list',
                                                'show pending', 'what\'s left', 'complete task [id]',
                                                'mark [id] done', 'delete task [id]', 'remove [id]',
                                                'update task [id]', 'instructions', 'instruction',
                                                'tool usage rules', 'response rules', 'response templates',
                                                'formatting', 'examples', 'critical', 'user information',
                                                'user name:', 'user email:', 'user id:','thinking', 'reasoning', 'according to', 'we must',
                                                'har jawab', 'bilkul same', 'zyada mat', 'bas itna hi', 'repeat nahi', 'final jawab', 'we need to','internal thought', 'reasoning:', 'analysis:'
                                            ]

                                            if any(pattern.lower() in delta_text.lower() for pattern in SKIP_PATTERNS):
                                                logger.info(f"Skipping content with unwanted pattern: {delta_text[:50]}...")
                                                continue

                                            # Skip if it looks like internal agent instructions or metadata
                                            text_lower = delta_text.lower().strip()
                                            if any(skip_word in text_lower for skip_word in
                                                   ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                    'update_task', 'set_priority', 'list_tasks_by_priority',
                                                    'instructions', 'tool usage', 'response rules', 'templates']):
                                                logger.info(f"Skipping internal instruction content: {delta_text[:50]}...")
                                                continue

                                            # Skip if too short
                                            if len(delta_text.strip()) < 3:
                                                continue

                                            # Add to sent set
                                            sent_content.add(content_hash)

                                            # Enhanced tool call data with additional metadata
                                            yield f"data: {json.dumps({'type': 'message', 'content': delta_text, 'done': False})}\n\n"

                                elif 'response.output_item.done' in data_type:
                                    # This is when an output item is completed
                                    if hasattr(event_data, 'item'):
                                        item = event_data.item
                                        if hasattr(item, 'content') and isinstance(item.content, list):
                                            for content_item in item.content:
                                                if hasattr(content_item, 'text'):
                                                    text_content = content_item.text
                                                    if text_content and isinstance(text_content, str):
                                                        full_response += text_content
                                                        assistant_response += text_content
                                                        logger.info(f"Found content from done item: {text_content[:100]}...")

                                                        # Check if this text contains a tool call JSON that needs to be executed
                                                        import re
                                                        import json as json_lib
                                                        # Look for JSON tool call patterns in the text - looking for tool call format
                                                        # Pattern: {"name": "tool_name", ...}
                                                        json_pattern = r'\{"name"\s*:\s*"[^"]+"\s*,[^}]*\}'
                                                        json_matches = re.findall(json_pattern, text_content)

                                                        for match in json_matches:
                                                            try:
                                                                # Clean up the match to make it valid JSON
                                                                clean_match = match.strip()
                                                                # Validate that it starts and ends with braces
                                                                if clean_match.startswith('{') and clean_match.endswith('}'):
                                                                    tool_call_data = json_lib.loads(clean_match)
                                                                    if isinstance(tool_call_data, dict) and 'name' in tool_call_data:
                                                                        tool_name = tool_call_data['name']
                                                                        tool_args = tool_call_data.get('parameters', tool_call_data.get('arguments', {}))

                                                                        # Log and execute the tool call
                                                                        tool_calls_log.append({"tool": tool_name, "args": tool_args})
                                                                        logger.info(f"✅ Detected and executing tool call from text: {tool_name}, Args: {tool_args}")

                                                                        # Send tool call data to frontend
                                                                        tool_call_data_response = {
                                                                            "type": "tool_call",
                                                                            "tool": tool_name,
                                                                            "args": tool_args,
                                                                        }
                                                                        yield f"data: {json.dumps(tool_call_data_response)}\n\n"
                                                            except (json_lib.JSONDecodeError, TypeError, KeyError):
                                                                # Not a valid JSON or not a proper tool call format, continue
                                                                pass

                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_content.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if contains unwanted patterns
                                                        SKIP_PATTERNS = [
                                                    'thinking', 'reasoning', 'nameadd_task', 'namelist_tasks', 'user_id', 'task_id',
                                                    'add [task]', 'create [task]', 'remind me to [task]', 'show tasks', 'list tasks',
                                                    'what\'s on my list', 'show pending', 'what\'s left', 'complete task [id]',
                                                    'mark [id] done', 'delete task [id]', 'remove [id]', 'update task [id]',
                                                    'instructions', 'instruction', 'tool usage rules', 'response rules',
                                                    'response templates', 'formatting', 'examples', 'critical', 'user information',
                                                    'user name:', 'user email:', 'user id:', 'we must', 'according to', 'should not',
                                                    'must use', 'must call', 'the user', 'the assistant', 'rule says', 'har jawab',
                                                    'bilkul same', 'zyada mat', 'bas itna hi', 'repeat nahi', 'final jawab'  # New additions for your issues
                                                ]

                                                        if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_content.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates']):
                                                            logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if too short
                                                        if len(text_content.strip()) < 3:
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)

                                                        # Only send appropriate content
                                                        if text_content.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"

                                elif 'response.content_part.added' in data_type:
                                    # Content part added event
                                    if hasattr(event_data, 'part') and hasattr(event_data.part, 'text'):
                                        text_content = event_data.part.text
                                        if text_content and isinstance(text_content, str):
                                            full_response += text_content
                                            assistant_response += text_content
                                            logger.info(f"Found content from part: {text_content[:100]}...")

                                            # Check if this text contains a tool call JSON that needs to be executed
                                            import re
                                            import json as json_lib
                                            # Look for JSON tool call patterns in the text - looking for tool call format
                                            # Pattern: {"name": "tool_name", ...}
                                            json_pattern = r'\{"name"\s*:\s*"[^"]+"\s*,[^}]*\}'
                                            json_matches = re.findall(json_pattern, text_content)

                                            for match in json_matches:
                                                try:
                                                    # Clean up the match to make it valid JSON
                                                    clean_match = match.strip()
                                                    tool_call_data = json_lib.loads(clean_match)
                                                    if isinstance(tool_call_data, dict) and 'name' in tool_call_data:
                                                        tool_name = tool_call_data['name']
                                                        tool_args = tool_call_data.get('parameters', tool_call_data.get('arguments', {}))

                                                        # Log and execute the tool call
                                                        tool_calls_log.append({"tool": tool_name, "args": tool_args})
                                                        logger.info(f"✅ Detected and executing tool call from text: {tool_name}, Args: {tool_args}")

                                                        # Send tool call data to frontend
                                                        tool_call_data_response = {
                                                            "type": "tool_call",
                                                            "tool": tool_name,
                                                            "args": tool_args,
                                                        }
                                                        yield f"data: {json.dumps(tool_call_data_response)}\n\n"
                                                except json_lib.JSONDecodeError:
                                                    # Not a valid JSON, continue
                                                    pass

                                            # Skip sending if it's a duplicate
                                            content_hash = hash(text_content.strip())
                                            if content_hash in sent_content:
                                                logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                continue

                                            # Skip if contains unwanted patterns
                                            SKIP_PATTERNS = [
                                                'thinking', 'reasoning', 'nameadd_task',
                                                'namelist_tasks', 'user_id', 'task_id',
                                                'add [task]', 'create [task]', 'remind me to [task]',
                                                'show tasks', 'list tasks', 'what\'s on my list',
                                                'show pending', 'what\'s left', 'complete task [id]',
                                                'mark [id] done', 'delete task [id]', 'remove [id]',
                                                'update task [id]', 'instructions', 'instruction',
                                                'tool usage rules', 'response rules', 'response templates',
                                                'formatting', 'examples', 'critical', 'user information',
                                                'user name:', 'user email:', 'user id:'
                                            ]

                                            if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                continue

                                            # Skip if it looks like internal agent instructions or metadata
                                            text_lower = text_content.lower().strip()
                                            if any(skip_word in text_lower for skip_word in
                                                   ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                    'update_task', 'set_priority', 'list_tasks_by_priority',
                                                    'instructions', 'tool usage', 'response rules', 'templates']):
                                                logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                continue

                                            # Skip if too short
                                            if len(text_content.strip()) < 3:
                                                continue

                                            # Add to sent set
                                            sent_content.add(content_hash)

                                            # Only send appropriate content
                                            if text_content.strip():  # Only send non-empty content
                                                yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"

                                elif 'response.completed' in data_type:
                                    # Response completed event
                                    logger.info("Response completed event received")

                        # Handle run_item_stream_event - this is what we saw in the logs
                        elif hasattr(event, 'type') and event.type == 'run_item_stream_event':
                            logger.info("Processing run_item_stream_event")

                            # Check if event has 'item' attribute (which is a MessageOutputItem)
                            if hasattr(event, 'item'):
                                item = event.item
                                logger.info(f"Event item type: {type(item)}")

                                # If it's a MessageOutputItem, the text is in raw_item.content
                                if hasattr(item, 'raw_item'):
                                    raw_item = item.raw_item
                                    logger.info(f"Raw item type: {type(raw_item)}")

                                    # The content is in raw_item.content array
                                    if hasattr(raw_item, 'content') and isinstance(raw_item.content, list):
                                        for content_item in raw_item.content:
                                            if hasattr(content_item, 'text'):
                                                text_content = content_item.text
                                                if text_content and isinstance(text_content, str):
                                                    full_response += text_content
                                                    assistant_response += text_content
                                                    logger.info(f"Found text content from MessageOutputItem: {text_content[:100]}...")

                                                    # Check if this text contains a tool call JSON that needs to be executed
                                                    import re
                                                    import json as json_lib
                                                    # Look for JSON tool call patterns in the text - looking for tool call format
                                                    # Pattern: {"name": "tool_name", ...}
                                                    json_pattern = r'\{"name"\s*:\s*"[^"]+"\s*,[^}]*\}'
                                                    json_matches = re.findall(json_pattern, text_content)

                                                    for match in json_matches:
                                                        try:
                                                            # Clean up the match to make it valid JSON
                                                            clean_match = match.strip()
                                                            # Validate that it starts and ends with braces
                                                            if clean_match.startswith('{') and clean_match.endswith('}'):
                                                                tool_call_data = json_lib.loads(clean_match)
                                                                if isinstance(tool_call_data, dict) and 'name' in tool_call_data:
                                                                    tool_name = tool_call_data['name']
                                                                    tool_args = tool_call_data.get('parameters', tool_call_data.get('arguments', {}))

                                                                    # Log and execute the tool call
                                                                    tool_calls_log.append({"tool": tool_name, "args": tool_args})
                                                                    logger.info(f"✅ Detected and executing tool call from text: {tool_name}, Args: {tool_args}")

                                                                    # Send tool call data to frontend
                                                                    tool_call_data_response = {
                                                                        "type": "tool_call",
                                                                        "tool": tool_name,
                                                                        "args": tool_args,
                                                                    }
                                                                    yield f"data: {json.dumps(tool_call_data_response)}\n\n"
                                                        except (json_lib.JSONDecodeError, TypeError, KeyError):
                                                            # Not a valid JSON or not a proper tool call format, continue
                                                            pass

                                                    # AGGRESSIVE CONTENT PROCESSING - Handle heavily concatenated responses
                                                    import re

                                                    # First, let's try to split the content by common sentence starters and patterns
                                                    # This handles cases where multiple responses are concatenated together
                                                    segments = []

                                                    # Split on common response patterns that indicate separate responses
                                                    # Split on patterns that look like: "Hi [name]!", "Your name is", "Added", "Marked", etc.
                                                    split_patterns = [
                                                        r'(?=Hi [^!]*!|Your name is|Added|Marked|Deleted|You\'re)',
                                                        r'(?=what is my name|who am I|show my tasks|add task|complete task|delete task)'
                                                    ]

                                                    # Try to split the content based on response patterns
                                                    temp_segments = [text_content]
                                                    for pattern in split_patterns:
                                                        new_segments = []
                                                        for seg in temp_segments:
                                                            # Split on the pattern but keep the delimiter at the start of each segment
                                                            parts = re.split(pattern, seg)
                                                            if len(parts) > 1:
                                                                # Reconstruct with pattern at the start of each segment
                                                                reconstructed = []
                                                                if parts[0].strip():
                                                                    reconstructed.append(parts[0])

                                                                for i in range(1, len(parts)):
                                                                    if parts[i].strip():
                                                                        reconstructed.append(parts[i])
                                                                new_segments.extend(reconstructed)
                                                            else:
                                                                new_segments.append(seg)
                                                        temp_segments = new_segments

                                                    segments = temp_segments

                                                    # Now process each segment individually
                                                    for segment in segments:
                                                        segment = segment.strip()
                                                        if not segment:
                                                            continue

                                                        # Check if this segment is a clean, appropriate response
                                                        # Clean greetings
                                                        if re.search(r'Hi [^!]*?!.*(?:How can I help|tasks)', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Hi [^!]*?!.*?(?:How can I help with your tasks\?|$)', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean name responses
                                                        elif re.search(r'Your name is', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Your name is [^!.?]*?and your email is [^!.?]*?\.|Your name is [^!.?]*?\.|Your name is [^!.?]*?and your email is [^!.?]*', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean task responses
                                                        elif re.search(r'Added|Marked|Deleted', segment, re.IGNORECASE):
                                                            # Look for task operation patterns
                                                            task_patterns = [
                                                                r'Added \'[^\']*?\' to your tasks!',
                                                                r'Marked \'[^\']*?\' as complete!',
                                                                r'Deleted \'[^\']*?\'!',
                                                                r'Updated \'[^\']*?\'!'
                                                            ]

                                                            for pattern in task_patterns:
                                                                matches = re.findall(pattern, segment, re.IGNORECASE)
                                                                for match in matches:
                                                                    clean_resp = match.strip()
                                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                        # Skip sending if it's a duplicate
                                                                        resp_hash = hash(clean_resp)
                                                                        if resp_hash in sent_content:
                                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Skip if it looks like the same as last sent content
                                                                        if clean_resp == last_sent_content:
                                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Add to sent set
                                                                        sent_content.add(resp_hash)
                                                                        last_sent_content = clean_resp

                                                                        # Only send appropriate content
                                                                        if clean_resp.strip():  # Only send non-empty content
                                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean identity responses
                                                        elif re.search(r'You\'re', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'You\'re [^!.?]*?\([^)]*?\)\.|You\'re [^!.?]*?\.', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"
                                                        # Original handling for single content pieces when no clean patterns are found
                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_content.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if text_content.strip() == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {text_content[:50]}...")
                                                            continue

                                                        # Define content filters - More comprehensive to prevent instruction leakage
                                                        SKIP_PATTERNS = [
                                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                            'output:', 'response:', 'content:', 'delta:',
                                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                            'add [task]', 'create [task]', 'remind me to [task]',
                                                            'show tasks', 'list tasks', 'what\'s on my list',
                                                            'show pending', 'what\'s left', 'complete task [id]',
                                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                                            'update task [id]', 'instructions', 'instruction',
                                                            'tool usage rules', 'response rules', 'response templates',
                                                            'formatting', 'examples', 'critical', 'user information',
                                                            'user name:', 'user email:', 'user id:',
                                                            'when user asks', 'when user says', 'response rules',
                                                            'response templates', 'formattings', 'examples:', 'user information',
                                                            'agent instructions', 'you are a', 'this is a', 'we need to',
                                                            'according to', 'there is', 'to do this', 'for this', 'the user',
                                                            '## ', 'user:', 'you:', 'user said', 'user message',
                                                            'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                            'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                            'call delete_task', 'call update_task', 'call set_priority',
                                                            'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                            'update_task', 'set_priority', 'list_tasks_by_priority'
                                                        ]

                                                        # Skip if contains unwanted patterns
                                                        if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                            continue

                                                        # Skip if too short (likely fragment)
                                                        if len(text_content.strip()) < 3:
                                                            continue

                                                        # Skip if looks like JSON
                                                        if text_content.strip().startswith('{') or text_content.strip().startswith('['):
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_content.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates',
                                                                'you are a', 'when user', 'tool usage rules', 'response rules',
                                                                'response templates', 'formattings', 'examples', 'user information',
                                                                'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                            logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like it's part of agent instructions rather than actual response
                                                        if any(skip_phrase in text_content.lower() for skip_phrase in
                                                               ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                                'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                            logger.info(f"Skipping instruction template content: {text_content[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)
                                                        last_sent_content = text_content.strip()

                                                        # Only send appropriate content
                                                        if text_content.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"
                                                        # Original handling for single content pieces
                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_content.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if text_content.strip() == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {text_content[:50]}...")
                                                            continue

                                                        # Define content filters - More comprehensive to prevent instruction leakage
                                                        SKIP_PATTERNS = [
                                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                            'output:', 'response:', 'content:', 'delta:',
                                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                            'add [task]', 'create [task]', 'remind me to [task]',
                                                            'show tasks', 'list tasks', 'what\'s on my list',
                                                            'show pending', 'what\'s left', 'complete task [id]',
                                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                                            'update task [id]', 'instructions', 'instruction',
                                                            'tool usage rules', 'response rules', 'response templates',
                                                            'formatting', 'examples', 'critical', 'user information',
                                                            'user name:', 'user email:', 'user id:',
                                                            'when user asks', 'when user says', 'response rules',
                                                            'response templates', 'formattings', 'examples:', 'user information',
                                                            'agent instructions', 'you are a', 'this is a', 'we need to',
                                                            'according to', 'there is', 'to do this', 'for this', 'the user',
                                                            '## ', 'user:', 'you:', 'user said', 'user message',
                                                            'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                            'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                            'call delete_task', 'call update_task', 'call set_priority',
                                                            'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                            'update_task', 'set_priority', 'list_tasks_by_priority'
                                                        ]

                                                        # Skip if contains unwanted patterns
                                                        if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                            continue

                                                        # Skip if too short (likely fragment)
                                                        if len(text_content.strip()) < 3:
                                                            continue

                                                        # Skip if looks like JSON
                                                        if text_content.strip().startswith('{') or text_content.strip().startswith('['):
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_content.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates',
                                                                'you are a', 'when user', 'tool usage rules', 'response rules',
                                                                'response templates', 'formattings', 'examples', 'user information',
                                                                'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                            logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like it's part of agent instructions rather than actual response
                                                        if any(skip_phrase in text_content.lower() for skip_phrase in
                                                               ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                                'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                            logger.info(f"Skipping instruction template content: {text_content[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)
                                                        last_sent_content = text_content.strip()

                                                        # Only send appropriate content
                                                        if text_content.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"

                                    # Also check for annotations in case that has text
                                    if hasattr(raw_item, 'content') and isinstance(raw_item.content, list):
                                        for content_item in raw_item.content:
                                            if hasattr(content_item, 'annotations'):
                                                # Sometimes annotations might contain additional info
                                                pass

                        # Handle event.event dict format (backup)
                        elif hasattr(event, 'event') and isinstance(event.event, dict):
                            actual_event = event.event
                            event_type = actual_event.get('type', 'unknown')
                            logger.debug(f"Dict event type: {event_type}")

                            # Look for text content in various locations
                            if 'response' in event_type and 'output_item' in event_type:
                                if 'added' in event_type and 'data' in actual_event:
                                    data = actual_event['data']
                                    if 'outputs' in data:
                                        for output in data['outputs']:
                                            if output.get('type') == 'text':
                                                text_content = output.get('text', '')
                                                if text_content:
                                                    full_response += text_content
                                                    assistant_response += text_content
                                                    logger.info(f"Found output text: {text_content[:100]}...")
                                                    # AGGRESSIVE CONTENT PROCESSING - Handle heavily concatenated responses
                                                    import re

                                                    # First, let's try to split the content by common sentence starters and patterns
                                                    # This handles cases where multiple responses are concatenated together
                                                    segments = []

                                                    # Split on common response patterns that indicate separate responses
                                                    # Split on patterns that look like: "Hi [name]!", "Your name is", "Added", "Marked", etc.
                                                    split_patterns = [
                                                        r'(?=Hi [^!]*!|Your name is|Added|Marked|Deleted|You\'re)',
                                                        r'(?=what is my name|who am I|show my tasks|add task|complete task|delete task)'
                                                    ]

                                                    # Try to split the content based on response patterns
                                                    temp_segments = [text_content]
                                                    for pattern in split_patterns:
                                                        new_segments = []
                                                        for seg in temp_segments:
                                                            # Split on the pattern but keep the delimiter at the start of each segment
                                                            parts = re.split(pattern, seg)
                                                            if len(parts) > 1:
                                                                # Reconstruct with pattern at the start of each segment
                                                                reconstructed = []
                                                                if parts[0].strip():
                                                                    reconstructed.append(parts[0])

                                                                for i in range(1, len(parts)):
                                                                    if parts[i].strip():
                                                                        reconstructed.append(parts[i])
                                                                new_segments.extend(reconstructed)
                                                            else:
                                                                new_segments.append(seg)
                                                        temp_segments = new_segments

                                                    segments = temp_segments

                                                    # Now process each segment individually
                                                    for segment in segments:
                                                        segment = segment.strip()
                                                        if not segment:
                                                            continue

                                                        # Check if this segment is a clean, appropriate response
                                                        # Clean greetings
                                                        if re.search(r'Hi [^!]*?!.*(?:How can I help|tasks)', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Hi [^!]*?!.*?(?:How can I help with your tasks\?|$)', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean name responses
                                                        elif re.search(r'Your name is', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Your name is [^!.?]*?and your email is [^!.?]*?\.|Your name is [^!.?]*?\.|Your name is [^!.?]*?and your email is [^!.?]*', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean task responses
                                                        elif re.search(r'Added|Marked|Deleted', segment, re.IGNORECASE):
                                                            # Look for task operation patterns
                                                            task_patterns = [
                                                                r'Added \'[^\']*?\' to your tasks!',
                                                                r'Marked \'[^\']*?\' as complete!',
                                                                r'Deleted \'[^\']*?\'!',
                                                                r'Updated \'[^\']*?\'!'
                                                            ]

                                                            for pattern in task_patterns:
                                                                matches = re.findall(pattern, segment, re.IGNORECASE)
                                                                for match in matches:
                                                                    clean_resp = match.strip()
                                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                        # Skip sending if it's a duplicate
                                                                        resp_hash = hash(clean_resp)
                                                                        if resp_hash in sent_content:
                                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Skip if it looks like the same as last sent content
                                                                        if clean_resp == last_sent_content:
                                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Add to sent set
                                                                        sent_content.add(resp_hash)
                                                                        last_sent_content = clean_resp

                                                                        # Only send appropriate content
                                                                        if clean_resp.strip():  # Only send non-empty content
                                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean identity responses
                                                        elif re.search(r'You\'re', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'You\'re [^!.?]*?\([^)]*?\)\.|You\'re [^!.?]*?\.', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"
                                                        # Original handling for single content pieces when no clean patterns are found
                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_content.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if text_content.strip() == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {text_content[:50]}...")
                                                            continue

                                                        # Define content filters - More comprehensive to prevent instruction leakage
                                                        SKIP_PATTERNS = [
                                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                            'output:', 'response:', 'content:', 'delta:',
                                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                            'add [task]', 'create [task]', 'remind me to [task]',
                                                            'show tasks', 'list tasks', 'what\'s on my list',
                                                            'show pending', 'what\'s left', 'complete task [id]',
                                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                                            'update task [id]', 'instructions', 'instruction',
                                                            'tool usage rules', 'response rules', 'response templates',
                                                            'formatting', 'examples', 'critical', 'user information',
                                                            'user name:', 'user email:', 'user id:',
                                                            'when user asks', 'when user says', 'response rules',
                                                            'response templates', 'formattings', 'examples:', 'user information',
                                                            'agent instructions', 'you are a', 'this is a', 'we need to',
                                                            'according to', 'there is', 'to do this', 'for this', 'the user',
                                                            '## ', 'user:', 'you:', 'user said', 'user message',
                                                            'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                            'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                            'call delete_task', 'call update_task', 'call set_priority',
                                                            'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                            'update_task', 'set_priority', 'list_tasks_by_priority'
                                                        ]

                                                        # Skip if contains unwanted patterns
                                                        if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                            continue

                                                        # Skip if too short (likely fragment)
                                                        if len(text_content.strip()) < 3:
                                                            continue

                                                        # Skip if looks like JSON
                                                        if text_content.strip().startswith('{') or text_content.strip().startswith('['):
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_content.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates',
                                                                'you are a', 'when user', 'tool usage rules', 'response rules',
                                                                'response templates', 'formattings', 'examples', 'user information',
                                                                'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                            logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like it's part of agent instructions rather than actual response
                                                        if any(skip_phrase in text_content.lower() for skip_phrase in
                                                               ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                                'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                            logger.info(f"Skipping instruction template content: {text_content[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)
                                                        last_sent_content = text_content.strip()

                                                        # Only send appropriate content
                                                        if text_content.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"
                                                        # Original handling for single content pieces
                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_content.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if text_content.strip() == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {text_content[:50]}...")
                                                            continue

                                                        # Define content filters - More comprehensive to prevent instruction leakage
                                                        SKIP_PATTERNS = [
                                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                            'output:', 'response:', 'content:', 'delta:',
                                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                            'add [task]', 'create [task]', 'remind me to [task]',
                                                            'show tasks', 'list tasks', 'what\'s on my list',
                                                            'show pending', 'what\'s left', 'complete task [id]',
                                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                                            'update task [id]', 'instructions', 'instruction',
                                                            'tool usage rules', 'response rules', 'response templates',
                                                            'formatting', 'examples', 'critical', 'user information',
                                                            'user name:', 'user email:', 'user id:',
                                                            'when user asks', 'when user says', 'response rules',
                                                            'response templates', 'formattings', 'examples:', 'user information',
                                                            'agent instructions', 'you are a', 'this is a', 'we need to',
                                                            'according to', 'there is', 'to do this', 'for this', 'the user',
                                                            '## ', 'user:', 'you:', 'user said', 'user message',
                                                            'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                            'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                            'call delete_task', 'call update_task', 'call set_priority',
                                                            'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                            'update_task', 'set_priority', 'list_tasks_by_priority'
                                                        ]

                                                        # Skip if contains unwanted patterns
                                                        if any(pattern.lower() in text_content.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_content[:50]}...")
                                                            continue

                                                        # Skip if too short (likely fragment)
                                                        if len(text_content.strip()) < 3:
                                                            continue

                                                        # Skip if looks like JSON
                                                        if text_content.strip().startswith('{') or text_content.strip().startswith('['):
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_content.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates',
                                                                'you are a', 'when user', 'tool usage rules', 'response rules',
                                                                'response templates', 'formattings', 'examples', 'user information',
                                                                'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                            logger.info(f"Skipping internal instruction content: {text_content[:50]}...")
                                                            continue

                                                        # Skip if it looks like it's part of agent instructions rather than actual response
                                                        if any(skip_phrase in text_content.lower() for skip_phrase in
                                                               ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                                'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                            logger.info(f"Skipping instruction template content: {text_content[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)
                                                        last_sent_content = text_content.strip()

                                                        # Only send appropriate content
                                                        if text_content.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_content, 'done': False})}\n\n"

                            elif 'response' in event_type and 'content_part' in event_type:
                                if 'added' in event_type and 'data' in actual_event:
                                    partial_text = actual_event['data'].get('partial_text', '')
                                    if partial_text:
                                        full_response += partial_text
                                        assistant_response += partial_text
                                        logger.info(f"Found partial text: {partial_text[:100]}...")

                                        # Skip sending if it's a duplicate
                                        content_hash = hash(partial_text.strip())
                                        if content_hash in sent_content:
                                            logger.info(f"Skipping duplicate content: {partial_text[:50]}...")
                                            continue

                                        # Define content filters - More comprehensive to prevent instruction leakage
                                        SKIP_PATTERNS = [
                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                            'output:', 'response:', 'content:', 'delta:',
                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                            'add [task]', 'create [task]', 'remind me to [task]',
                                            'show tasks', 'list tasks', 'what\'s on my list',
                                            'show pending', 'what\'s left', 'complete task [id]',
                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                            'update task [id]', 'instructions', 'instruction',
                                            'tool usage rules', 'response rules', 'response templates',
                                            'formatting', 'examples', 'critical', 'user information',
                                            'user name:', 'user email:', 'user id:'
                                        ]

                                        # Skip if contains unwanted patterns
                                        if any(pattern.lower() in partial_text.lower() for pattern in SKIP_PATTERNS):
                                            logger.info(f"Skipping content with unwanted pattern: {partial_text[:50]}...")
                                            continue

                                        # Skip if it looks like internal agent instructions or metadata
                                        text_lower = partial_text.lower().strip()
                                        if any(skip_word in text_lower for skip_word in
                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                'instructions', 'tool usage', 'response rules', 'templates']):
                                            logger.info(f"Skipping internal instruction content: {partial_text[:50]}...")
                                            continue

                                        # Skip if too short (likely fragment)
                                        if len(partial_text.strip()) < 3:
                                            continue

                                        # Skip if looks like JSON
                                        if partial_text.strip().startswith('{') or partial_text.strip().startswith('['):
                                            continue

                                        # Add to sent set
                                        sent_content.add(content_hash)

                                        # Only send appropriate content
                                        if partial_text.strip():  # Only send non-empty content
                                            yield f"data: {json.dumps({'type': 'message', 'content': partial_text, 'done': False})}\n\n"

                            elif 'text' in event_type.lower() and 'data' in actual_event:
                                data = actual_event['data']
                                if 'content' in data:
                                    content_items = data['content']
                                    for item in content_items:
                                        if isinstance(item, dict) and item.get('type') == 'text':
                                            text_val = item.get('text', '')
                                            if text_val:
                                                full_response += text_val
                                                assistant_response += text_val
                                                logger.info(f"Found content text: {text_val[:100]}...")

                                                # Skip sending if it's a duplicate
                                                content_hash = hash(text_val.strip())
                                                if content_hash in sent_content:
                                                    logger.info(f"Skipping duplicate content: {text_val[:50]}...")
                                                    continue

                                                # Define content filters - More comprehensive to prevent instruction leakage
                                                SKIP_PATTERNS = [
                                                    'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                    'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                    '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                    'output:', 'response:', 'content:', 'delta:',
                                                    'text:', 'role:', 'message:', 'data:', 'event:',
                                                    'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                    'add [task]', 'create [task]', 'remind me to [task]',
                                                    'show tasks', 'list tasks', 'what\'s on my list',
                                                    'show pending', 'what\'s left', 'complete task [id]',
                                                    'mark [id] done', 'delete task [id]', 'remove [id]',
                                                    'update task [id]', 'instructions', 'instruction',
                                                    'tool usage rules', 'response rules', 'response templates',
                                                    'formatting', 'examples', 'critical', 'user information',
                                                    'user name:', 'user email:', 'user id:'
                                                ]

                                                # Skip if contains unwanted patterns
                                                if any(pattern.lower() in text_val.lower() for pattern in SKIP_PATTERNS):
                                                    logger.info(f"Skipping content with unwanted pattern: {text_val[:50]}...")
                                                    continue

                                                # Skip if it looks like internal agent instructions or metadata
                                                text_lower = text_val.lower().strip()
                                                if any(skip_word in text_lower for skip_word in
                                                       ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                        'update_task', 'set_priority', 'list_tasks_by_priority',
                                                        'instructions', 'tool usage', 'response rules', 'templates']):
                                                    logger.info(f"Skipping internal instruction content: {text_val[:50]}...")
                                                    continue

                                                # Skip if too short (likely fragment)
                                                if len(text_val.strip()) < 3:
                                                    continue

                                                # Skip if looks like JSON
                                                if text_val.strip().startswith('{') or text_val.strip().startswith('['):
                                                    continue

                                                # Add to sent set
                                                sent_content.add(content_hash)

                                                # Only send appropriate content
                                                if text_val.strip():  # Only send non-empty content
                                                    yield f"data: {json.dumps({'type': 'message', 'content': text_val, 'done': False})}\n\n"

                                elif 'delta' in data:
                                    delta = data['delta']
                                    if 'content' in delta:
                                        content_items = delta['content']
                                        for item in content_items:
                                            if isinstance(item, dict) and item.get('type') == 'text':
                                                text_val = item.get('text', '')
                                                if text_val:
                                                    full_response += text_val
                                                    assistant_response += text_val
                                                    logger.info(f"Found delta text: {text_val[:100]}...")

                                                    # AGGRESSIVE CONTENT PROCESSING - Handle heavily concatenated responses
                                                    import re

                                                    # First, let's try to split the content by common sentence starters and patterns
                                                    # This handles cases where multiple responses are concatenated together
                                                    segments = []

                                                    # Split on common response patterns that indicate separate responses
                                                    # Split on patterns that look like: "Hi [name]!", "Your name is", "Added", "Marked", etc.
                                                    split_patterns = [
                                                        r'(?=Hi [^!]*!|Your name is|Added|Marked|Deleted|You\'re)',
                                                        r'(?=what is my name|who am I|show my tasks|add task|complete task|delete task)'
                                                    ]

                                                    # Try to split the content based on response patterns
                                                    temp_segments = [text_val]
                                                    for pattern in split_patterns:
                                                        new_segments = []
                                                        for seg in temp_segments:
                                                            # Split on the pattern but keep the delimiter at the start of each segment
                                                            parts = re.split(pattern, seg)
                                                            if len(parts) > 1:
                                                                # Reconstruct with pattern at the start of each segment
                                                                reconstructed = []
                                                                if parts[0].strip():
                                                                    reconstructed.append(parts[0])

                                                                for i in range(1, len(parts)):
                                                                    if parts[i].strip():
                                                                        reconstructed.append(parts[i])
                                                                new_segments.extend(reconstructed)
                                                            else:
                                                                new_segments.append(seg)
                                                        temp_segments = new_segments

                                                    segments = temp_segments

                                                    # Now process each segment individually
                                                    for segment in segments:
                                                        segment = segment.strip()
                                                        if not segment:
                                                            continue

                                                        # Check if this segment is a clean, appropriate response
                                                        # Clean greetings
                                                        if re.search(r'Hi [^!]*?!.*(?:How can I help|tasks)', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Hi [^!]*?!.*?(?:How can I help with your tasks\?|$)', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean name responses
                                                        elif re.search(r'Your name is', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'Your name is [^!.?]*?and your email is [^!.?]*?\.|Your name is [^!.?]*?\.|Your name is [^!.?]*?and your email is [^!.?]*', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean task responses
                                                        elif re.search(r'Added|Marked|Deleted', segment, re.IGNORECASE):
                                                            # Look for task operation patterns
                                                            task_patterns = [
                                                                r'Added \'[^\']*?\' to your tasks!',
                                                                r'Marked \'[^\']*?\' as complete!',
                                                                r'Deleted \'[^\']*?\'!',
                                                                r'Updated \'[^\']*?\'!'
                                                            ]

                                                            for pattern in task_patterns:
                                                                matches = re.findall(pattern, segment, re.IGNORECASE)
                                                                for match in matches:
                                                                    clean_resp = match.strip()
                                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                        # Skip sending if it's a duplicate
                                                                        resp_hash = hash(clean_resp)
                                                                        if resp_hash in sent_content:
                                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Skip if it looks like the same as last sent content
                                                                        if clean_resp == last_sent_content:
                                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                            continue

                                                                        # Add to sent set
                                                                        sent_content.add(resp_hash)
                                                                        last_sent_content = clean_resp

                                                                        # Only send appropriate content
                                                                        if clean_resp.strip():  # Only send non-empty content
                                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                                        # Clean identity responses
                                                        elif re.search(r'You\'re', segment, re.IGNORECASE):
                                                            clean_match = re.search(r'You\'re [^!.?]*?\([^)]*?\)\.|You\'re [^!.?]*?\.', segment, re.IGNORECASE)
                                                            if clean_match:
                                                                clean_resp = clean_match.group(0).strip()
                                                                if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                                    # Skip sending if it's a duplicate
                                                                    resp_hash = hash(clean_resp)
                                                                    if resp_hash in sent_content:
                                                                        logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Skip if it looks like the same as last sent content
                                                                    if clean_resp == last_sent_content:
                                                                        logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                        continue

                                                                    # Add to sent set
                                                                    sent_content.add(resp_hash)
                                                                    last_sent_content = clean_resp

                                                                    # Only send appropriate content
                                                                    if clean_resp.strip():  # Only send non-empty content
                                                                        yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"
                                                        # Original handling for single content pieces
                                                        # Skip sending if it's a duplicate
                                                        content_hash = hash(text_val.strip())
                                                        if content_hash in sent_content:
                                                            logger.info(f"Skipping duplicate content: {text_val[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if text_val.strip() == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {text_val[:50]}...")
                                                            continue

                                                        # Define content filters - More comprehensive to prevent instruction leakage
                                                        SKIP_PATTERNS = [
                                                            'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                            'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                            '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                            'output:', 'response:', 'content:', 'delta:',
                                                            'text:', 'role:', 'message:', 'data:', 'event:',
                                                            'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                            'add [task]', 'create [task]', 'remind me to [task]',
                                                            'show tasks', 'list tasks', 'what\'s on my list',
                                                            'show pending', 'what\'s left', 'complete task [id]',
                                                            'mark [id] done', 'delete task [id]', 'remove [id]',
                                                            'update task [id]', 'instructions', 'instruction',
                                                            'tool usage rules', 'response rules', 'response templates',
                                                            'formatting', 'examples', 'critical', 'user information',
                                                            'user name:', 'user email:', 'user id:',
                                                            'when user asks', 'when user says', 'response rules',
                                                            'response templates', 'formattings', 'examples:', 'user information',
                                                            'agent instructions', 'you are a', 'this is a', 'we need to',
                                                            'according to', 'there is', 'to do this', 'for this', 'the user',
                                                            '## ', 'user:', 'you:', 'user said', 'user message',
                                                            'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                            'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                            'call delete_task', 'call update_task', 'call set_priority',
                                                            'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                            'update_task', 'set_priority', 'list_tasks_by_priority'
                                                        ]

                                                        # Skip if contains unwanted patterns
                                                        if any(pattern.lower() in text_val.lower() for pattern in SKIP_PATTERNS):
                                                            logger.info(f"Skipping content with unwanted pattern: {text_val[:50]}...")
                                                            continue

                                                        # Skip if too short (likely fragment)
                                                        if len(text_val.strip()) < 3:
                                                            continue

                                                        # Skip if looks like JSON
                                                        if text_val.strip().startswith('{') or text_val.strip().startswith('['):
                                                            continue

                                                        # Skip if it looks like internal agent instructions or metadata
                                                        text_lower = text_val.lower().strip()
                                                        if any(skip_word in text_lower for skip_word in
                                                               ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                                'update_task', 'set_priority', 'list_tasks_by_priority',
                                                                'instructions', 'tool usage', 'response rules', 'templates',
                                                                'you are a', 'when user', 'tool usage rules', 'response rules',
                                                                'response templates', 'formattings', 'examples', 'user information',
                                                                'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                            logger.info(f"Skipping internal instruction content: {text_val[:50]}...")
                                                            continue

                                                        # Skip if it looks like it's part of agent instructions rather than actual response
                                                        if any(skip_phrase in text_val.lower() for skip_phrase in
                                                               ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                                'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                            logger.info(f"Skipping instruction template content: {text_val[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(content_hash)
                                                        last_sent_content = text_val.strip()

                                                        # Only send appropriate content
                                                        if text_val.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': text_val, 'done': False})}\n\n"

                        # Handle tool calls specifically
                        elif hasattr(event, 'type') and 'tool' in event.type.lower():
                            # Handle tool calls
                            if hasattr(event, 'data') and hasattr(event.data, 'tool_call'):
                                tool_call = event.data.tool_call
                                if hasattr(tool_call, 'function'):
                                    func_info = tool_call.function
                                    tool_name = getattr(func_info, 'name', 'unknown')

                                    try:
                                        import json as json_lib
                                        tool_args = json_lib.loads(func_info.arguments) if hasattr(func_info, 'arguments') else {}
                                    except:
                                        tool_args = {}

                                    tool_calls_log.append({"tool": tool_name, "args": tool_args})
                                    logger.info(f"Tool call: {tool_name} with args: {tool_args}")

                                    tool_call_data = {
                                        "type": "tool_call",
                                        "tool": tool_name,
                                        "args": tool_args,
                                    }
                                    yield f"data: {json.dumps(tool_call_data)}\n\n"

                        # Fallback: try to find any text content in the event object
                        else:
                            # Convert event to string and look for text content
                            event_str = str(event)
                            if len(event_str) > 10 and any(keyword in event_str.lower() for keyword in ['hello', 'task', 'add', 'help', 'complete', 'buy', 'milk', 'dahi']):
                                # Look for text content within the string representation
                                import re
                                # Look for text between quotes or after certain keywords
                                text_matches = re.findall(r'"([^"]*)"', event_str)
                                for match in text_matches:
                                    if len(match) > 3:  # Only substantial text
                                        full_response += match
                                        assistant_response += match
                                        logger.info(f"Found text from regex: {match[:100]}...")

                                        # AGGRESSIVE CONTENT PROCESSING - Handle heavily concatenated responses
                                        import re

                                        # First, let's try to split the content by common sentence starters and patterns
                                        # This handles cases where multiple responses are concatenated together
                                        segments = []

                                        # Split on common response patterns that indicate separate responses
                                        # Split on patterns that look like: "Hi [name]!", "Your name is", "Added", "Marked", etc.
                                        split_patterns = [
                                            r'(?=Hi [^!]*!|Your name is|Added|Marked|Deleted|You\'re)',
                                            r'(?=what is my name|who am I|show my tasks|add task|complete task|delete task)'
                                        ]

                                        # Try to split the content based on response patterns
                                        temp_segments = [match]
                                        for pattern in split_patterns:
                                            new_segments = []
                                            for seg in temp_segments:
                                                # Split on the pattern but keep the delimiter at the start of each segment
                                                parts = re.split(pattern, seg)
                                                if len(parts) > 1:
                                                    # Reconstruct with pattern at the start of each segment
                                                    reconstructed = []
                                                    if parts[0].strip():
                                                        reconstructed.append(parts[0])

                                                    for i in range(1, len(parts)):
                                                        if parts[i].strip():
                                                            reconstructed.append(parts[i])
                                                    new_segments.extend(reconstructed)
                                                else:
                                                    new_segments.append(seg)
                                            temp_segments = new_segments

                                        segments = temp_segments

                                        # Now process each segment individually
                                        for segment in segments:
                                            segment = segment.strip()
                                            if not segment:
                                                continue

                                            # Check if this segment is a clean, appropriate response
                                            # Clean greetings
                                            if re.search(r'Hi [^!]*?!.*(?:How can I help|tasks)', segment, re.IGNORECASE):
                                                clean_match = re.search(r'Hi [^!]*?!.*?(?:How can I help with your tasks\?|$)', segment, re.IGNORECASE)
                                                if clean_match:
                                                    clean_resp = clean_match.group(0).strip()
                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                        # Skip sending if it's a duplicate
                                                        resp_hash = hash(clean_resp)
                                                        if resp_hash in sent_content:
                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if clean_resp == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(resp_hash)
                                                        last_sent_content = clean_resp

                                                        # Only send appropriate content
                                                        if clean_resp.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                            # Clean name responses
                                            elif re.search(r'Your name is', segment, re.IGNORECASE):
                                                clean_match = re.search(r'Your name is [^!.?]*?and your email is [^!.?]*?\.|Your name is [^!.?]*?\.|Your name is [^!.?]*?and your email is [^!.?]*', segment, re.IGNORECASE)
                                                if clean_match:
                                                    clean_resp = clean_match.group(0).strip()
                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                        # Skip sending if it's a duplicate
                                                        resp_hash = hash(clean_resp)
                                                        if resp_hash in sent_content:
                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if clean_resp == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(resp_hash)
                                                        last_sent_content = clean_resp

                                                        # Only send appropriate content
                                                        if clean_resp.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                            # Clean task responses
                                            elif re.search(r'Added|Marked|Deleted', segment, re.IGNORECASE):
                                                # Look for task operation patterns
                                                task_patterns = [
                                                    r'Added \'[^\']*?\' to your tasks!',
                                                    r'Marked \'[^\']*?\' as complete!',
                                                    r'Deleted \'[^\']*?\'!',
                                                    r'Updated \'[^\']*?\'!'
                                                ]

                                                for pattern in task_patterns:
                                                    matches = re.findall(pattern, segment, re.IGNORECASE)
                                                    for match_item in matches:
                                                        clean_resp = match_item.strip()
                                                        if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                            # Skip sending if it's a duplicate
                                                            resp_hash = hash(clean_resp)
                                                            if resp_hash in sent_content:
                                                                logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                                continue

                                                            # Skip if it looks like the same as last sent content
                                                            if clean_resp == last_sent_content:
                                                                logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                                continue

                                                            # Add to sent set
                                                            sent_content.add(resp_hash)
                                                            last_sent_content = clean_resp

                                                            # Only send appropriate content
                                                            if clean_resp.strip():  # Only send non-empty content
                                                                yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"

                                            # Clean identity responses
                                            elif re.search(r'You\'re', segment, re.IGNORECASE):
                                                clean_match = re.search(r'You\'re [^!.?]*?\([^)]*?\)\.|You\'re [^!.?]*?\.', segment, re.IGNORECASE)
                                                if clean_match:
                                                    clean_resp = clean_match.group(0).strip()
                                                    if clean_resp and len(clean_resp) > 5:  # Make sure it's substantial
                                                        # Skip sending if it's a duplicate
                                                        resp_hash = hash(clean_resp)
                                                        if resp_hash in sent_content:
                                                            logger.info(f"Skipping duplicate clean response: {clean_resp[:50]}...")
                                                            continue

                                                        # Skip if it looks like the same as last sent content
                                                        if clean_resp == last_sent_content:
                                                            logger.info(f"Skipping consecutive duplicate: {clean_resp[:50]}...")
                                                            continue

                                                        # Add to sent set
                                                        sent_content.add(resp_hash)
                                                        last_sent_content = clean_resp

                                                        # Only send appropriate content
                                                        if clean_resp.strip():  # Only send non-empty content
                                                            yield f"data: {json.dumps({'type': 'message', 'content': clean_resp, 'done': False})}\n\n"
                                            # Original handling for single content pieces
                                            # Skip sending if it's a duplicate
                                            content_hash = hash(match.strip())
                                            if content_hash in sent_content:
                                                logger.info(f"Skipping duplicate content: {match[:50]}...")
                                                continue

                                            # Skip if it looks like the same as last sent content
                                            if match.strip() == last_sent_content:
                                                logger.info(f"Skipping consecutive duplicate: {match[:50]}...")
                                                continue

                                            # Define content filters - More comprehensive to prevent instruction leakage
                                            SKIP_PATTERNS = [
                                                'thinking', 'reasoning', 'tool call', 'nameadd_task',
                                                'namelist_tasks', 'namecomplete_task', 'namedelete_task',
                                                '{', '}', 'user_id', 'task_id', 'status:', 'created',
                                                'output:', 'response:', 'content:', 'delta:',
                                                'text:', 'role:', 'message:', 'data:', 'event:',
                                                'type:', 'tool:', 'args:', 'parameters:', 'arguments:',
                                                'add [task]', 'create [task]', 'remind me to [task]',
                                                'show tasks', 'list tasks', 'what\'s on my list',
                                                'show pending', 'what\'s left', 'complete task [id]',
                                                'mark [id] done', 'delete task [id]', 'remove [id]',
                                                'update task [id]', 'instructions', 'instruction',
                                                'tool usage rules', 'response rules', 'response templates',
                                                'formatting', 'examples', 'critical', 'user information',
                                                'user name:', 'user email:', 'user id:',
                                                'when user asks', 'when user says', 'response rules',
                                                'response templates', 'formattings', 'examples:', 'user information',
                                                'agent instructions', 'you are a', 'this is a', 'we need to',
                                                'according to', 'there is', 'to do this', 'for this', 'the user',
                                                '## ', 'user:', 'you:', 'user said', 'user message',
                                                'agent:', 'todoagent', 'groq', 'llama', 'model:', 'provider:',
                                                'tool call', 'call add_task', 'call list_tasks', 'call complete_task',
                                                'call delete_task', 'call update_task', 'call set_priority',
                                                'add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                'update_task', 'set_priority', 'list_tasks_by_priority'
                                            ]

                                            # Skip if contains unwanted patterns
                                            if any(pattern.lower() in match.lower() for pattern in SKIP_PATTERNS):
                                                logger.info(f"Skipping content with unwanted pattern: {match[:50]}...")
                                                continue

                                            # Skip if too short (likely fragment)
                                            if len(match.strip()) < 3:
                                                continue

                                            # Skip if looks like JSON
                                            if match.strip().startswith('{') or match.strip().startswith('['):
                                                continue

                                            # Skip if it looks like internal agent instructions or metadata
                                            text_lower = match.lower().strip()
                                            if any(skip_word in text_lower for skip_word in
                                                   ['add_task', 'list_tasks', 'complete_task', 'delete_task',
                                                    'update_task', 'set_priority', 'list_tasks_by_priority',
                                                    'instructions', 'tool usage', 'response rules', 'templates',
                                                    'you are a', 'when user', 'tool usage rules', 'response rules',
                                                    'response templates', 'formattings', 'examples', 'user information',
                                                    'user:', 'agent:', 'todoagent', 'model', 'provider']):
                                                logger.info(f"Skipping internal instruction content: {match[:50]}...")
                                                continue

                                            # Skip if it looks like it's part of agent instructions rather than actual response
                                            if any(skip_phrase in match.lower() for skip_phrase in
                                                   ['when user asks', 'when user says', '##', 'user: "', 'you: "', 'user said',
                                                    'call add_task', 'call list_tasks', 'call complete_task', 'call delete_task']):
                                                logger.info(f"Skipping instruction template content: {match[:50]}...")
                                                continue

                                            # Add to sent set
                                            sent_content.add(content_hash)
                                            last_sent_content = match.strip()

                                            # Only send appropriate content
                                            if match.strip():  # Only send non-empty content
                                                yield f"data: {json.dumps({'type': 'message', 'content': match, 'done': False})}\n\n"

                    except Exception as e:
                        logger.error(f"Error processing event: {str(e)}", exc_info=True)
                        logger.error(f"Problematic event: {event}")
                        continue

        except Exception as e:
            logger.error(
                f"MCP server connection error for user {user_id}: {str(e)}",
                exc_info=True,
            )
            error_response = {
                "type": "error",
                "code": "MCP_CONNECTION_ERROR",
                "message": "Error connecting to AI tools. Please try again.",
            }
            yield f"data: {json.dumps(error_response)}\n\n"
            return

        # ✅ 8. Store ASSISTANT message in database (after streaming completes)
        if assistant_response.strip():  # Only save if there's actual content
            try:
                await add_message(
                    session=session,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=assistant_response.strip(),
                    tool_calls={"calls": tool_calls_log} if tool_calls_log else None,
                )
                logger.info(
                    f"Saved assistant message: {len(assistant_response)} chars, {len(tool_calls_log)} tool calls"
                )
            except Exception as db_error:
                logger.error(
                    f"Failed to save assistant message: {str(db_error)}", exc_info=True
                )
                # Don't break the stream, just log the error

        # ✅ 8.5 Update conversation title if it's still "New Conversation" and we have the first message
        try:
            # Get the conversation to check if it still has the default title
            from src.services.conversation_service import get_first_message_in_conversation, update_conversation_title
            conversation_obj = await session.get(Conversation, conversation_id)

            if conversation_obj and conversation_obj.title == "New Conversation":
                # Get the first message in this conversation to use for title
                first_message = await get_first_message_in_conversation(session, conversation_id)

                if first_message and first_message.role == "user":
                    # Create a short title from the first user message
                    # Take first 50 characters or first sentence, whichever is shorter
                    first_sentence = first_message.content.split('.')[0].strip()
                    first_words = ' '.join(first_message.content.split()[:6])  # First 6 words

                    # Choose the shorter one that makes sense
                    new_title = first_sentence[:50] if len(first_sentence) <= 50 else first_words[:50]

                    # Ensure the title is not empty
                    if new_title.strip():
                        await update_conversation_title(session, conversation_id, new_title)
                        logger.info(f"Updated conversation {conversation_id} title to: '{new_title}'")
                    else:
                        # If the first message is too short, use a generic title based on content
                        generic_title = first_message.content[:50].strip() or f"Conversation {conversation_id}"
                        await update_conversation_title(session, conversation_id, generic_title)
                        logger.info(f"Updated conversation {conversation_id} title to: '{generic_title}'")

        except Exception as title_error:
            logger.error(
                f"Failed to update conversation title: {str(title_error)}", exc_info=True
            )
            # Don't break the stream, just log the error

        # ✅ 9. Send done event
        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"

    except HTTPException as e:
        error_detail = (
            e.detail
            if isinstance(e.detail, dict)
            else {
                "success": False,
                "error": {"code": "UNKNOWN_ERROR", "message": str(e.detail)},
            }
        )
        error_response = {
            "type": "error",
            "code": error_detail.get("error", {}).get("code", "UNKNOWN_ERROR"),
            "message": error_detail.get("error", {}).get(
                "message", "An error occurred"
            ),
        }
        logger.error(f"HTTP error in stream_chat_response: {error_response}")
        yield f"data: {json.dumps(error_response)}\n\n"

    except Exception as e:
        logger.error(
            f"Unexpected error in stream_chat_response: {str(e)}", exc_info=True
        )
        error_response = {
            "type": "error",
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred while processing your message. Please try again.",
        }
        yield f"data: {json.dumps(error_response)}\n\n"


@router.post("/{user_id}/chat")
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user),
):
    """
    Chat endpoint with SSE streaming.

    **Stateless Request Cycle:**
    1. Receive user message
    2. Fetch conversation history from database
    3. Build message array for agent (history + new message)
    4. Store user message in database
    5. Run agent with MCP tools
    6. Agent invokes appropriate MCP tool(s)
    7. Store assistant response in database
    8. Return response to client
    9. Server holds NO state (ready for next request)

    **Authentication:**
    - Requires valid JWT token in Authorization header
    - User ID from JWT must match user_id in URL path

    **Request Body:**
    - conversation_id (int | null): Existing conversation ID or null for new
    - message (str): User's message text (1-5000 characters)

    **Response:**
    - Server-Sent Events (SSE) stream
    - Content-Type: text/event-stream
    - Events: message, tool_call, done, error

    **Example Request:**
    ```bash
    curl -X POST "http://localhost:8000/api/user123/chat" \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{"conversation_id": null, "message": "Add a task to buy groceries"}'
    ```

    **Example SSE Stream:**
    ```
    data: {"type": "message", "content": "I'll add", "done": false}

    data: {"type": "message", "content": " that for you!", "done": false}

    data: {"type": "tool_call", "tool": "add_task", "args": {"user_id": "user123", "title": "Buy groceries"}}

    data: {"type": "message", "content": " Task created!", "done": false}

    data: {"type": "done", "conversation_id": 1}
    ```

    Args:
        user_id: User ID from URL path (must match JWT token)
        request: ChatRequest with conversation_id and message
        session: Async database session (injected)
        current_user: Current user from JWT token (injected)

    Returns:
        StreamingResponse: SSE stream with chat response

    Raises:
        HTTPException: 403 if user_id doesn't match JWT token
        HTTPException: 400 if validation fails
        HTTPException: 404 if conversation not found
    """
    # 1. Verify user_id from JWT matches URL path
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch: cannot access other users' conversations",
        )

    # 2. Validate request
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty"
        )

    # 3. Get or create conversation
    conversation = await get_or_create_conversation(
        session=session,
        user_id=user_id,
        conversation_id=request.conversation_id,
    )

    # 4. Return SSE streaming response
    return StreamingResponse(
        stream_chat_response(
            user_id=user_id,
            conversation_id=conversation.id,
            user_message=request.message.strip(),
            session=session,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable proxy buffering (nginx)
        },
    )


@router.get("/{user_id}/conversations")
async def get_user_conversations_endpoint(
    user_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
):
    """
    Get user's conversation list.

    Retrieve all conversations for authenticated user with pagination.

    **Authentication:**
    - Requires valid JWT token
    - User ID from JWT must match user_id in URL

    **Query Parameters:**
    - limit (int): Maximum conversations to return (default 50, max 100)
    - offset (int): Number of conversations to skip (default 0)

    Args:
        user_id: User ID from URL path
        session: Async database session (injected)
        current_user: Current user from JWT token (injected)
        limit: Maximum conversations to return
        offset: Pagination offset

    Returns:
        dict: List of conversations with metadata

    Raises:
        HTTPException: 403 if user_id doesn't match JWT token
    """
    # Verify user_id matches JWT token
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch: cannot access other users' conversations",
        )

    # Validate and cap limit
    limit = min(limit, 100)

    # Get conversations from service
    from ..services.conversation_service import get_user_conversations

    conversations = await get_user_conversations(
        session=session,
        user_id=user_id,
        limit=limit,
        offset=offset,
    )

    # Format response
    return {
        "success": True,
        "data": {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "is_active": conv.is_active,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                }
                for conv in conversations
            ],
            "count": len(conversations),
            "limit": limit,
            "offset": offset,
        },
    }


@router.get("/{user_id}/conversations/{conversation_id}/messages")
async def get_conversation_messages_endpoint(
    user_id: str,
    conversation_id: int,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user),
    limit: int | None = None,
):
    """
    Get conversation message history.

    Retrieve all messages for a specific conversation.

    **Authentication:**
    - Requires valid JWT token
    - User ID from JWT must match user_id in URL

    **Query Parameters:**
    - limit (int | None): Optional limit on number of messages

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        session: Async database session (injected)
        current_user: Current user from JWT token (injected)
        limit: Optional message limit

    Returns:
        dict: List of messages ordered chronologically

    Raises:
        HTTPException: 403 if user_id doesn't match JWT token
        HTTPException: 404 if conversation not found
    """
    # Verify user_id matches JWT token
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch: cannot access other users' conversations",
        )

    # Get messages from service
    messages = await get_conversation_history(
        session=session,
        user_id=user_id,
        conversation_id=conversation_id,
        limit=limit,
    )

    # Format response
    return {
        "success": True,
        "data": {
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "tool_calls": msg.tool_calls,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ],
            "count": len(messages),
        },
    }


@router.post("/admin/cleanup/messages", tags=["admin"])
async def trigger_message_cleanup():
    """
    Trigger cleanup of expired messages (2-day retention policy).

    This endpoint runs the message cleanup job immediately.
    Should be called periodically (e.g., daily at off-peak hours) by an external scheduler.

    **Note:** This endpoint has no authentication requirement to allow external schedulers
    to trigger it. In production, consider adding API key authentication or IP whitelisting.

    Returns:
        dict: Cleanup statistics including:
            - deleted_count: Number of messages deleted
            - timestamp: When cleanup was executed

    Example:
        curl -X POST "http://localhost:8000/api/admin/cleanup/messages"
    """
    from ..tasks.message_cleanup import cleanup_expired_messages

    result = cleanup_expired_messages()
    status_code = 200 if result.get("success", False) else 500

    return {
        "success": result.get("success", False),
        "data": {
            "deleted_count": result.get("deleted_count", 0),
            "timestamp": result.get("timestamp"),
        },
        "error": result.get("error") if not result.get("success", False) else None,
    }


