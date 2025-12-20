# Console Todo App

## Project Title
Console Todo App

## Description
The Console Todo App is an interactive command-line interface (CLI) application developed in Python, designed for simple and efficient task management. It utilizes the `rich` library to deliver a visually engaging and user-friendly experience directly within the terminal. This application enables users to perform core task operations such as adding, listing, updating, marking as complete/incomplete, and deleting tasks. It is important to note that all task data is stored in-memory, meaning tasks will not persist across different sessions once the application is closed. This project serves as a clear, self-contained example of a Python CLI application with basic data management.

## Features
*   **Task Creation:** Easily add new tasks, providing a title and an optional detailed description.
*   **Task Listing:** Display all current tasks in a well-formatted table, presenting each task's unique ID, title, description, completion status, and timestamps for creation and last update.
*   **Task Modification:** Update the title and/or description of any existing task.
*   **Status Management:** Toggle the completion status of tasks, marking them as either complete or incomplete.
*   **Task Deletion:** Permanently remove tasks  from the  list.
*   **Interactive Menu-Driven Interface:** Navigate through the application using a straightforward, menu-based system.
*   **Rich Terminal Output:** Enhanced readability and a modern aesthetic are provided by the `rich` library for all console output.
*   **In-Memory Storage:** Tasks are managed within the application's runtime memory, offering quick operations for temporary task lists.

## Installation Instructions

### Prerequisites
*   **Python 3.8+**: Ensure you have a compatible version of Python installed.
*   **pip**: The Python package installer, typically included with Python installations.

### Steps
1.  **Navigate to the project directory:**
    Open your terminal or command prompt and change your current directory to the location where you have the project files.
    ```bash
    cd phase-1-cli
    ```

2.  **Install dependencies:**
    The application relies on the `rich` library for its enhanced console output. Install this dependency using `pip` with the provided `requirements.txt` file:
    ```bash
    pip install -r requirements.txt
    ```

## Usage Instructions

To launch the interactive Console Todo App, execute the `main.py` file from your terminal within the project's root directory:

```bash
python phase-1-cli/src/todo/main.py
```

Upon successful execution, the application will display a welcome message and its main interactive menu:

```
Welcome to the Interactive Todo CLI!

Todo CLI Menu:
1. Add Task
2. List Tasks
3. Update Task
4. Mark Task Complete
5. Mark Task Incomplete
6. Delete Task
7. Exit
8. Reset Storage (DANGEROUS)
```

Interact with the application by entering the number corresponding to your desired action and following any subsequent prompts.

*   **To Add a Task:** Enter `1`. You will be prompted to enter a task title and an optional description.
*   **To List Tasks:** Enter `2`. All current tasks will be displayed in a formatted table.
*   **To Update a Task:** Enter `3`. You will need to provide the task's ID and then new values for its title and/or description.
*   **To Mark a Task Complete:** Enter `4`. Provide the ID of the task you wish to mark as complete.
*   **To Mark a Task Incomplete:** Enter `5`. Provide the ID of the task you wish to mark as incomplete.
*   **To Delete a Task:** Enter `6`. Provide the ID of the task you wish to remove.
*   **To Exit the Application:** Enter `7`.
*   **To Reset All Tasks:** Enter `8`. This option will clear all in-memory tasks after a confirmation.

## Project Structure

The project is organized into a modular structure to separate concerns:

```
Evolution-Todo/
├───.gemini/
├───.specify/
├───history/
├───specs/
├───phase-1-cli/
│   ├───src/
│   │   └───todo/
│   │       ├───__init__.py       # Initializes the todo package.
│   │       ├───cli.py            # Defines the command-line interface logic and user interaction.
│   │       ├───main.py           # The application's entry point, which starts the CLI.
│   │       ├───models.py         # Defines the data structure for a Task using a dataclass.
│   │       ├───services.py       # Contains the business logic for task operations (add, list, update, delete).
│   │       └───storage.py        # Implements the in-memory storage mechanism for tasks.
│   └───tests/
│       ├───integration/
│       │   └───test_cli.py       # Integration tests for the command-line interface.
│       └───unit/
│           └───test_services.py  # Unit tests for the services layer.
├───.gitignore                # Specifies intentionally untracked files to ignore.
├───CLAUDE.md                 # Documentation specific to Claude.
├───GEMINI.md                 # Documentation specific to Gemini.
└───requirements.txt          # Lists Python dependencies required by the project.
```

*   `phase-1-cli/src/todo/`: This directory contains the core application logic, broken down into modules for CLI, main execution, data models, services, and storage.
*   `phase-1-cli/tests/`: Contains unit and integration tests to ensure the application's functionality.
*   `requirements.txt`: Specifies the necessary Python packages for the project.

## Dependencies

The Console Todo App relies on the following Python library:

*   **`rich`**: A powerful Python library for writing rich text (colors, styles, markdown), tables, progress bars, and more to the terminal. It is used here to enhance the visual presentation of the CLI.

## Contribution Guidelines

We welcome contributions to the Console Todo App! If you have suggestions for new features, improvements, or bug fixes, please consider the following steps:

1.  **Fork the Repository**: Start by forking the project repository to your GitHub account.
2.  **Create a New Branch**: Create a dedicated branch for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Implement Your Changes**: Make your modifications, ensuring that your code adheres to the existing coding style and conventions.
4.  **Write Tests**: Add appropriate unit and/or integration tests for your new features or bug fixes to maintain code quality.
5.  **Commit Your Changes**: Commit your changes with a clear and concise message:
    ```bash
    git commit -m 'feat: Add your new feature' # or 'fix: Resolve bug in X'
    ```
6.  **Push to Your Branch**: Push your local branch to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Open a Pull Request**: Submit a pull request to the `main` branch of the original repository, describing your changes and their benefits.

## License Information

This project is open-sourced under the MIT License. A copy of the license should be available in a `LICENSE` file within the project's root directory. This license permits free use, modification, and distribution of the software, with appropriate attribution.

## Contact / Support

For any inquiries, technical support, or to report issues, please utilize the issue tracker on the project's GitHub repository.