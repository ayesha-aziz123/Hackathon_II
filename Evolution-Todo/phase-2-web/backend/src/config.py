from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Required fields
    database_url: str
    better_auth_secret: str
    
    # Optional fields with defaults
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 90
    
    # Additional fields from .env
    better_auth_url: Optional[str] = "http://localhost:3000"
    access_token_expires_in: Optional[str] = "7d"
    neon_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"  

settings = Settings()



