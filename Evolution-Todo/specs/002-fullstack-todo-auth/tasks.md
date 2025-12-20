---
description: "Task list for full-stack multi-user todo web application implementation"
---

# Tasks: Full-Stack Multi-User Todo Web Application

**Input**: Design documents from `/specs/002-fullstack-todo-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below assume web app structure based on plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create phase-2-web directory structure with frontend/ and backend/ subdirectories
- [x] T002 Initialize Next.js 16+ project in frontend/ with TypeScript and Tailwind CSS
- [x] T003 Initialize FastAPI project in backend/ with Python 3.13+ and SQLModel
- [x] T004 [P] Create package.json in frontend/ with required dependencies (next, react, react-dom, better-auth, tailwindcss)
- [x] T005 [P] Create requirements.txt in backend/ with required dependencies (fastapi, sqlmodel, python-jose, python-multipart, python-dotenv)
- [x] T006 [P] Create .env.example files in both frontend/ and backend/ directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Setup Neon PostgreSQL connection in backend/src/database/connection.py
- [x] T008 [P] Implement JWT authentication framework in backend/src/auth/jwt.py
- [x] T009 [P] Setup Better Auth configuration in frontend/src/lib/auth.ts
- [x] T010 Create centralized API client in frontend/src/lib/api.ts with JWT token attachment
- [x] T011 Create database models for User and Task entities in backend/src/models/user.py and backend/src/models/task.py
- [x] T012 Create Pydantic schemas for User and Task in backend/src/schemas/user.py and backend/src/schemas/task.py
- [x] T013 Setup Drizzle schema for frontend database operations in frontend/drizzle/schema.ts
- [x] T014 Configure environment variables management for both frontend and backend
- [x] T015 Setup basic Next.js routing with App Router in frontend/src/app/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to register, login, logout, and securely access the application with proper authentication

**Independent Test**: A new user can complete the registration process, verify their account, and successfully log in to access the application.

### Implementation for User Story 1

- [x] T016 [P] [US1] Create Better Auth API routes in frontend/src/app/api/auth/[...all]/route.ts
- [x] T017 [P] [US1] Create User registration page component in frontend/src/app/(auth)/sign-up/page.tsx
- [x] T018 [P] [US1] Create User login page component in frontend/src/app/(auth)/sign-in/page.tsx
- [x] T019 [P] [US1] Create User logout functionality in frontend/src/components/Navbar/UserButton.tsx
- [x] T020 [US1] Implement JWT token verification middleware in backend/src/auth/jwt.py
- [x] T021 [US1] Create protected API route handler in backend/src/routers/tasks.py for user validation
- [x] T022 [US1] Implement user registration endpoint in backend/src/routers/tasks.py
- [x] T023 [US1] Create authentication utilities in frontend/src/lib/auth.ts
- [x] T024 [US1] Add authentication state management in frontend/src/components/AuthProvider.tsx
- [x] T025 [US1] Create layout with authentication check in frontend/src/app/layout.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Basic Task Management (Priority: P1)

**Goal**: Enable authenticated users to create, view, update, delete, and mark tasks as complete with all CRUD operations

**Independent Test**: A logged-in user can create a new task, view all their tasks, update task details, mark tasks as complete, and delete tasks.

### Implementation for User Story 2

- [x] T026 [P] [US2] Create Task model extensions for CRUD operations in backend/src/models/task.py
- [x] T027 [P] [US2] Create Task schema extensions for CRUD operations in backend/src/schemas/task.py
- [x] T028 [P] [US2] Create TaskList component in frontend/src/components/TaskList/TaskList.tsx
- [x] T029 [P] [US2] Create TaskForm component in frontend/src/components/TaskList/TaskForm.tsx
- [x] T030 [P] [US2] Create TaskItem component in frontend/src/components/TaskList/TaskItem.tsx
- [x] T031 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/src/routers/tasks.py
- [x] T032 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/src/routers/tasks.py
- [x] T033 [US2] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/src/routers/tasks.py
- [x] T034 [US2] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/src/routers/tasks.py
- [x] T035 [US2] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/src/routers/tasks.py
- [x] T036 [US2] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/src/routers/tasks.py
- [x] T037 [US2] Create frontend API service methods in frontend/src/lib/api.ts for task operations
- [x] T038 [US2] Create task management UI in frontend/src/app/tasks/page.tsx
- [x] T039 [US2] Implement user data isolation middleware in backend/src/routers/tasks.py to verify JWT user_id matches URL user_id
- [x] T040 [US2] Add task validation and error handling in backend/src/routers/tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Advanced Task Features (Priority: P2)

**Goal**: Enable users to organize tasks with priority levels, user-defined tags, due dates, recurring tasks, and custom notification timing with persistent sessions

**Independent Test**: A logged-in user can set priority, add custom tags, set due dates, create recurring tasks that self-replicate, set custom notification times, and maintain persistent sessions until logout.

### Implementation for User Story 3

- [ ] T041 [P] [US3] Update Task model with priority, tags, due_date, recurrence fields in backend/src/models/task.py
- [ ] T042 [P] [US3] Update Task schema with priority, tags, due_date, recurrence fields in backend/src/schemas/task.py
- [ ] T043 [P] [US3] Create TaskPriority component in frontend/src/components/TaskList/TaskPriority.tsx
- [ ] T044 [P] [US3] Create TaskTags component in frontend/src/components/TaskList/TaskTags.tsx
- [ ] T045 [P] [US3] Create TaskDueDate component in frontend/src/components/TaskList/TaskDueDate.tsx
- [ ] T046 [US3] Implement recurring task logic with self-replication in backend/src/services/task_service.py
- [ ] T047 [US3] Add notification time before due date functionality in backend/src/models/task.py
- [ ] T048 [US3] Create browser notification service in frontend/src/lib/notification.ts
- [ ] T049 [US3] Implement persistent session management in frontend/src/lib/auth.ts
- [ ] T050 [US3] Update task form to include advanced fields in frontend/src/components/TaskList/TaskForm.tsx
- [ ] T051 [US3] Update task display to show advanced properties in frontend/src/components/TaskList/TaskItem.tsx

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Search, Filter, and Sort (Priority: P2)

**Goal**: Enable users to efficiently find and organize tasks using search, filtering by status/priority, and sorting by various criteria

**Independent Test**: A logged-in user can search for tasks by text, filter by status/priority, and sort by date or priority to find relevant tasks quickly.

### Implementation for User Story 4

- [ ] T052 [P] [US4] Create search/filter/sort service in backend/src/services/task_service.py
- [ ] T053 [P] [US4] Create SearchBar component in frontend/src/components/TaskList/SearchBar.tsx
- [ ] T054 [P] [US4] Create FilterControls component in frontend/src/components/TaskList/FilterControls.tsx
- [ ] T055 [P] [US4] Create SortControls component in frontend/src/components/TaskList/SortControls.tsx
- [ ] T056 [US4] Update GET /api/{user_id}/tasks endpoint to support search, filter, sort in backend/src/routers/tasks.py
- [ ] T057 [US4] Update frontend API service to support search, filter, sort parameters in frontend/src/lib/api.ts
- [ ] T058 [US4] Integrate search, filter, sort functionality in TaskList component in frontend/src/components/TaskList/TaskList.tsx
- [ ] T059 [US4] Add database indexing for efficient search and filtering in backend/src/models/task.py

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 7: User Story 5 - Responsive UI Experience (Priority: P2)

**Goal**: Ensure the application provides an optimal experience across desktop, tablet, and mobile devices with responsive design

**Independent Test**: The application layout, navigation, and functionality work properly on desktop, tablet, and mobile devices.

### Implementation for User Story 5

- [ ] T060 [P] [US5] Create responsive layout components using Tailwind CSS in frontend/src/components/Layout/
- [ ] T061 [P] [US5] Update TaskList component for mobile responsiveness in frontend/src/components/TaskList/TaskList.tsx
- [ ] T062 [P] [US5] Update TaskForm component for mobile responsiveness in frontend/src/components/TaskList/TaskForm.tsx
- [ ] T063 [P] [US5] Create mobile navigation menu in frontend/src/components/Navbar/MobileMenu.tsx
- [ ] T064 [US5] Add responsive utility classes throughout all components in frontend/src/components/
- [ ] T065 [US5] Test and adjust UI elements for different screen sizes
- [ ] T066 [US5] Implement touch-friendly controls for mobile devices in frontend/src/components/TaskList/

**Checkpoint**: All user stories now work with responsive UI across all device types

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Add comprehensive error handling and user feedback across all components
- [ ] T068 [P] Add loading states and skeleton UI components in frontend/src/components/Loading/
- [ ] T069 Add comprehensive logging in backend/src/middleware/logging.py
- [ ] T070 [P] Add unit tests for backend services in backend/tests/unit/
- [ ] T071 [P] Add integration tests for API endpoints in backend/tests/integration/
- [ ] T072 Add security hardening and input validation across all endpoints
- [ ] T073 Create README.md with setup instructions following quickstart.md
- [ ] T074 Run complete application validation using quickstart.md steps
- [ ] T075 Add performance optimization for task loading and rendering
- [ ] T076 [P] Add accessibility features to all UI components
- [ ] T077 Add comprehensive documentation in docs/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for auth, US2 for basic tasks
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 for auth, US2 for basic tasks
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on other stories for UI components

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create Task model extensions for CRUD operations in backend/src/models/task.py"
Task: "Create Task schema extensions for CRUD operations in backend/src/schemas/task.py"
Task: "Create TaskList component in frontend/src/components/TaskList/TaskList.tsx"
Task: "Create TaskForm component in frontend/src/components/TaskList/TaskForm.tsx"
Task: "Create TaskItem component in frontend/src/components/TaskList/TaskItem.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. Complete Phase 4: User Story 2 (Basic Tasks)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 together
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify dependencies before starting each phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence