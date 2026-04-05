from fastapi import FastAPI
from contextlib import asynccontextmanager

from .core.database import connect_to_mongo, close_mongo_connection
from .api.v1.api import api_router
from .core.logging import get_logger, setup_logging
from .core.exceptions import api_exception_handler
from .model.apiError import ApiError

# -----------------------------
# INIT LOGGING FIRST
# -----------------------------
setup_logging()
logger = get_logger(__name__)

# -----------------------------
# Lifespan (Startup + Shutdown)
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🔹 Startup
    logger.info("🚀 Starting WellNest backend...")

    try:
        # Initialize MongoDB
        await connect_to_mongo()
        logger.info("✅ MongoDB connected")

        # You can add other service initializations here
        # e.g., Redis, LLM models, caches, etc.

        logger.info("✅ All services initialized successfully")

    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise

    # 👉 App runs here
    yield

    # 🔹 Shutdown
    logger.info("🛑 Shutting down WellNest backend...")

    try:
        # Cleanup resources
        await close_mongo_connection()

        # Add other shutdown tasks if needed
        # e.g., await close_redis(), release model resources

        logger.info("✅ Shutdown cleanup completed")

    except Exception as e:
        logger.error(f"❌ Shutdown error: {str(e)}")


# -----------------------------
# App Factory
# -----------------------------
def create_app() -> FastAPI:
    app = FastAPI(
        title="WellNest API",
        version="1.0.0",
        description="AI-powered mental health backend",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # -------------------------
    # Exception Handlers
    # -------------------------
    app.add_exception_handler(ApiError, api_exception_handler)

    # -------------------------
    # Routers
    # -------------------------
    app.include_router(api_router, prefix="/api/v1")

    # -------------------------
    # Root endpoint (optional)
    # -------------------------
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to WellNest API",
            "docs": "/docs",
        }

    return app


# -----------------------------
# App Instance
# -----------------------------
app = create_app()