# from passlib.context import CryptContext
# import hashlib
# # Create password context for bcrypt hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str) -> str:
#     """
#     Hash a password using bcrypt

#     Args:
#         password: Plain text password to hash

#     Returns:
#         str: Hashed password
#     """
#     # Truncate password to 72 bytes if needed to avoid bcrypt limitation
#     # sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
#     # return pwd_context.hash(sha256_hash)

#     sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
#     return pwd_context.hash(sha256_hash)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """
#     Verify a plain password against a hashed password

#     Args:
#         plain_password: Plain text password to verify
#         hashed_password: Hashed password to compare against

#     Returns:
#         bool: True if passwords match, False otherwise
#     """
#     # Truncate password to 72 bytes if needed to avoid bcrypt limitation
#     sha256_hash = hashlib.sha256(plain_password.encode('utf-8')).digest()
#     if pwd_context.verify(sha256_hash, hashed_password):
#         return True
    
#     # Fallback to old truncation for old users
#     truncated_pw = plain_password
#     if len(plain_password.encode('utf-8')) > 72:
#         truncated_pw = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
#     if pwd_context.verify(truncated_pw, hashed_password):
#         # If matches old way, update to new hash in DB (in authenticate_user)
#         return True
#     return False



import bcrypt

# BCrypt has a 72 byte limit
MAX_PASSWORD_LENGTH = 72

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # ✅ Clean password - remove NULL bytes
    clean_password = password.replace('\x00', '').strip()
    
    if not clean_password:
        raise ValueError("Password cannot be empty")
    
    if len(clean_password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    # ✅ FIX: Truncate password to 72 bytes (bcrypt limit)
    password_bytes = clean_password.encode('utf-8')
    if len(password_bytes) > MAX_PASSWORD_LENGTH:
        password_bytes = password_bytes[:MAX_PASSWORD_LENGTH]
    
    # Hash using bcrypt directly
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # ✅ Clean password before verification
    clean_password = plain_password.replace('\x00', '').strip()
    
    # ✅ FIX: Apply same truncation during verification
    password_bytes = clean_password.encode('utf-8')
    if len(password_bytes) > MAX_PASSWORD_LENGTH:
        password_bytes = password_bytes[:MAX_PASSWORD_LENGTH]
    
    # Verify using bcrypt directly
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))








# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # BCrypt has a 72 byte limit
# MAX_PASSWORD_LENGTH = 72

# def hash_password(password: str) -> str:
#     """Hash a password using bcrypt"""
#     # ✅ Clean password - remove NULL bytes
#     clean_password = password.replace('\x00', '').strip()
    
#     if not clean_password:
#         raise ValueError("Password cannot be empty")
    
#     if len(clean_password) < 8:
#         raise ValueError("Password must be at least 8 characters")
    
#     # ✅ FIX: Truncate password to 72 bytes (bcrypt limit)
#     if len(clean_password.encode('utf-8')) > MAX_PASSWORD_LENGTH:
#         # Truncate at byte level, not character level
#         password_bytes = clean_password.encode('utf-8')[:MAX_PASSWORD_LENGTH]
#         clean_password = password_bytes.decode('utf-8', errors='ignore')
    
#     return pwd_context.hash(clean_password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """Verify a password against its hash"""
#     # ✅ Clean password before verification
#     clean_password = plain_password.replace('\x00', '').strip()
    
#     # ✅ FIX: Apply same truncation during verification
#     if len(clean_password.encode('utf-8')) > MAX_PASSWORD_LENGTH:
#         password_bytes = clean_password.encode('utf-8')[:MAX_PASSWORD_LENGTH]
#         clean_password = password_bytes.decode('utf-8', errors='ignore')
    
#     return pwd_context.verify(clean_password, hashed_password)