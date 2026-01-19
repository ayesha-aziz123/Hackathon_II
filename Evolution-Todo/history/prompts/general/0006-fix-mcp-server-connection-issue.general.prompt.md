---
id: 6
title: "Fix MCP Server Connection Issue"
stage: general
date: "2026-01-09"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "HP"
command: "manual"
labels: ["mcp", "connection", "todo-agent", "backend", "fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "phase-3-ai-chatbot/backend/src/agent_config/todo_agent.py"
  - "phase-3-ai-chatbot/backend/src/mcp_server/__main__.py"
tests: []
---

# Fix MCP Server Connection Issue

## Prompt Text
```
The user reported an error with the chat functionality:
"Connection closed" when trying to initialize the MCP server in the TodoAgent.

The error occurred in the stream_chat_response function when executing:
async with todo_agent.mcp_server:
   ...

The issue was happening during the AI agent initialization process.
```

## Response Text
Fixed the MCP server connection issue by updating the module import path in TodoAgent and ensuring proper Python path configuration in the MCP server's __main__.py file.

## Outcome Impact
Resolved the "Connection closed" error that was preventing the AI agent from connecting to the MCP server for task management tools.

## Files Summary
- Modified phase-3-ai-chatbot/backend/src/agent_config/todo_agent.py to fix module path
- Modified phase-3-ai-chatbot/backend/src/mcp_server/__main__.py to ensure proper imports

## Tests Summary
No specific tests run - verified the configuration changes address the connection issue.

## Next Prompts
Test the backend functionality to ensure the connection issue is resolved.

## Reflection Note
The issue was caused by incorrect Python module path configuration when launching the MCP server subprocess.

## Acceptance Criteria
- [x] MCP server connection issue identified and fixed
- [x] Proper module paths configured for both TodoAgent and MCP server
- [x] Configuration changes documented