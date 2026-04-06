from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # -------------------------
    # App Info
    # -------------------------
    APP_NAME: str = "WellNest"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"  # development | staging | production

    # -------------------------
    # Logging
    # -------------------------
    LOG_LEVEL: str = "INFO"

    # -------------------------
    # Database
    # -------------------------
    MONGODB_URL: str
    DATABASE_NAME: str

    # -------------------------
    # frontend URL
    # -------------------------
    FRONTEND_URL: str
   
    # -------------------------
    # Authentication
    # -------------------------
    SECRET_KEY : str
    ALGORITHM : str
    ACCESS_TOKEN_EXPIRE_MINUTES : int
    RESET_TOKEN_EXPIRY_MINUTES: int

    # -------------------------
    # SMTP service
    # -------------------------
    EMAIL_SENDER: str
    EMAIL_PASSWORD: str
    SMTP_SERVER: str
    SMTP_PORT: int



    
    # -------------------------
    # Pydantic Config (v2 style)
    # -------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # ignore unknown env vars
    )


# Singleton (cached settings)
@lru_cache
def get_settings() -> Settings:
    return Settings()


# Global settings instance
settings = get_settings()
