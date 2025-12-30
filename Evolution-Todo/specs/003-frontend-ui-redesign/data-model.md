# Data Model: Frontend UI Redesign for Todo App

## Entities

### User
- **id**: string (UUID from Better Auth)
- **name**: string (user's display name)
- **email**: string (user's email address)
- **avatar**: string (optional, user's avatar URL)
- **created_at**: string (ISO timestamp)
- **updated_at**: string (ISO timestamp)
- **preferences**: object (theme: 'light'|'dark', notifications: boolean)

### Task
- **id**: string (UUID)
- **title**: string (task title, max 255 chars)
- **description**: string (optional, task description)
- **status**: 'pending' | 'in-progress' | 'completed' (task status)
- **due_date**: string (optional, ISO timestamp)
- **priority**: 'low' | 'medium' | 'high' (default: 'medium')
- **tags**: string[] (optional, array of tag strings)
- **created_at**: string (ISO timestamp)
- **updated_at**: string (ISO timestamp)
- **completed_at**: string (optional, ISO timestamp when completed)

### Session
- **token**: string (JWT token from Better Auth)
- **user_id**: string (user ID from token)
- **expires_at**: string (ISO timestamp)
- **created_at**: string (ISO timestamp)

### UI Theme
- **theme**: 'light' | 'dark' | 'system' (current theme setting)
- **is_dark_mode**: boolean (computed from theme setting)
- **last_updated**: string (ISO timestamp)

### Filter/Sort Settings
- **filter_by**: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'
- **sort_by**: 'created_at' | 'due_date' | 'priority' | 'title'
- **sort_order**: 'asc' | 'desc'
- **search_query**: string (optional, current search term)

## Component States

### TaskForm State
- **title**: string (current input value)
- **description**: string (current input value)
- **status**: 'pending' | 'in-progress' | 'completed'
- **due_date**: string (optional)
- **priority**: 'low' | 'medium' | 'high'
- **tags**: string[]
- **isSubmitting**: boolean
- **errors**: object (field-specific error messages)

### TaskList State
- **tasks**: Task[] (filtered and sorted tasks)
- **isLoading**: boolean (loading state)
- **error**: string | null (error message)
- **hasMore**: boolean (pagination - more tasks available)
- **page**: number (current page for pagination)

### Auth State
- **isAuthenticated**: boolean
- **user**: User | null
- **isLoading**: boolean
- **error**: string | null

## API Response Models

### TaskResponse
- **data**: Task | Task[] (single task or array of tasks)
- **success**: boolean
- **message**: string (optional, success/error message)
- **pagination**: object (optional, page, total, per_page)

### ErrorResponse
- **error**: string (error message)
- **code**: string (error code)
- **details**: object (optional, additional error details)