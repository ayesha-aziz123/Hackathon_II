from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import select
from datetime import timedelta
from typing import Optional
from sqlmodel import Session
from ..models.user import User, UserCreate
from ..database.connection import get_session_dep
from ..auth.password import hash_password, verify_password
from ..auth.jwt import create_access_token
from ..config import settings
from ..schemas.auth import LoginRequest, RegisterRequest, AuthResponse
from ..services.user_service import create_user, authenticate_user

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=AuthResponse)
async def register(register_request: RegisterRequest, session: Session = Depends(get_session_dep)):
    """
    Register a new user with email and password
    """
    try:
        # Create user using the service
        user = await create_user(
            session=session,
            email=register_request.email,
            password=register_request.password,
            name=register_request.name
        )

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=access_token_expires
        )

        # Return user data with access token
        return AuthResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="bearer"
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )


@router.post("/login", response_model=AuthResponse)
async def login(login_request: LoginRequest, session: Session = Depends(get_session_dep)):
    """
    Authenticate user with email and password
    """
    user = await authenticate_user(
        session=session,
        email=login_request.email,
        password=login_request.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )

    # Return user data with access token
    return AuthResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        access_token=access_token,
        token_type="bearer"
    )