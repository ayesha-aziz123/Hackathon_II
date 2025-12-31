from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session
from typing import Optional
from datetime import datetime

from ..models.user import User, UserRead, UserUpdate
from ..database.connection import get_session_dep
from ..auth.jwt import get_current_user
from ..schemas.user import UserResponse
from ..services.user_service import get_user_by_email

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """
    Get the current user's profile information
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """
    Update the current user's profile information
    """
    # Check if another user already has this email (if email is being updated)
    if user_update.email and user_update.email != current_user.email:
        existing_user = await get_user_by_email(session, user_update.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists"
            )
        current_user.email = user_update.email

    # Update name if provided
    if user_update.name is not None:
        current_user.name = user_update.name

    # Update password if provided
    if user_update.password:
        from ..auth.password import hash_password
        current_user.password_hash = hash_password(user_update.password)

    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user


@router.patch("/me/preferences", response_model=UserResponse)
async def update_user_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """
    Update user preferences (theme, notifications, etc.)
    """
    # Initialize preferences if not already set
    if current_user.preferences is None:
        current_user.preferences = {}

    # Update preferences
    current_user.preferences.update(preferences)
    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user


@router.put("/me/password", response_model=dict)
async def update_user_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """
    Update user password
    """
    from ..auth.password import verify_password, hash_password

    # Verify current password
    if not verify_password(password_data.get("current_password"), current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Hash and update new password
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password is required"
        )

    current_user.password_hash = hash_password(new_password)
    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()

    return {"message": "Password updated successfully"}


@router.delete("/me", response_model=dict)
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """
    Delete the current user's account
    """
    # In a real implementation, you might want to:
    # 1. Mark user as inactive instead of deleting
    # 2. Delete related data
    # 3. Send confirmation email

    session.delete(current_user)
    session.commit()

    return {"message": "Account deleted successfully"}