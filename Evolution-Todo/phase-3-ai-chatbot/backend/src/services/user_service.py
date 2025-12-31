from sqlmodel import Session, select
from typing import Optional
from ..models.user import User
from ..auth.password import hash_password, verify_password


def create_user(
    session: Session, email: str, password: str, name: Optional[str] = None
) -> User:
    """
    Create a new user with the given email, password, and optional name.

    Args:
        session: SQLModel session
        email: User's email address
        password: Plain text password to hash
        name: Optional user name

    Returns:
        User: The created user object
    """
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise ValueError("User with this email already exists")

    # Hash the password
    password_hash = hash_password(password)

    # Create the user
    user = User(email=email, password_hash=password_hash, name=name)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def authenticate_user(
    session: Session, email: str, password: str
) -> Optional[User]:
    """
    Authenticate a user by email and password.

    Args:
        session: SQLModel session
        email: User's email address
        password: Plain text password to verify

    Returns:
        User: The authenticated user if credentials are valid, None otherwise
    """
    # Find user by email
    user = session.exec(select(User).where(User.email == email)).first()

    # Verify user exists and password is correct
    if user and verify_password(password, user.password_hash):
        return user

    return None


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by email.

    Args:
        session: SQLModel session
        email: User's email address

    Returns:
        User: The user if found, None otherwise
    """
    user = session.exec(select(User).where(User.email == email)).first()
    return user
