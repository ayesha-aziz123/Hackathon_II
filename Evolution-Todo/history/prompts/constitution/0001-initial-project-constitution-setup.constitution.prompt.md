---
id: 0001
title: Initial project constitution setup
stage: constitution
date: 2025-12-07
surface: agent
model: gemini-1.5-flash
feature: none
branch: main
user: Ayesha
command: /sp.constitution
labels: ["constitution", "setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  null
---

## Prompt

```
/sp.constitution
# Constitution — Phase I: In-Memory Python Todo CLI App

## 1. Purpose
This constitution defines the rules for Phase I of the "Evolution of Todo" project.
All implementation must be spec-driven using Claude CLI + SpecKit Plus.
The developer will not write code manually; Claude must generate all source code from specs.

## 2. Project Scope
Create an in-memory Python CLI Todo application with the following features:
- Add Task
- View Tasks
- Update Task
- Delete Task
- Mark Complete / Incomplete

All tasks must exist only in memory (no database).
Application must run in a terminal using Python 3.13+.

## 3. Architecture Rules
- Source code lives under `src/todo/`.
- Keep modules small and single-responsibility.
- Use:
  - `models.py` → task model + dataclasses or simple classes
  - `storage.py` → in-memory storage abstraction
  - `services.py` → business logic
  - `cli.py` → command-line UI
  - `main.py` → entrypoint

## 4. Data Model
A Task must include:
- `id: int`
- `title: str`
- `description: str`
- `completed: bool` (default False)
- `created_at: str`
- `updated_at: str`

Timestamps must be ISO formatted using Python datetime.

## 5. Coding Standards
- Python 3.13
- Type hints required
- Docstrings for all classes/functions
- No external libraries
- Clean, readable, single-purpose functions
- No global mutable state outside the storage component

## 6. CLI Requirements
- User can add, list, update, delete, complete, incomplete tasks
- Simple commands: `add`, `list`, `update <id>`, `delete <id>`, `complete <id>`, `incomplete <id>`, `exit`, `help`
- CLI must print clear messages and handle invalid input gracefully

## 7. Tests
- Tests live in `tests/`
- Use pytest style
- Each feature must have at least one test
- Storage must reset per test (isolated state)

## 8. Spec-Driven Rules
Claude must follow this workflow:
1. `/sp.specify` → feature spec
2. `/sp.plan`
3. `/sp.task`
4. `/sp.implement`

Claude must:
- Not hallucinate files outside this structure
- Follow this constitution for every generation
- Update code only through the spec-driven workflow
- Generate tests first, then implementation

## 9. Completion Criteria
Phase I is complete when:
- All 5 features are implemented
- All tests pass
- CLI works end-to-end
- Repo contains: Constitution.md, specs/, src/, tests/, README.md, CLAUDE.md
```

## Response snapshot

```
New constitution version: 1.0.0 (initial setup).

The constitution file at `.specify/memory/constitution.md` has been updated.

Suggested commit message: `docs: amend constitution to v1.0.0 (initial setup + governance update)`
```

## Outcome

- ✅ Impact: The project constitution has been established.
- 🧪 Tests: No tests were run as part of this task.
- 📁 Files: `.specify/memory/constitution.md` was created/updated.
- 🔁 Next prompts: User needs to verify the updated constitution and potentially update other templates.
- 🧠 Reflection: The `create-phr.sh` script did not create the directory or the file as expected. Manual PHR creation was required.

## Evaluation notes (flywheel)

- Failure modes observed: `create-phr.sh` script failure to create directory/file.
- Graders run and results (PASS/FAIL): null
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Investigate `create-phr.sh` script.
