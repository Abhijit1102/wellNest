from fastapi import FastAPI
from contextlib import asynccontextmanager

from .core.database import mongodb
from .api.v1.api import api_router
from .core.logging import get_logger, setup_logging
from .core.exceptions import api_exception_handler
from .models.apiError import ApiError
from app.config import settings

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
        await mongodb.connect()
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
        await mongodb.close()

        # Add other shutdown tasks if needed
        # e.g., await close_redis(), release model resources

        logger.info("✅ Shutdown cleanup completed")

    except Exception as e:
        logger.error(f"❌ Shutdown error: {str(e)}")


from fastapi.middleware.cors import CORSMiddleware


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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # [settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
