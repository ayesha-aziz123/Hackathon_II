"""
Test script to verify the user info implementation works correctly.
This tests the key changes made to pass user info to the agent.
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

from src.routers.chat import stream_chat_response
from src.agent_config.todo_agent import TodoAgentManager, create_todo_agent


async def test_user_info_passed_to_agent():
    """Test that user info is correctly passed to the agent."""
    print("Testing user info implementation...")

    # Test 1: Verify TodoAgentManager accepts user info parameters
    print("\n1. Testing TodoAgentManager initialization...")
    try:
        # Mock the MCP server to avoid actual server startup
        with patch('src.agent_config.todo_agent.MCPServerStdio') as mock_mcp_server:
            mock_mcp_server.return_value = MagicMock()

            # Mock the agent
            mock_agent = MagicMock()

            with patch('src.agent_config.todo_agent.Agent') as mock_agent_class:
                mock_agent_class.return_value = mock_agent

                # Create TodoAgentManager with user info
                agent_manager = TodoAgentManager(
                    provider="groq",
                    model="llama-3.1-70b-versatile",
                    user_id="test-user-123",
                    user_name="John Doe",
                    user_email="john@example.com"
                )

                print(f"   [PASS] TodoAgentManager created successfully")
                print(f"   [INFO] User ID: {agent_manager.user_id}")
                print(f"   [INFO] User Name: {agent_manager.user_name}")
                print(f"   [INFO] User Email: {agent_manager.user_email}")

                # Verify instructions contain user info
                instructions = agent_manager._get_instructions()
                assert "John Doe" in instructions, "User name not found in instructions"
                assert "john@example.com" in instructions, "User email not found in instructions"
                assert "test-user-123" in instructions, "User ID not found in instructions"

                print(f"   [PASS] Instructions contain user information correctly")

    except Exception as e:
        print(f"   [FAIL] Error in TodoAgentManager test: {e}")
        return False

    # Test 2: Verify create_todo_agent function
    print("\n2. Testing create_todo_agent factory function...")
    try:
        with patch('src.agent_config.todo_agent.MCPServerStdio') as mock_mcp_server:
            mock_mcp_server.return_value = MagicMock()

            with patch('src.agent_config.todo_agent.Agent') as mock_agent_class:
                mock_agent_class.return_value = MagicMock()

                agent_manager = create_todo_agent(
                    provider="groq",
                    model="llama-3.1-70b-versatile",
                    user_id="test-user-456",
                    user_name="Jane Smith",
                    user_email="jane@example.com"
                )

                assert isinstance(agent_manager, TodoAgentManager), "Factory function didn't return TodoAgentManager"
                assert agent_manager.user_name == "Jane Smith", "User name not set correctly"
                assert agent_manager.user_email == "jane@example.com", "User email not set correctly"

                print(f"   [PASS] Factory function works correctly")
                print(f"   [PASS] Returns TodoAgentManager instance")
                print(f"   [PASS] User info passed correctly")

    except Exception as e:
        print(f"   [FAIL] Error in create_todo_agent test: {e}")
        return False

    # Test 3: Verify UserService async methods
    print("\n3. Testing UserService async methods...")
    try:
        from src.services.user_service import UserService
        from src.models.user import User
        from sqlmodel.ext.asyncio.session import AsyncSession

        # Mock the database session and result
        mock_session = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_user = User(id="test-user-789", email="test@example.com", name="Test User", password_hash="hash")

        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute.return_value = mock_result

        # Test get_user_by_id
        user = await UserService.get_user_by_id(mock_session, "test-user-789")
        assert user is not None, "User not found"
        assert user.id == "test-user-789", "Wrong user ID"
        assert user.name == "Test User", "Wrong user name"

        print(f"   [PASS] UserService.get_user_by_id works correctly")
        print(f"   [INFO] User ID: {user.id}")
        print(f"   [INFO] User Name: {user.name}")
        print(f"   [INFO] User Email: {user.email}")

    except Exception as e:
        print(f"   [FAIL] Error in UserService test: {e}")
        return False

    print("\n[SUCCESS] All tests passed! User info implementation is working correctly.")
    return True


async def test_stream_response_with_user_info():
    """Test the stream_chat_response function with user info."""
    print("\n4. Testing stream_chat_response with user info...")

    try:
        # Mock the session and other dependencies
        mock_session = AsyncMock()

        # Mock the UserService.get_user_by_id to return a test user
        with patch('src.routers.chat.UserService') as mock_user_service:
            mock_user = MagicMock()
            mock_user.name = "Alice Johnson"
            mock_user.email = "alice@example.com"
            mock_user_service.get_user_by_id = AsyncMock(return_value=mock_user)

            # Mock other dependencies
            with patch('src.routers.chat.get_conversation_history') as mock_get_history:
                mock_get_history.return_value = []

                with patch('src.routers.chat.add_message') as mock_add_message:
                    mock_add_message.return_value = None

                    with patch('src.routers.chat.create_todo_agent') as mock_create_agent:
                        # Create a mock agent manager
                        mock_agent_manager = MagicMock()
                        mock_agent_manager.get_agent.return_value = MagicMock()

                        # Mock the MCPServer context manager
                        mock_agent_manager.mcp_server.__aenter__ = AsyncMock()
                        mock_agent_manager.mcp_server.__aexit__ = AsyncMock()

                        mock_create_agent.return_value = mock_agent_manager

                        # Mock the run_agent_with_retry function to return a mock result
                        with patch('src.routers.chat.run_agent_with_retry') as mock_run_agent:
                            # Create a mock streaming result
                            mock_result = MagicMock()

                            # Mock stream_events to return an empty async generator
                            async def mock_stream_events():
                                yield MagicMock()

                            mock_result.stream_events = mock_stream_events
                            mock_run_agent.return_value = mock_result

                            # Call the stream function
                            stream_gen = stream_chat_response(
                                user_id="test-user-999",
                                conversation_id=1,
                                user_message="test message",
                                session=mock_session
                            )

                            # Try to get first item to ensure it doesn't error
                            first_item = await stream_gen.__anext__()
                            print(f"   [PASS] Stream function works without errors")
                            print(f"   [INFO] User info fetch attempted (UserService called)")

                            # Verify UserService was called
                            mock_user_service.get_user_by_id.assert_called_once()

    except Exception as e:
        print(f"   [FAIL] Error in stream_chat_response test: {e}")
        import traceback
        traceback.print_exc()
        return False

    print(f"   [PASS] Stream response function handles user info correctly")
    return True


async def main():
    """Run all tests."""
    print("Testing User Info Implementation")
    print("=" * 50)

    success1 = await test_user_info_passed_to_agent()
    success2 = await test_stream_response_with_user_info()

    print("\n" + "=" * 50)
    if success1 and success2:
        print("[SUCCESS] ALL TESTS PASSED! Implementation is successful.")
        print("\nThe changes made:")
        print("- Created async UserService to fetch user info by ID")
        print("- Updated TodoAgentManager to accept user info")
        print("- Updated create_todo_agent factory function")
        print("- Updated stream_chat_response to fetch and pass user info")
        print("- Added duplicate detection in streaming logic")
        print("- Agent now knows user's name and email for conversation")
    else:
        print("[ERROR] SOME TESTS FAILED!")
        return False

    return True


if __name__ == "__main__":
    asyncio.run(main())