# Development Tasks: Console Todo App

**Feature Branch**: `001-console-todo-app` | **Date**: 2025-12-07 | **Spec**: specs/001-console-todo-app/spec.md
**Input**: Feature specification from `/specs/001-console-todo-app/spec.md`

## Summary

This document outlines the development tasks for the "Console Todo App" feature, organized by phases and user stories, with dependencies and parallelization opportunities identified. Each task adheres to the defined checklist format, specifying an ID, potential for parallel execution, user story context, description, and target file path.

## Dependencies

The user stories are prioritized and have implicit dependencies on foundational components. The development will proceed incrementally, starting with setup and foundational elements, then implementing user stories in priority order.

*   **Foundational components** (model, storage, service base) -> All User Stories
*   **User Story 1 (Add Task)** -> User Story 2 (View Tasks - to verify additions), User Story 3, 4, 5 (for manipulating existing tasks)
*   **User Story 2 (View Tasks)** -> User Story 1 (to see tasks added)
*   User Stories 3, 4, 5 (Mark Complete/Incomplete, Update, Delete) are largely independent of each other in terms of implementation, but depend on User Story 1 and 2 for task creation and verification.

## Parallel Execution Opportunities

Tasks marked with `[P]` can potentially be executed in parallel if different team members or agents are working on distinct files or components with minimal direct dependencies on incomplete tasks. For example, implementing tests for a service can be done in parallel with implementing CLI parsing for a different command once the service interface is stable.

## Implementation Strategy

The implementation will follow an iterative, incremental approach. The Minimum Viable Product (MVP) will encompass the "Add a new Todo Task" and "View all Todo Tasks" user stories (P1), along with the foundational components. Subsequent user stories will be integrated in priority order. For each user story, tests will be generated first, followed by implementation.

## Phases

### Phase 1: Setup

Goal: Establish the basic project directory structure and initialization files.

- [x] T001 Create `phase-1-cli/src/todo/` directory: `phase-1-cli/src/todo/`
- [x] T002 Create `phase-1-cli/src/todo/__init__.py` for Python package: `phase-1-cli/src/todo/__init__.py`
- [x] T003 Create `phase-1-cli/tests/` directory: `phase-1-cli/tests/`
- [x] T004 Create `phase-1-cli/tests/__init__.py` for Python package: `phase-1-cli/tests/__init__.py`
- [x] T005 Create `phase-1-cli/tests/unit/` directory for unit tests: `phase-1-cli/tests/unit/`
- [x] T006 Create `phase-1-cli/tests/integration/` directory for integration tests: `phase-1-cli/tests/integration/`

### Phase 2: Foundational

Goal: Implement the core data model, in-memory storage, and basic service layer structure.

- [x] T007 Implement `Task` data model (dataclass/class) with attributes and timestamp logic: `phase-1-cli/src/todo/models.py`
- [x] T008 Implement `InMemoryStorage` class for managing tasks list: `phase-1-cli/src/todo/storage.py`
- [x] T009 Implement `TodoService` class with `InMemoryStorage` dependency: `phase-1-cli/src/todo/services.py`

### Phase 3: User Story 1 - Add a new Todo Task (P1)

Goal: Enable users to add new todo tasks with title and optional description.
Independent Test Criteria: Successfully add a task and verify its presence in the list.

- [x] T010 [US1] Create unit tests for `TodoService.add_task` functionality: `phase-1-cli/tests/unit/test_services.py`
- [x] T011 [US1] Implement `TodoService.add_task` method to create and store new tasks: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [c] T012 [US1] Create integration tests for CLI `add` command: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T013 [US1] Implement CLI `add` command parsing and call to `TodoService`: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)

### Phase 4: User Story 2 - View all Todo Tasks (P1)

Goal: Allow users to view a list of all existing todo tasks.
Independent Test Criteria: Successfully add multiple tasks and then list them, verifying all tasks are displayed correctly.

