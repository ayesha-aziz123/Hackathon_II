---
id: 1
title: AI Chatbot Clarification Request
stage: spec
date: 2026-01-01
surface: agent
model: Claude Sonnet 4.5
feature: 004-ai-chatbot
branch: 004-ai-chatbot
user: Claude User
command: /sp.clarify
labels: [clarification, spec, ai-chatbot]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket:
  adr:
  pr:
files:
  specs/004-ai-chatbot/spec.md: modified
  specs/004-ai-chatbot/quickstart.md: created
tests:

---

## Prompt

```text
Read `.specify/memory/constitution.md` and `specs/004-ai-chatbot/spec.md` first.

Create `specs/004-ai-chatbot/quickstart.md`

**Prerequisites:**
- Phase 2 backend running
- Phase 2 frontend running
- Neon PostgreSQL configured
- Better Auth working
- OpenAI API key OR Gemini API key
**Setup Steps:**

1. **Backend Dependencies**
   ```bash
 cd phase-3-ai-chatbot/backend
uv add openai-agents mcp
   uv pip list | grep -E "(openai|mcp)"
   ```

2. **Environment Variables**
   - Backend `.env`: LLM_PROVIDER=openai, OPENAI_API_KEY=sk-..., OPENAI_DEFAULT_MODEL=gpt-4o-mini
   - OR Gemini: LLM_PROVIDER=gemini, GEMINI_API_KEY=..., GEMINI_DEFAULT_MODEL=gemini-2.0-flash
   - Frontend `.env.local`: NEXT_PUBLIC_CHATKIT_API_URL=/api/chat

3. **Database Tables**
   - Auto-created by SQLModel on first run
   - Optional: `psql $DATABASE_URL -f scripts/create_chat_tables.sql`

4. **Start Backend**
 ```bash
   cd phase-3-ai-chatbot/backend
source .venv/bin/activate
   uvicorn src.main:app --reload --port 8000
   ```
   Verify: `curl -X POST http://localhost:8000/api/chat -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"message": "Hello"}'`

5. **Start Frontend**
   ```bash
   cd phase-3-ai-chatbot/frontend
pnpm dev
   ```
   Navigate: `http://localhost:3000/chat`

**Verification Checklist:**
- [ ] Backend starts without errors
- [ ] `/api/health` returns 200
- [ ] Chat endpoint accepts messages
- [ ] Streaming response works
- [ ] Tasks can be created via chat
- [ ] Conversations persist in database
- [ ] Frontend ChatKit renders

**Test Commands:**
| Command | Expected Result |
|---------|-----------------|
| "Add a task to buy groceries" | Creates task, confirms |
| "Show me all my tasks" | Lists all tasks |
| "What's pending?" | Lists pending only |
| "Mark task 1 as complete" | Marks complete |
| "Delete the groceries task" | Deletes task |
| "Update task 1 to 'Call mom tonight'" | Updates title |

**Troubleshooting:**
- 401 → Check JWT token, verify BETTER_AUTH_URL
- No response → Check OPENAI_API_KEY, verify LLM_PROVIDER
```

## Response snapshot

I'll help you create a quickstart.md file for the AI chatbot feature. Let me first create the file as requested.

## Outcome

- ✅ Impact: Created quickstart guide for AI chatbot feature
- 🧪 Tests:
- 📁 Files: specs/004-ai-chatbot/quickstart.md
- 🔁 Next prompts:
- 🧠 Reflection: Successfully created the quickstart guide with all required sections

## Evaluation notes (flywheel)

- Failure modes observed:
- Graders run and results (PASS/FAIL):
- Prompt variant (if applicable):
- Next experiment (smallest change to try):