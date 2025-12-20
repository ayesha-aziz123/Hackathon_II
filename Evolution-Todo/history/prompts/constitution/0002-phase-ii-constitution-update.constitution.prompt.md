---
id: 0002
title: Phase II Constitution Update
stage: constitution
date: '2025-12-11'
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Claude Sonnet 4.5
command: /sp.constitution
labels: [constitution, phase-ii, full-stack, todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
---

## Prompt

Constitution Prompt for Phase II: Full-Stack Todo Web Application

You are Claude Code, an AI system architect specializing in Spec-Driven Development. Your role is to generate a comprehensive Markdown Constitution file for this project phase based on the following guidelines. The Constitution must serve as the foundational document that defines the project's principles, constraints, architecture, features, technology stack, and development rules. It must be written in clear, professional Markdown format with sections for Project Overview, Guiding Principles, Technology Stack, Architecture, Features, Testing Requirements, Deliverables, and Constraints.

## Project Overview
This Constitution is for Phase II of the Todo Evolution project: a full-stack web application that evolves the Todo app into a modern, multi-user system with authentication, database persistence, and a responsive interface. The app must support user registration, login, and isolated task lists per user. All development must follow Spec-Driven Development using Spec-Kit Plus, where specifications are refined iteratively to generate code without manual coding.

## Guiding Principles
- Strictly adhere to Spec-Driven Development: Refine specs until you generate correct implementations. No manual code writing allowed.
- Ensure reusable intelligence: Incorporate subagents and agent skills where applicable for modular, reusable components.
- Follow clean code principles: Modularity, separation of concerns, readability, and maintainability.
- Prioritize security: Implement JWT-based authentication and user data isolation.
- Emphasize usability: The frontend must be responsive and intuitive.
- Integrate all levels of Todo features: Basic (Add, Delete, Update, View, Mark Complete), Intermediate (Priorities & Tags, Search & Filter, Sort Tasks), and Advanced (Recurring Tasks, Due Dates & Reminders with browser notifications).

## Technology Stack
- Frontend: Next.js 16+ with TypeScript and App Router, Tailwind CSS for styling, Better Auth for authentication.
- Backend: FastAPI with Python 3.13+, SQLModel for ORM and models.
- Database: Neon Serverless PostgreSQL.
- ORM: Drizzle for frontend database interactions, SQLModel for backend.
- Other: UV for Python project management, Docker for containerization if needed in setup.

## Architecture
- Use a monorepo structure with clear separation:
  - /frontend: Contains Next.js app with src/app for pages, src/components for UI elements, src/lib for utilities (auth, API clients, DB), and drizzle for schema.
  - /backend: Contains FastAPI app with src/models for SQLModel models, src/schemas for Pydantic schemas, src/routers for API endpoints, and tests for pytest.
  - Root level: Shared specs, configurations, documentation, and docker-compose.yml for setup.
- Both frontend and backend must follow modular architecture with separation of concerns (e.g., controllers, services, repositories).
- RESTful API for backend with endpoints for CRUD operations on tasks, user auth, and task management.
- JWT authentication: All protected endpoints must verify JWT tokens and ensure user-specific data isolation.


Ensure the workflow uses the correct Spec‑Kit Plus commands (/sp.specify, /sp.plan, /sp.tasks, /sp.implement, /sp.clarify) where appropriate.

## Features
- User Authentication: Registration, login, logout using Better Auth and JWT.
- Multi-User Support: Each user has isolated Todo lists; no cross-user data access.
- Full CRUD for Tasks: Add, delete, update, view tasks with title, description, status.
- Intermediate Features: Assign priorities (high/medium/low), tags/categories (work/home), search by keyword, filter by status/priority/date, sort by due date/priority/alphabetically.
- Advanced Features: Recurring tasks (auto-reschedule e.g., weekly), due dates with time reminders and browser notifications.
- Responsive Web Interface: Modern UI with task list display, forms for adding/editing, and real-time updates if possible.

## Testing Requirements
- Automated Tests: Include for both frontend and backend.
- Backend: API integration tests for all endpoints using pytest; verify JWT auth, user isolation, and error handling.
- Frontend: Component tests and integration tests using tools like Jest or React Testing Library.
- All tests must pass before any changes are merged; include CI/CD considerations if applicable.

## Deliverables
- GitHub repository with monorepo structure as described.
- Constitution.md at root.
- Specs history folder with all specification files.
- README.md with setup instructions, including database connection to Neon.
- CLAUDE.md with instructions for using Claude Code.
- Working web app demonstrating all features: User auth, task management, isolation.
- Demo video link under 90 seconds showing key functionalities.

## Constraints
- No vibe coding: All code must be generated via refined specs.
- Refine specs iteratively until output is correct.
- Ensure compatibility with future phases (e.g., AI integration, deployment).
- Follow ethical AI practices: No biased features, secure data handling.
- Output only the Constitution.md content in Markdown format, nothing else.

## Response snapshot

# Project Constitution: Evolution-Todo Full-Stack Web Application

## Version
**Constitution Version:** 1.0.0

## Ratification
**Ratification Date:** 2025-12-11
**Last Amended:** 2025-12-11

## Project Overview
This Constitution governs Phase II of the Todo Evolution project: a full-stack web application that evolves the Todo app into a modern, multi-user system with authentication, database persistence, and a responsive interface. The app must support user registration, login, and isolated task lists per user. All development must follow Spec-Driven Development using Spec-Kit Plus, where specifications are refined iteratively to generate code without manual coding.

## Guiding Principles

### Principle 1: Spec-Driven Development Mandate
All code must be generated through refined specifications. No manual code writing is permitted. Refine specs iteratively until they generate correct implementations. This ensures traceability, consistency, and quality across the codebase.

**Rationale:** To maintain architectural integrity and ensure all code is specification-driven rather than ad-hoc implementation.

### Principle 2: Reusable Intelligence Integration
Incorporate subagents and agent skills where applicable for modular, reusable components. This ensures that the system is built with future extensibility in mind and maximizes the value of AI-assisted development.

**Rationale:** To create a maintainable and scalable architecture that leverages AI capabilities effectively.

### Principle 3: Clean Code Standards
Follow clean code principles: modularity, separation of concerns, readability, and maintainability. Code must be well-structured, documented where necessary, and follow established patterns for the technology stack.

**Rationale:** To ensure long-term maintainability and team collaboration effectiveness.

### Principle 4: Security-First Architecture
Prioritize security in all implementations: implement JWT-based authentication and ensure user data isolation. All user data must be properly isolated and protected according to security best practices.

**Rationale:** To protect user data and maintain trust in the application.

### Principle 5: Usability and Responsiveness
Emphasize usability: the frontend must be responsive and intuitive. User experience must be prioritized in all interface decisions.

**Rationale:** To ensure user adoption and satisfaction with the application.

### Principle 6: Comprehensive Feature Integration
Integrate all levels of Todo features: Basic (Add, Delete, Update, View, Mark Complete), Intermediate (Priorities & Tags, Search & Filter, Sort Tasks), and Advanced (Recurring Tasks, Due Dates & Reminders with browser notifications).

**Rationale:** To provide a complete and feature-rich task management solution.

## Technology Stack

### Frontend Stack
- **Framework:** Next.js 16+ with TypeScript and App Router
- **Styling:** Tailwind CSS for responsive styling
- **Authentication:** Better Auth for authentication
- **Database:** Drizzle for frontend database interactions

### Backend Stack
- **Framework:** FastAPI with Python 3.13+
- **ORM:** SQLModel for ORM and models
- **Authentication:** JWT-based authentication with Better Auth integration

### Database Stack
- **Database:** Neon Serverless PostgreSQL
- **ORM:** SQLModel for backend, Drizzle for frontend

### Development Tools
- **Python Management:** UV for Python project management
- **Containerization:** Docker for containerization when needed
- **Spec-Driven Development:** Spec-Kit Plus for specification-driven development

## Architecture

### Monorepo Structure
The project follows a monorepo structure with clear separation:
- **/frontend:** Contains Next.js app with src/app for pages, src/components for UI elements, src/lib for utilities (auth, API clients, DB), and drizzle for schema
- **/backend:** Contains FastAPI app with src/models for SQLModel models, src/schemas for Pydantic schemas, src/routers for API endpoints, and tests for pytest
- **Root level:** Shared specs, configurations, documentation, and docker-compose.yml for setup

### Backend Architecture
- RESTful API for backend with endpoints for CRUD operations on tasks, user auth, and task management
- JWT authentication: All protected endpoints must verify JWT tokens and ensure user-specific data isolation
- Modular architecture with separation of concerns (controllers, services, repositories)

### Frontend Architecture
- Next.js App Router for page routing and server-side rendering
- Component-based architecture with reusable UI components
- Client-side state management with proper error handling
- Responsive design following mobile-first principles

## Features

### Authentication Features
- User Registration: Secure account creation with proper validation
- User Login: JWT-based authentication with token management
- User Logout: Proper session termination and token invalidation
- Integration with Better Auth for enhanced security

### Multi-User Support
- Each user has isolated Todo lists with no cross-user data access
- User-specific data isolation at the database and application levels
- Proper authorization checks on all user data operations

### Task Management Features
- Full CRUD for Tasks: Add, delete, update, view tasks with title, description, status
- Task Status Management: Mark tasks as complete/incomplete
- Data persistence with proper validation and error handling

### Intermediate Features
- Task Priorities: Assign priorities (high/medium/low) to tasks
- Task Tags: Categorize tasks with tags (work/home, etc.)
- Search Functionality: Search tasks by keyword
- Filter Functionality: Filter tasks by status/priority/date
- Sort Functionality: Sort tasks by due date/priority/alphabetically

### Advanced Features
- Recurring Tasks: Auto-reschedule tasks (e.g., weekly)
- Due Dates: Assign due dates to tasks
- Reminders: Browser notifications for task reminders
- Time-based alerts for overdue tasks

### User Interface Features
- Responsive Web Interface: Modern UI with mobile-first design
- Task List Display: Clear and intuitive task presentation
- Forms for Adding/Editing: User-friendly forms for task management
- Real-time updates where possible for enhanced user experience

## Testing Requirements

### Backend Testing
- API Integration Tests: Comprehensive tests for all endpoints using pytest
- JWT Authentication Verification: Tests to ensure proper token validation
- User Isolation Verification: Tests to ensure proper data isolation between users
- Error Handling Tests: Tests for proper error responses and handling
- Database Operation Tests: Tests for all database operations and transactions

### Frontend Testing
- Component Tests: Unit tests for individual UI components
- Integration Tests: Tests for component interactions and workflows
- End-to-End Tests: Tests for complete user workflows
- Accessibility Tests: Tests to ensure the application is accessible

### Quality Assurance
- All tests must pass before any changes are merged
- Code coverage requirements: Maintain minimum 80% coverage
- Performance testing for critical user flows
- Security testing for authentication and authorization

## Deliverables

### Code Deliverables
- GitHub repository with monorepo structure as specified
- Complete working application demonstrating all features
- Proper documentation and setup instructions

### Documentation Deliverables
- Constitution.md at root level (this document)
- README.md with setup instructions, including database connection to Neon
- CLAUDE.md with instructions for using Claude Code
- API documentation for backend endpoints
- Setup and deployment guides

### Specification Deliverables
- Specs history folder with all specification files
- Implementation plans and task breakdowns
- Architecture decision records (ADRs) for significant decisions

### Demo Deliverables
- Working web app demonstrating all features: User auth, task management, isolation
- Demo video link under 90 seconds showing key functionalities
- Test suite demonstrating application reliability

## Constraints

### Development Constraints
- **No Vibe Coding:** All code must be generated via refined specs
- **Spec Refinement:** Refine specs iteratively until output is correct
- **Future Compatibility:** Ensure compatibility with future phases (e.g., AI integration, deployment)
- **Ethical AI Practices:** No biased features, secure data handling

### Technical Constraints
- **Database:** Must use Neon Serverless PostgreSQL as specified
- **Authentication:** Must use JWT-based authentication with Better Auth
- **Frontend:** Must use Next.js 16+ with TypeScript and App Router
- **Backend:** Must use FastAPI with Python 3.13+ and SQLModel

### Quality Constraints
- **Security:** All user data must be properly isolated and protected
- **Performance:** Application must perform well under expected load
- **Usability:** Interface must be responsive and intuitive
- **Maintainability:** Code must follow clean code principles

## Governance

### Amendment Process
This constitution may be amended through:
1. Proposal of changes with clear rationale
2. Review by project stakeholders
3. Approval by majority consensus
4. Update of version number according to semantic versioning
5. Propagation of changes to dependent artifacts

### Versioning Policy
- **MAJOR** version increments for backward incompatible governance/principle removals
- **MINOR** version increments for new principles or materially expanded guidance
- **PATCH** version increments for clarifications, wording, typo fixes

### Compliance Review
Regular compliance reviews should be conducted to ensure:
- Adherence to Spec-Driven Development principles
- Consistency with architectural decisions
- Proper implementation of security measures
- Maintenance of code quality standards

## Outcome

- ✅ Impact: Created comprehensive constitution for Phase II full-stack todo application
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md with complete constitution
- 🔁 Next prompts: Ready for spec creation using /sp.specify
- 🧠 Reflection: Constitution covers all required aspects for Phase II development

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification with /sp.specify