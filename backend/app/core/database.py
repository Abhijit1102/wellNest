from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class MongoDB:
    _client: Optional[AsyncIOMotorClient] = None
    _db: Optional[AsyncIOMotorDatabase] = None

    # Singleton instance
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance

    async def connect(self):
        if not self._client:
            try:
                self._client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    maxPoolSize=100,
                    minPoolSize=5,
                    serverSelectionTimeoutMS=5000,
                )
                self._db = self._client[settings.DATABASE_NAME]

                # Test connection
                await self._client.admin.command("ping")
                logger.info("✅ MongoDB connected")
            except Exception as e:
                logger.error(f"❌ MongoDB connection failed: {e}")
                raise

    async def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("❌ MongoDB disconnected")

    def get_db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("MongoDB not connected")
        return self._db

    def get_collection(self, name: str) -> AsyncIOMotorCollection:
        return self.get_db()[name]


# Create singleton instance
mongodb = MongoDB()
