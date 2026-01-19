#!/usr/bin/env python3
"""
Test script to verify MCP server startup and tool availability.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / "phase-3-ai-chatbot/backend"
sys.path.insert(0, str(backend_dir))

def test_mcp_import():
    """Test if MCP server can be imported properly"""
    print("🔍 Testing MCP server import...")
    try:
        from src.mcp_server.tools import mcp
        print("✅ MCP server tools imported successfully")
        print(f"   Available tools: {[name for name in dir(mcp) if hasattr(getattr(mcp, name), '__name__') and 'tool' in str(getattr(mcp, name).__class__).lower()]}")
        return True
    except Exception as e:
        print(f"❌ MCP server import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_agent_creation():
    """Test if TodoAgent can be created"""
    print("\n🔍 Testing TodoAgent creation...")
    try:
        from src.agent_config.todo_agent import TodoAgent
        print("✅ TodoAgent class imported successfully")

        # Try creating an agent (but don't run it yet)
        agent = TodoAgent(provider="openrouter", model="openai/gpt-3.5-turbo")  # Use a simple model for testing
        print("✅ TodoAgent instance created successfully")
        return True
    except Exception as e:
        print(f"❌ TodoAgent creation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_mcp_server_connection():
    """Test if MCP server can be started and connected"""
    print("\n🔍 Testing MCP server connection...")
    try:
        from src.agent_config.todo_agent import TodoAgent

        # Create agent
        agent = TodoAgent(provider="openrouter", model="openai/gpt-3.5-turbo", user_id="test-user-123")

        print("   Attempting to start MCP server...")
        async with agent.mcp_server:
            print("✅ MCP server started and connected successfully!")

            # Get the agent instance
            ai_agent = agent.get_agent()
            print(f"✅ AI Agent created: {ai_agent.name}")

        print("✅ MCP server connection test completed successfully")
        return True
    except Exception as e:
        print(f"❌ MCP server connection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("🚀 Starting MCP Server Connection Test\n")

    # Test imports first
    if not test_mcp_import():
        print("\n❌ Import test failed. Please fix import issues first.")
        return False

    if not test_agent_creation():
        print("\n❌ Agent creation test failed. Please fix agent creation issues first.")
        return False

    # Test MCP server connection
    if not await test_mcp_server_connection():
        print("\n❌ MCP server connection test failed.")
        return False

    print("\n🎉 All tests passed! MCP server should work correctly.")
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    if not success:
        print("\n⚠️  Some tests failed. Please review the errors above.")
        sys.exit(1)
    else:
        print("\n✅ All tests completed successfully!")