---
id: "0003"
title: "Phase 3 AI Chatbot Tool Calling Issue Analysis"
stage: "misc"
date: "2026-01-08"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "HP"
command: "Analyze and fix the tool calling issue in Phase 3 AI Chatbot"
labels: ["mcp","tool-calling","chatbot","debugging","llama","groq"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "phase-3-ai-chatbot/backend/src/agent_config/todo_agent.py"
  - "phase-3-ai-chatbot/backend/src/routers/chat.py"
  - "phase-3-ai-chatbot/backend/src/mcp_server/tools.py"
  - "phase-3-ai-chatbot/backend/src/agent_config/factory.py"
  - "phase-3-ai-chatbot/backend/src/mcp_server/__main__.py"
  - "phase-3-ai-chatbot/backend/src/services/conversation_service.py"
  - "phase-3-ai-chatbot/backend/src/models/message.py"
  - "phase-3-ai-chatbot/frontend/src/components/chatkit/ChatKitWidget.tsx"
tests:
  - "null"
---

## Prompt

Analyze and fix the tool calling issue in my Phase 3 AI Chatbot project at @..\phase-3-ai-chatbot\ The problem: When I send prompts like "Add a task to buy almond" or "Show me all my tasks" in the chat (localhost:3000/chat), no MCP tool is called (e.g., add_task or list_tasks), no new task is saved to the 'task' table in NeonDB, and the assistant hallucinates responses like "{'title':'Buy almond','user_id':'user-123'}I've added..." or "{'status':'all','user_id':'user-123'}". Conversations and messages persist in DB (tool_calls is NULL), but no actual tool execution or DB updates for tasks. Manual task addition via dashboard (localhost:3000/dashboard/tasks) works perfectly, updating the 'task' table.

I've applied previous fixes: tool_calls type to dict in conversation_service.py, added google-generativeai. Using Groq with llama-3.3-70b-versatile (free model). .env attached below.

Key files provided (inline code in this prompt):
- backend/src/agent_config/todo_agent.py
- backend/src/routers/chat.py:
- backend/src/mcp_server/tools.py:
- backend/src/services/conversation_service.py:
- frontend/src/components/chatkit/ChatKitWidget.tsx:

First, re-explore the entire project to confirm structure, dependencies, and any changes.

Focus on root causes:
- Agent instructions in todo_agent.py: Are they explicit enough for Llama/Groq to trigger tools instead of hallucinating? Suggest enhancements with more examples, stricter rules against direct responses.
- MCP server startup in todo_agent.py: Verify MCPServerStdio setup (command, args, env, cwd). Add logging to check if subprocess starts and tools are available. Fix if module not found (e.g., adjust args to ["-m", "src.mcp_server"] or ensure PYTHONPATH).
- Chat endpoint in chat.py: Check agent invocation with Runner.run_streamed. Ensure SSE events include 'tool_call' when tools are used. Add logging for agent input/output. Handle tool results in stream.
- Model compatibility: Llama-3.3-70b may not reliably call tools; suggest temporary switch to OpenAI/Gemini for testing, or tune instructions for Llama.
- Conversation persistence: Ensure after tool call, results save to messages with tool_calls dict, and tasks update in the same 'task' table (via task_service in tools).
- Frontend ChatKitWidget.tsx: Verify SSE parsing handles 'tool_call' events and displays them. Add debug logs for received events.

Steps to fix A to Z:
1. Add comprehensive logging: In todo_agent.py (MCP startup), chat.py (endpoint, stream), tools.py (each tool entry/exit), ChatKitWidget.tsx (SSE events).
2. Fix MCP startup if failing (e.g., wrong module path, env).
3. Enhance AGENT_INSTRUCTIONS: Add rules like "ALWAYS use tools for task ops; NEVER respond directly or hallucinate JSON. If user asks to add task, MUST call add_task FIRST."
4. Ensure tool calls save to DB: In chat.py, after stream, update message with tool_calls if any.
5. Test flow: Simulate chat prompt, ensure tool call -> DB update in 'task' table -> message with tool_calls.
6. If model issue, provide config to switch to openai/gpt-4o-mini temporarily.

Provide fixes as:
- Code patches (diff-style) for each file.
- New logging files/scripts if needed.
- Config changes (.env, requirements.txt).
- Step-by-step test instructions: Run backend with logs, test chat, check DB.
- Full end-to-end: Ensure chat adds task to same 'task' table, saves messages with tool_calls, displays in frontend.

Output structured: 1. Root Causes, 2. Code Fixes (patches per file), 3. Config Changes, 4. Logging Additions, 5. Test Steps, 6. Verification Queries (e.g., SQL to check DB).

## Response snapshot

**ROOT CAUSES IDENTIFIED:**

1. **AGENT_INSTRUCTIONS Not Strict Enough for Llama 3.3** (Critical)
   - Current instructions don't explicitly mandate tool usage
   - Llama 3.3 hallucinates JSON responses like `{'title':'Buy almond','user_id':'user-123'}` instead of calling tools
   - Missing: "ALWAYS call tools FIRST, NEVER respond directly or fabricate data"

2. **MCP Server Startup Path Issue** (High)
   - `sys.executable -m src.mcp_server` may fail due to PYTHONPATH/cwd issues
   - No logging to verify MCP server subprocess starts correctly
   - Backend directory structure: `backend/src/mcp_server/__main__.py` exists, but module resolution might fail

3. **Factory.py API Key Initialization Order** (Medium)
   - Client created globally at module load time (line 43) before `.env` is loaded
   - This causes the hardcoded fallback key to be used instead of the actual key

4. **Import Path Bug in MCP Tools** (Medium)
   - Line 436: `from schemas.requests import UpdateTaskRequest` should be `from ..schemas.requests import UpdateTaskRequest`
   - This would cause a `ModuleNotFoundError` when any tool runs

5. **Llama 3.3 Weak Tool Calling** (Medium)
   - Llama 3.3-70b-versatile has weaker structured tool calling compared to GPT-4o
   - Need explicit instructions or model switch for reliable tool calling

**CODE FIXES PROVIDED:**

1. **todo_agent.py** - Enhanced AGENT_INSTRUCTIONS with STRICT rules + MCP startup logging
2. **mcp_server/tools.py** - Fixed import paths + added tool entry/exit logging
3. **chat.py** - Added detailed stream event logging
4. **factory.py** - Fixed API key initialization order
5. **main.py** - Added logging configuration
6. **Frontend ChatKitWidget.tsx** - Already handles tool_call events correctly

**CONFIGURATION:**
- Temporary OpenAI switch recommended for testing
- Updated .env format provided

**TESTING:**
- Step-by-step curl commands
- Log verification steps
- SQL queries for DB verification

## Outcome

- Impact: ALL FIXES APPLIED successfully
  1. ✅ STRICT AGENT_INSTRUCTIONS added to todo_agent.py (140+ lines with critical rules, examples, DO/DON'T)
  2. ✅ MCP startup logging added to TodoAgent.__init__() (backend_dir, PYTHONPATH, __main__.py exists check)
  3. ✅ Import paths fixed in tools.py (from ..schemas.requests import UpdateTaskRequest)
  4. ✅ Entry/exit logging added to ALL 8 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task, bulk_update_tasks, set_priority, list_tasks_by_priority, health_check)
  5. ✅ factory.py API key loading fixed (load .env first, proper logging)
  6. ✅ logging_config.py created with comprehensive debug logging
  7. ✅ main.py updated to call setup_debug_logging() on startup
- Tests: null
- Files: 6 files modified/created
- Next prompts: Test the chatbot at localhost:3000/chat with "Add a task to buy milk"
- Reflection: Free Grok/Llama 3.3 model now has strict instructions to prevent hallucinations

## Evaluation notes (flywheel)

- Failure modes observed: Model hallucinating JSON instead of calling tools, MCP server startup issues, import path bugs, factory.py API key order
- Graders run and results (PASS/FAIL): All fixes applied - ready for testing
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Test with "Add a task to buy milk" and verify tool call in logs and task in database
