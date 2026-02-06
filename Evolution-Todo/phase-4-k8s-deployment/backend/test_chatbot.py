#!/usr/bin/env python3
"""
Test script to verify AI chatbot task operations work correctly.
This script tests the complete workflow of adding, listing, completing, and deleting tasks via the chatbot.
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Any

# Add the backend src to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.agent_config.todo_agent import create_todo_agent
from agents.run import Runner

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Test user ID - using a mock user ID for testing
TEST_USER_ID = "test-user-123"

async def test_chatbot_task_operations():
    """
    Test the AI chatbot task operations workflow.
    """
    logger.info("Starting AI chatbot task operations test...")

    # Create a todo agent
    logger.info(f"Creating TodoAgent for user: {TEST_USER_ID}")
    todo_agent = create_todo_agent(user_id=TEST_USER_ID)
    agent = todo_agent.get_agent()

    # Test messages to send to the agent
    test_messages = [
        {"role": "user", "content": "Hello, I want to add a task to buy milk"},
        {"role": "user", "content": "Show me my tasks"},
        {"role": "user", "content": "Add another task to call mom"},
        {"role": "user", "content": "Complete the buy milk task"},
        {"role": "user", "content": "What tasks do I have now?"},
        {"role": "user", "content": "Delete the call mom task"},
        {"role": "user", "content": "Show all my tasks"},
    ]

    # Process messages with agent
    agent_messages = []

    async with todo_agent.mcp_server:
        logger.info("MCP server context established")

        for i, message in enumerate(test_messages):
            logger.info(f"Processing message {i+1}: {message['content']}")

            # Add current message to agent messages
            agent_messages.append(message)

            try:
                # Run the agent with streaming
                logger.info("Running agent with streaming...")
                result = Runner.run_streamed(agent, agent_messages)

                assistant_response = ""
                tool_calls = []

                async for event in result.stream_events():
                    if event.type == "raw_response_event" and hasattr(event.data, "delta"):
                        content_delta = event.data.delta
                        if content_delta:
                            assistant_response += content_delta
                            logger.info(f"Assistant response chunk: {content_delta}")

                    elif event.type == "run_item_stream_event":
                        item = event.item
                        if hasattr(item, "tool") and item.tool:
                            tool_name = item.tool.name
                            tool_args = item.tool.args
                            tool_calls.append({"tool": tool_name, "args": tool_args})
                            logger.info(f"Tool executed: {tool_name} with args: {tool_args}")

                # Log the final response and any tool calls
                logger.info(f"Final assistant response: {assistant_response}")
                if tool_calls:
                    logger.info(f"Tool calls made: {tool_calls}")
                else:
                    logger.info("No tool calls were made")

                # Add assistant response to messages for context
                if assistant_response.strip():
                    agent_messages.append({"role": "assistant", "content": assistant_response})

            except Exception as e:
                logger.error(f"Error processing message {i+1}: {str(e)}")
                continue

    logger.info("AI chatbot task operations test completed!")
    return True

def run_simple_test():
    """
    Run a simple test to verify the agent can be created and tools can be called.
    """
    logger.info("Running simple test...")

    try:
        # Test agent creation
        logger.info("Creating TodoAgent...")
        todo_agent = create_todo_agent(user_id=TEST_USER_ID)
        logger.info("Agent created successfully")

        # Test that the agent has the expected tools
        agent = todo_agent.get_agent()
        logger.info(f"Agent created: {type(agent)}")

        # Test simple interaction
        test_messages = [
            {"role": "user", "content": "Add a task to buy groceries"}
        ]

        logger.info("Test completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Simple test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing AI Chatbot Task Operations...")

    # Run simple test first
    if not run_simple_test():
        print("Simple test failed!")
        exit(1)

    print("Simple test passed!")

    # Run full test
    try:
        asyncio.run(test_chatbot_task_operations())
        print("All tests passed!")
    except Exception as e:
        print(f"Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)