from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import select
from datetime import timedelta
from typing import Optional
from sqlmodel import Session
from ..models.user import User, UserCreate
from ..database.connection import get_session_dep
from ..auth.password import hash_password, verify_password
from src.auth.jwt import create_access_token
from ..config import settings
from ..schemas.auth import LoginRequest, RegisterRequest, AuthResponse
from ..services.user_service import create_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse)
def register(
    register_request: RegisterRequest, session: Session = Depends(get_session_dep)
):
    """
    Register a new user with email and password
    """
    try:
        # Validate input data
        if not register_request.email or not register_request.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )

        if len(register_request.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long",
            )

        # Create user using the service
        user = create_user(
            session=session,
            email=register_request.email,
            password=register_request.password,
            name=register_request.name,
        )

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=access_token_expires,
        )

        # Return user data with access token
        return AuthResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="bearer",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),  # Using the error message from the service
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration",
        )


@router.post("/login", response_model=AuthResponse)
def login(login_request: LoginRequest, session: Session = Depends(get_session_dep)):
    """
    Authenticate user with email and password
    """
    try:
        # Validate input data
        if not login_request.email or not login_request.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )
        

        
        user = authenticate_user(
            session=session, email=login_request.email, password=login_request.password
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=access_token_expires,
        )

        # Return user data with access token
        return AuthResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="bearer",
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login",
        )
