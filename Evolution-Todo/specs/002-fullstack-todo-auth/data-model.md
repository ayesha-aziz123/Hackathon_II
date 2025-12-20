# Data Model: Full-Stack Multi-User Todo Web Application

## User Entity

**Fields:**
- `id` (string/UUID): Unique identifier for the user
- `email` (string): User's email address (unique, validated)
- `password_hash` (string): Hashed password (never stored in plain text)
- `name` (string, optional): User's display name
- `created_at` (timestamp): Account creation time
- `updated_at` (timestamp): Last update time
- `is_active` (boolean): Account status flag

**Relationships:**
- One-to-many with Task entity (user has many tasks)

**Validation Rules:**
- Email must be valid and unique
- Password must meet security requirements (handled by Better Auth)
- Created_at and updated_at are automatically managed

## Task Entity

**Fields:**
- `id` (string/UUID): Unique identifier for the task
- `user_id` (string/UUID): Foreign key to User entity (ensures data isolation)
- `title` (string): Task title (required, max 255 chars)
- `description` (string, optional): Task description (max 1000 chars)
- `priority` (enum): high/medium/low (default: medium)
- `tags` (string array): User-defined tags for categorization
- `due_date` (datetime, optional): When the task is due
- `completed` (boolean): Completion status (default: false)
- `completed_at` (datetime, optional): When the task was completed
- `recurrence_pattern` (string, optional): daily/weekly/monthly for recurring tasks
- `recurrence_end_date` (datetime, optional): When recurrence should stop
- `notification_time_before` (integer, optional): Minutes before due time for notification
- `created_at` (timestamp): Task creation time
- `updated_at` (timestamp): Last update time

**Relationships:**
- Many-to-one with User entity (task belongs to one user)

**Validation Rules:**
- Title is required and must be 1-255 characters
- User_id must match authenticated user for all operations
- Priority must be one of the allowed values
- Due date must be in the future if provided
- Completed_at is set only when completed is true
- Recurrence pattern must be one of allowed values if specified
- Notification time before must be positive if specified

## Session Entity

**Fields:**
- `id` (string/UUID): Unique identifier for the session
- `user_id` (string/UUID): Foreign key to User entity
- `token` (string): JWT token identifier
- `expires_at` (datetime): When the token expires
- `created_at` (timestamp): Session creation time
- `last_accessed_at` (timestamp): Last time session was used

**Relationships:**
- Many-to-one with User entity (session belongs to one user)

**Validation Rules:**
- Token is unique and securely generated
- Expires_at is in the future
- Automatically cleaned up when expired

## State Transitions

### Task States
- **Active**: Default state when created, `completed = false`
- **Completed**: When `completed = true` and `completed_at` is set
- **Recurring**: When `recurrence_pattern` is set and task generates new instances

### Transitions
- Active → Completed: When user marks task as complete
- Completed → Active: When user unmarks task as complete (optional feature)
- Recurring: When recurrence pattern is active, new tasks are created based on pattern

## Database Constraints

- **User isolation**: All task queries must be filtered by user_id from JWT token
- **Referential integrity**: Foreign key constraints between User and Task
- **Unique constraints**: Email uniqueness in User table
- **Indexing**: Indexes on user_id for efficient user-specific queries
- **Data retention**: Completed tasks are retained indefinitely (as per clarification)