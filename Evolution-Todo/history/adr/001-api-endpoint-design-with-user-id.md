# ADR 001: API Endpoint Design with User ID in URL

## Status
Accepted

## Context
Hackathon documentation specifies API endpoints with `{user_id}` in the URL path:
- `GET /api/{user_id}/tasks`
- `POST /api/{user_id}/tasks`
- etc.

Industry best practice suggests extracting user ID from JWT token only, without exposing it in URLs:
- `GET /api/tasks` (user_id implicit from JWT)

## Decision
We will follow the hackathon specification and include `{user_id}` in the URL, BUT implement double verification for security:

1. Accept `{user_id}` as a URL path parameter (hackathon compliance)
2. Extract `user_id` from JWT token (security)
3. Verify both match before any operation (authorization)
4. Return 403 Forbidden if mismatch

## Reasons
1. **Hackathon Compliance:** Judges expect exact API specification match
2. **Security Maintained:** Double verification prevents unauthorized access
3. **Clear Intent:** Explicit user_id in URL makes API self-documenting
4. **Scoring:** Following exact specifications maximizes evaluation points

## Consequences

### Positive
- ✅ Meets hackathon requirements exactly
- ✅ Security not compromised (double verification)
- ✅ API endpoints are self-documenting
- ✅ Frontend code knows which user it's querying

### Negative
- ⚠️ Slightly more verbose URLs
- ⚠️ User ID exposed in URL (but protected by JWT verification)
- ⚠️ Deviation from common REST best practices

### Mitigation
- All endpoints require valid JWT token
- FastAPI middleware enforces URL user_id == JWT user_id
- 403 Forbidden returned on mismatch
- Database queries still filtered by verified user_id

## Alternatives Considered

### Alternative 1: Use JWT-only pattern (`/api/tasks`)
- **Pros:** Industry best practice, cleaner URLs
- **Cons:** Doesn't match hackathon specification, potential point deduction
- **Rejected:** Hackathon compliance prioritized

### Alternative 2: Optional user_id in URL (`/api/tasks?user_id=...`)
- **Pros:** Backward compatible with best practices
- **Cons:** Still doesn't match specification, query params less clear
- **Rejected:** Doesn't meet specification requirements

## Implementation Notes
```python
# Every endpoint follows this pattern:
@app.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,  # Hackathon specification
    current_user: User = Depends(get_current_user)  # Security
):
    # Double verification
    if user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    # Safe to proceed
    return db.query(Task).filter(Task.user_id == user_id).all()
```

## References
- Hackathon Phase II Documentation: "API Endpoints" section
- FastAPI Security Best Practices: https://fastapi.tiangolo.com/tutorial/security/
- JWT RFC 7519: https://tools.ietf.org/html/rfc7519