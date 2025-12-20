from passlib.context import CryptContext

# Create password context for bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password to hash

    Returns:
        str: Hashed password
    """
    # Truncate password to 72 bytes if needed to avoid bcrypt limitation
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        bool: True if passwords match, False otherwise
    """
    # Truncate password to 72 bytes if needed to avoid bcrypt limitation
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)



