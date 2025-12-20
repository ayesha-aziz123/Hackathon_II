# API Contracts: Console Todo App

**Branch**: `001-console-todo-app` | **Date**: 2025-12-07 | **Spec**: specs/001-console-todo-app/spec.md
**Input**: Implementation Plan from `/specs/001-console-todo-app/plan.md`

## Absence of Traditional API Contracts

This "Console Todo App" is designed as a standalone, in-memory Command-Line Interface (CLI) application. As per the project's scope and constitutional constraints (specifically, "All tasks must exist only in memory (no database)" and "No external libraries"), the application does not expose any network-accessible APIs (e.g., REST, GraphQL).

Therefore, there are no traditional API contracts (like OpenAPI or GraphQL schemas) to define or generate for this feature. All interactions occur directly via the command-line interface, and data is managed within the application's process memory.

The CLI commands and their expected arguments/outputs, as defined in the Feature Specification, serve as the primary "interface contract" for user interaction.
