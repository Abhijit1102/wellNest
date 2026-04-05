from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # -------------------------
    # App Info
    # -------------------------
    APP_NAME: str = "WellNest"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"  # "development"  # development | staging | production

    # -------------------------
    # Logging
    # -------------------------
    LOG_LEVEL: str = "INFO"

    # -------------------------
    # Pydantic Config
    # -------------------------
    class Config:
        env_file = ".env"
        case_sensitive = True


# Singleton (cached settings)
@lru_cache
def get_settings() -> Settings:
    return Settings()


# Global settings instance
settings = get_settings()
