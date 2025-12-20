# API Contracts: Full-Stack Multi-User Todo Web Application

## Overview
This document defines the API contracts for the todo application following the exact 6 endpoints specified in the hackathon requirements. All endpoints require JWT authentication and enforce user data isolation.

## Authentication
All API endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The backend verifies the JWT token using the shared BETTER_AUTH_SECRET and extracts the user_id from the token. The user_id in the JWT token must match the user_id in the URL path for all requests.

## Endpoints

### 1. GET /api/{user_id}/tasks
**Description**: Retrieve all tasks for the specified user

**Request**:
- Method: GET
- Path: `/api/{user_id}/tasks`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)

**Response**:
- Success: 200 OK
- Body: Array of task objects
```json
[
  {
    "id": "task-uuid",
    "user_id": "user-uuid",
    "title": "Task title",
    "description": "Task description",
    "priority": "high|medium|low",
    "tags": ["tag1", "tag2"],
    "due_date": "2023-12-31T10:00:00Z",
    "completed": false,
    "completed_at": null,
    "recurrence_pattern": "daily|weekly|monthly",
    "recurrence_end_date": "2024-12-31T10:00:00Z",
    "notification_time_before": 15,
    "created_at": "2023-01-01T10:00:00Z",
    "updated_at": "2023-01-01T10:00:00Z"
  }
]
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id
- 404 Not Found: User doesn't exist

### 2. POST /api/{user_id}/tasks
**Description**: Create a new task for the specified user

**Request**:
- Method: POST
- Path: `/api/{user_id}/tasks`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)
- Body:
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15
}
```

**Response**:
- Success: 201 Created
- Body: Created task object
```json
{
  "id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "completed": false,
  "completed_at": null,
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15,
  "created_at": "2023-01-01T10:00:00Z",
  "updated_at": "2023-01-01T10:00:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id

### 3. GET /api/{user_id}/tasks/{id}
**Description**: Retrieve a specific task for the specified user

**Request**:
- Method: GET
- Path: `/api/{user_id}/tasks/{id}`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)
  - `id`: The task ID

**Response**:
- Success: 200 OK
- Body: Task object
```json
{
  "id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "completed": false,
  "completed_at": null,
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15,
  "created_at": "2023-01-01T10:00:00Z",
  "updated_at": "2023-01-01T10:00:00Z"
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id
- 404 Not Found: Task doesn't exist or doesn't belong to user

### 4. PUT /api/{user_id}/tasks/{id}
**Description**: Update a specific task for the specified user

**Request**:
- Method: PUT
- Path: `/api/{user_id}/tasks/{id}`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)
  - `id`: The task ID
- Body: All fields from POST request (all fields required for update)
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15
}
```

**Response**:
- Success: 200 OK
- Body: Updated task object
```json
{
  "id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "completed": false,
  "completed_at": null,
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15,
  "created_at": "2023-01-01T10:00:00Z",
  "updated_at": "2023-01-01T10:00:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id
- 404 Not Found: Task doesn't exist or doesn't belong to user

### 5. DELETE /api/{user_id}/tasks/{id}
**Description**: Delete a specific task for the specified user

**Request**:
- Method: DELETE
- Path: `/api/{user_id}/tasks/{id}`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)
  - `id`: The task ID

**Response**:
- Success: 204 No Content

**Error Responses**:
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id
- 404 Not Found: Task doesn't exist or doesn't belong to user

### 6. PATCH /api/{user_id}/tasks/{id}/complete
**Description**: Mark a specific task as complete/incomplete for the specified user

**Request**:
- Method: PATCH
- Path: `/api/{user_id}/tasks/{id}/complete`
- Headers:
  - `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `user_id`: The user ID (must match JWT token user ID)
  - `id`: The task ID
- Body:
```json
{
  "completed": true
}
```

**Response**:
- Success: 200 OK
- Body: Updated task object
```json
{
  "id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "due_date": "2023-12-31T10:00:00Z",
  "completed": true,
  "completed_at": "2023-01-01T10:00:00Z",
  "recurrence_pattern": "daily|weekly|monthly",
  "recurrence_end_date": "2024-12-31T10:00:00Z",
  "notification_time_before": 15,
  "created_at": "2023-01-01T10:00:00Z",
  "updated_at": "2023-01-01T10:00:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: URL user_id doesn't match JWT token user_id
- 404 Not Found: Task doesn't exist or doesn't belong to user

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "User ID in URL does not match authenticated user"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid request data",
  "errors": [
    {
      "field": "title",
      "message": "Field required"
    }
  ]
}
```