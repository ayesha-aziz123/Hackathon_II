# Quickstart Guide: Console Todo App

**Branch**: `001-console-todo-app` | **Date**: 2025-12-07 | **Spec**: specs/001-console-todo-app/spec.md
**Input**: Implementation Plan from `/specs/001-console-todo-app/plan.md`

## Overview

This guide provides quick instructions to set up and run the "Console Todo App" CLI application. This application is an in-memory Python 3.13+ command-line tool for managing todo tasks.

## Prerequisites

*   Python 3.13 or newer installed on your system.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/ayesha-aziz123/Hackathon_II
    cd In-Memory-Python-Console-App
    ```
    (Note: Replace with actual repository URL if different)

2.  **Navigate to the Application Directory**:
    The main application entry point is located in `phase-1-cli/src/todo/`.
    ```bash
    cd phase-1-cli/src/todo/
    ```

## Running the Application

Once in the `phase-1-cli/src/todo/` directory, you can run the application directly using Python.

### Available Commands

The application supports the following commands:

*   **`python phase-1-cli/src/todo/main.py add <title> [description]`**: Adds a new todo task.
    *   Example: `python phase-1-cli/src/todo/main.py add "Buy groceries" "Milk, Eggs, Bread"`
    *   Example: `python phase-1-cli/src/todo/main.py add "Finish report"`
*   **`python phase-1-cli/src/todo/main.py list`**: Lists all current todo tasks.
*   **`python phase-1-cli/src/todo/main.py update <id> [--title <new_title>] [--description <new_description>]`**: Updates an existing task.
    *   Example: `python phase-1-cli/src/todo/main.py update 1 --title "Buy organic groceries"`
    *   Example: `python phase-1-cli/src/todo/main.py update 2 --description "Draft section 1 and 2"`
*   **`python phase-1-cli/src/todo/main.py complete <id>`**: Marks a task as complete.
    *   Example: `python phase-1-cli/src/todo/main.py complete 1`
*   **`python phase-1-cli/src/todo/main.py incomplete <id>`**: Marks a task as incomplete.
    *   Example: `python phase-1-cli/src/todo/main.py incomplete 1`
*   **`python phase-1-cli/src/todo/main.py delete <id>`**: Deletes a task.
    *   Example: `python phase-1-cli/src/todo/main.py delete 1`
*   **`python phase-1-cli/src/todo/main.py help`**: Displays a help message with available commands.
*   **`python phase-1-cli/src/todo/main.py exit`**: Exits the application.

## Example Usage

1.  **Add a task**:
    ```bash
    python phase-1-cli/src/todo/main.py add "Learn Gemini CLI" "Explore new features and commands"
    ```
2.  **Add another task**:
    ```bash
    python phase-1-cli/src/todo/main.py add "Prepare presentation"
    ```
3.  **List tasks**:
    ```bash
    python phase-1-cli/src/todo/main.py list
    ```
    (You should see the two tasks listed with their IDs and statuses)

4.  **Mark the first task as complete**:
    ```bash
    python phase-1-cli/src/todo/main.py complete 1
    ```
5.  **List tasks again to see the change**:
    ```bash
    python phase-1-cli/src/todo/main.py list
    ```
6.  **Update the second task's title**:
    ```bash
    python phase-1-cli/src/todo/main.py update 2 --title "Finalize presentation slides"
    ```
7.  **Delete the first task**:
    ```bash
    python phase-1-cli/src/todo/main.py delete 1
    ```
8.  **List tasks one last time**:
    ```bash
    python phase-1-cli/src/todo/main.py list
    ```
    (Only "Finalize presentation slides" should remain)

This quickstart guide provides a basic overview. Refer to the full documentation for more details.
