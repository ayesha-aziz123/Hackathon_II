---
id: "0004"
title: "Fix Chat Endpoint 500 Error"
stage: "general"
date: "2026-01-08"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "HP"
command: "Fix 500 error on POST /api/{chatbot_id}/chat endpoint"
labels: ["bugfix","chatbot","500-error","backend"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "phase-3-ai-chatbot/backend/src/agent_config/factory.py"
tests:
  - "none"
---

## Prompt

Error log shows:
```
2026-01-08 22:11:39,337 [uvicorn.access] INFO: 127.0.0.1:53728 - "POST /api/70ed6127-849c-45cc-86ed-ea60fc121248/chat HTTP/1.1" 500
2026-01-08 22:11:39,339 [uvicorn.error] ERROR: Exception in ASGI application
```

## Response snapshot

**Root Cause:** In `factory.py:261`, `os.getenv("LLM_PROVIDER")` returns `None` when env var is not set, causing `None.lower()` to throw `AttributeError`.

**Fix Applied:**
```python
# Before:
provider = provider or os.getenv("LLM_PROVIDER").lower()

# After:
provider = (provider or os.getenv("LLM_PROVIDER") or "openai").lower()
```

Added fallback to "openai" when `LLM_PROVIDER` is not set.

## Outcome

- ✅ Impact: Chat endpoint now handles missing LLM_PROVIDER gracefully
- 📁 Files: 1 file modified (`factory.py`)
- 🔁 Next prompts: Restart backend and test chat functionality
- 🧠 Reflection: Always add null-safety for environment variable lookups

## Evaluation notes (flywheel)

- Failure modes observed: AttributeError: 'NoneType' object has no attribute 'lower'
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment: N/A