- [x] T014 [US2] Create unit tests for `TodoService.list_tasks` functionality: `phase-1-cli/tests/unit/test_services.py`
- [x] T015 [US2] Implement `TodoService.list_tasks` method to retrieve all tasks: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [c] T016 [US2] Create integration tests for CLI `list` command: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T017 [US2] Implement CLI `list` command parsing and display of tasks: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)

### Phase 5: User Story 3 - Mark a Task as Complete/Incomplete (P2)

Goal: Enable users to mark a specific task as complete or incomplete.
Independent Test Criteria: Mark a task as complete/incomplete and verify its status update upon listing.

- [x] T018 [US3] Create unit tests for `TodoService.mark_task_complete` and `mark_task_incomplete` functionality: `phase-1-cli/tests/unit/test_services.py`
- [x] T019 [US3] Implement `TodoService.mark_task_complete` method: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [x] T020 [US3] Implement `TodoService.mark_task_incomplete` method: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [c] T021 [US3] Create integration tests for CLI `complete` and `incomplete` commands: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T022 [US3] Implement CLI `complete` command parsing and call to `TodoService`: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)
- [c] T023 [US3] Implement CLI `incomplete` command parsing and call to `TodoService`: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)

### Phase 6: User Story 4 - Update an Existing Todo Task (P2)

Goal: Allow users to update the title or description of an existing task.
Independent Test Criteria: Update a task's title/description and verify changes upon listing.

- [x] T024 [US4] Create unit tests for `TodoService.update_task` functionality: `phase-1-cli/tests/unit/test_services.py`
- [x] T025 [US4] Implement `TodoService.update_task` method: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [c] T026 [US4] Create integration tests for CLI `update` command: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T027 [US4] Implement CLI `update` command parsing and call to `TodoService`: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)

### Phase 7: User Story 5 - Delete a Todo Task (P3)

Goal: Enable users to delete a specific todo task.
Independent Test Criteria: Delete a task and verify its removal upon listing.

- [x] T028 [US5] Create unit tests for `TodoService.delete_task` functionality: `phase-1-cli/tests/unit/test_services.py`
- [x] T029 [US5] Implement `TodoService.delete_task` method: `phase-1-cli/src/todo/services.py` (Implemented in T009)
- [c] T030 [US5] Create integration tests for CLI `delete` command: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T031 [US5] Implement CLI `delete` command parsing and call to `TodoService`: `phase-1-cli/src/todo/cli.py` (Cancelled due to interactive CLI refactor)

### Final Phase: Polish & Cross-Cutting Concerns

Goal: Implement the main application entry point, help functionality, and robust error handling.

- [c] T032 Implement `phase-1-cli/src/todo/main.py` for CLI entry point, command dispatching, and error handling. (Cancelled due to interactive CLI refactor)
- [c] T033 Implement help message display for CLI. (Cancelled due to interactive CLI refactor)
- [c] T034 Implement graceful handling of invalid commands and arguments in `phase-1-cli/src/todo/cli.py` and `phase-1-cli/src/todo/main.py`. (Cancelled due to interactive CLI refactor)
- [c] T035 Create integration test for CLI help message: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [c] T036 Create integration test for CLI invalid command handling: `phase-1-cli/tests/integration/test_cli.py` (Cancelled due to interactive CLI refactor)
- [x] T037 Implement interactive CLI loop using `rich` in `phase-1-cli/src/todo/cli.py`
- [x] T038 Update `phase-1-cli/src/todo/main.py` to launch interactive CLI
- [x] T039 Create rich-formatted task display function in `phase-1-cli/src/todo/cli.py`
- [x] T040 Refactor CLI commands to use interactive input and `TodoService` calls in `phase-1-cli/src/todo/cli.py`
- [x] T041 Ensure graceful exit from interactive CLI in `phase-1-cli/src/todo/cli.py`



