from .core.database import db
from app.config import settings


def get_database():
    return db.client[settings.DATABASE_NAME]
