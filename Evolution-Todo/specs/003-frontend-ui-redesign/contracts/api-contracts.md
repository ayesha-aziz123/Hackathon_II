# Frontend API Contracts: Todo App UI Redesign

## Authentication Contracts

### User Session Management

**GET /api/auth/session**
- **Purpose**: Get current user session
- **Request**: None (uses cookie/header auth)
- **Response**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "expiresAt": "string (ISO timestamp)"
  }
  ```

**POST /api/auth/login**
- **Purpose**: Authenticate user
- **Request**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "token": "string (JWT)"
  }
  ```

**POST /api/auth/logout**
- **Purpose**: End user session
- **Request**: None
- **Response**: `{ "success": true }`

## Task Management Contracts

### Get User Tasks

**GET /api/tasks**
- **Purpose**: Get all tasks for authenticated user
- **Query Parameters**:
  - `status` (optional): 'pending' | 'in-progress' | 'completed'
  - `search` (optional): string (search term)
  - `sort` (optional): 'created_at' | 'due_date' | 'priority'
  - `order` (optional): 'asc' | 'desc'
  - `page` (optional): number
  - `limit` (optional): number
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "status": "pending" | "in-progress" | "completed",
        "priority": "low" | "medium" | "high",
        "due_date": "string (ISO timestamp)" | null,
        "tags": ["string"],
        "created_at": "string (ISO timestamp)",
        "updated_at": "string (ISO timestamp)",
        "completed_at": "string (ISO timestamp)" | null
      }
    ],
    "pagination": {
      "page": number,
      "total": number,
      "per_page": number,
      "total_pages": number
    }
  }
  ```

### Create Task

**POST /api/tasks**
- **Purpose**: Create a new task
- **Request**:
  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "status": "pending" | "in-progress" | "completed" (default: "pending"),
    "priority": "low" | "medium" | "high" (default: "medium"),
    "due_date": "string (ISO timestamp)" | null,
    "tags": ["string"] (optional)
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "pending" | "in-progress" | "completed",
      "priority": "low" | "medium" | "high",
      "due_date": "string (ISO timestamp)" | null,
      "tags": ["string"],
      "created_at": "string (ISO timestamp)",
      "updated_at": "string (ISO timestamp)"
    }
  }
  ```

### Get Single Task

**GET /api/tasks/{id}**
- **Purpose**: Get a specific task
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "pending" | "in-progress" | "completed",
      "priority": "low" | "medium" | "high",
      "due_date": "string (ISO timestamp)" | null,
      "tags": ["string"],
      "created_at": "string (ISO timestamp)",
      "updated_at": "string (ISO timestamp)",
      "completed_at": "string (ISO timestamp)" | null
    }
  }
  ```

### Update Task

**PUT /api/tasks/{id}**
- **Purpose**: Update a task completely
- **Request**:
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "pending" | "in-progress" | "completed",
    "priority": "low" | "medium" | "high",
    "due_date": "string (ISO timestamp)" | null,
    "tags": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "pending" | "in-progress" | "completed",
      "priority": "low" | "medium" | "high",
      "due_date": "string (ISO timestamp)" | null,
      "tags": ["string"],
      "created_at": "string (ISO timestamp)",
      "updated_at": "string (ISO timestamp)",
      "completed_at": "string (ISO timestamp)" | null
    }
  }
  ```

### Patch Task (Status Update)

**PATCH /api/tasks/{id}**
- **Purpose**: Partially update a task (optimistic updates)
- **Request**:
  ```json
  {
    "title"?: "string",
    "description"?: "string",
    "status"?: "pending" | "in-progress" | "completed",
    "priority"?: "low" | "medium" | "high",
    "due_date"?: "string (ISO timestamp)" | null,
    "tags"?: ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "pending" | "in-progress" | "completed",
      "priority": "low" | "medium" | "high",
      "due_date": "string (ISO timestamp)" | null,
      "tags": ["string"],
      "created_at": "string (ISO timestamp)",
      "updated_at": "string (ISO timestamp)",
      "completed_at": "string (ISO timestamp)" | null
    }
  }
  ```

### Complete Task

**PATCH /api/tasks/{id}/complete**
- **Purpose**: Mark a task as completed
- **Request**:
  ```json
  {
    "completed": "boolean"
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "pending" | "in-progress" | "completed",
      "priority": "low" | "medium" | "high",
      "due_date": "string (ISO timestamp)" | null,
      "tags": ["string"],
      "created_at": "string (ISO timestamp)",
      "updated_at": "string (ISO timestamp)",
      "completed_at": "string (ISO timestamp)" | null
    }
  }
  ```

### Delete Task

**DELETE /api/tasks/{id}**
- **Purpose**: Delete a task
- **Response**: `{ "success": true }`

## UI State Management Contracts

### Theme Management

**GET /api/user/preferences**
- **Purpose**: Get user preferences including theme
- **Response**:
  ```json
  {
    "data": {
      "theme": "light" | "dark" | "system",
      "notifications": boolean,
      "language": "string"
    }
  }
  ```

**PUT /api/user/preferences**
- **Purpose**: Update user preferences
- **Request**:
  ```json
  {
    "theme": "light" | "dark" | "system",
    "notifications": boolean
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "theme": "light" | "dark" | "system",
      "notifications": boolean,
      "language": "string"
    }
  }
  ```

## Error Response Format

All error responses follow this format:
```json
{
  "error": {
    "code": "string (error code)",
    "message": "string (user-friendly message)",
    "details": "object (optional, additional details)"
  }
}
```

## HTTP Status Codes

- `200`: Success for GET, PUT, PATCH requests
- `201`: Success for POST requests (resource created)
- `204`: Success for DELETE requests (no content)
- `400`: Bad request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `500`: Internal server error