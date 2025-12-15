import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Get the backend directory (parent of app directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "commonminds API"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = False


settings = Settings()  # type: ignore

