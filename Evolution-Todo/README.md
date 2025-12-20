# Evolution-Todo: Full-Stack Web Application

## Project Title
Evolution-Todo: From Console App to Full-Stack Web Application with Authentication

## Description
Evolution-Todo is a comprehensive todo application that demonstrates the evolution from a simple console-based application to a full-featured, multi-user web application. This project showcases two distinct phases of development:

### Phase I: Console Todo App
An interactive command-line interface (CLI) application developed in Python, designed for simple and efficient task management. It utilizes the `rich` library to deliver a visually engaging and user-friendly experience directly within the terminal. This application enables users to perform core task operations such as adding, listing, updating, marking as complete/incomplete, and deleting tasks. All task data is stored in-memory, meaning tasks will not persist across different sessions once the application is closed.

### Phase II: Full-Stack Web Application
A modern, multi-user web application built with Next.js 16+ (App Router) and FastAPI, featuring user authentication, database persistence, and a responsive interface. The app supports user registration, login, and isolated task lists per user. It includes advanced features like task priorities, tags, search, filtering, and due dates.

## Features

### Phase I Features
*   **Task Creation:** Easily add new tasks, providing a title and an optional detailed description.
*   **Task Listing:** Display all current tasks in a well-formatted table, presenting each task's unique ID, title, description, completion status, and timestamps for creation and last update.
*   **Task Modification:** Update the title and/or description of any existing task.
*   **Status Management:** Toggle the completion status of tasks, marking them as either complete or incomplete.
*   **Task Deletion:** Permanently remove tasks  from the  list.
*   **Interactive Menu-Driven Interface:** Navigate through the application using a straightforward, menu-based system.
*   **Rich Terminal Output:** Enhanced readability and a modern aesthetic are provided by the `rich` library for all console output.
*   **In-Memory Storage:** Tasks are managed within the application's runtime memory, offering quick operations for temporary task lists.

### Phase II Features
*   **User Authentication:** Secure JWT-based authentication using Better Auth for Next.js frontend and FastAPI backend
*   **Multi-User Support:** Each user has isolated Todo lists with no cross-user data access
*   **Full CRUD for Tasks:** Add, delete, update, view tasks with title, description, status
*   **Task Status Management:** Mark tasks as complete/incomplete
*   **Task Priorities:** Assign priorities (high/medium/low) to tasks
*   **Task Tags:** Categorize tasks with tags (work/home, etc.)
*   **Search Functionality:** Search tasks by keyword
*   **Filter Functionality:** Filter tasks by status/priority/date
*   **Sort Functionality:** Sort tasks by due date/priority/alphabetically
*   **Recurring Tasks:** Auto-reschedule tasks (e.g., weekly)
*   **Due Dates:** Assign due dates to tasks
*   **Reminders:** Browser notifications for task reminders
*   **Responsive Web Interface:** Modern UI with mobile-first design
*   **Data Persistence:** Tasks stored in Neon PostgreSQL database

## Installation Instructions

### Prerequisites
*   **Python 3.13+**: Required for backend services and console app
*   **Node.js 18+**: Required for frontend Next.js application
*   **npm or yarn**: Package manager for frontend dependencies
*   **Git**: For version control and cloning the repository

### Steps

#### For Phase I (Console App):
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

#### For Phase II (Full-Stack Web App):
1.  **Frontend Setup:**
    ```bash
    cd phase-2-web/frontend
    npm install
    ```

2.  **Backend Setup:**
    ```bash
    cd phase-2-web/backend
    pip install -r requirements.txt
    ```

3.  **Environment Configuration:**
    Create a `.env` file in both frontend and backend directories with the following variables:
    ```bash
    # Frontend (.env.local)
    NEXTAUTH_URL=http://localhost:3000
    BETTER_AUTH_SECRET=your-secret-here
    DATABASE_URL=postgresql://your-neon-db-connection-string

    # Backend (.env)
    BETTER_AUTH_SECRET=your-secret-here
    DATABASE_URL=postgresql://your-neon-db-connection-string
    ```

## Usage Instructions

### Phase I Usage
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

### Phase II Usage
1.  **Start the Backend:**
    ```bash
    cd phase-2-web/backend
    uvicorn src.main:app --reload --port 8000
    ```

2.  **Start the Frontend:**
    ```bash
    cd phase-2-web/frontend
    npm run dev
    ```

3.  **Access the Application:**
    Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
evolution-of-todo/
├── phase-1-cli/                  # Phase I: Console Todo App
│   ├── src/
│   │   └── todo/
│   │       ├── __init__.py       # Initializes the todo package.
│   │       ├── cli.py            # Defines the command-line interface logic and user interaction.
│   │       ├── main.py           # The application's entry point, which starts the CLI.
│   │       ├── models.py         # Defines the data structure for a Task using a dataclass.
│   │       ├── services.py       # Contains the business logic for task operations (add, list, update, delete).
│   │       └── storage.py        # Implements the in-memory storage mechanism for tasks.
│   └── tests/
├── phase-2-web/                  # Phase II: Full-Stack Web App
│   ├── frontend/                 # Next.js 16+ App Router
│   │   ├── src/app/
│   │   ├── src/components/       # React components
│   │   ├── src/lib/              # api.ts, auth utils, etc.
│   │   └── drizzle/              # Drizzle schema + migrations
│   ├── backend/
│   │   ├── src/
│   │   │   ├── models/           # SQLModel models
│   │   │   ├── schemas/          # Pydantic schemas
│   │   │   ├── routers/          # API routes
│   │   │   └── main.py
│   │   └── tests/                # pytest suite
│   └── docker-compose.yml        # Docker setup
├── specs/                        # Feature specifications
├── .specify/                     # SpecKit Plus configuration
├── history/                      # Development history
│   ├── prompts/                  # Prompt history records
│   └── adr/                      # Architecture decision records
├── constitution.md               # Project constitution
├── CLAUDE.md                     # Claude Code instructions
├── GEMINI.md                     # Gemini Code instructions
└── README.md                     # This file
```

## Dependencies

### Phase I Dependencies
*   **`rich`**: A powerful Python library for writing rich text (colors, styles, markdown), tables, progress bars, and more to the terminal. It is used here to enhance the visual presentation of the CLI.

### Phase II Dependencies
*   **Frontend:**
    *   Next.js 16+ with App Router
    *   TypeScript
    *   Tailwind CSS
    *   Better Auth library
    *   shadcn/ui components
*   **Backend:**
    *   FastAPI
    *   SQLModel
    *   PyJWT for JWT token handling
    *   Neon PostgreSQL database

## Contribution Guidelines

We welcome contributions to the Evolution-Todo project! If you have suggestions for new features, improvements, or bug fixes, please consider the following steps:

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