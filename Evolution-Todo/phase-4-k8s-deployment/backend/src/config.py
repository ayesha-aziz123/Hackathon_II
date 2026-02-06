from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Required fields
    database_url: str
    better_auth_secret: str
    
    # Optional fields with defaults
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    
    # Additional fields from .env
    better_auth_url: Optional[str] = Field(env="BETTER_AUTH_URL") # type: ignore
    access_token_expires_in: Optional[str] = "7d"
    neon_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"  

settings = Settings()




