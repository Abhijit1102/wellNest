from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings
import logging


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None


db = MongoDB()


async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=100,  # connection pool
            minPoolSize=5,
            serverSelectionTimeoutMS=5000,  # fail fast
        )
        # Test connection
        await db.client.admin.command("ping")
        logging.info("✅ MongoDB connected")
    except Exception as e:
        logging.error(f"❌ MongoDB connection failed: {e}")
        raise


async def close_mongo_connection():
    if db.client:
        db.client.close()
        db.client = None
        logging.info("❌ MongoDB disconnected")


# Helper to get database instance safely
def get_database():
    if not db.client:
        raise RuntimeError("MongoDB client not connected")
    return db.client[settings.DATABASE_NAME]
