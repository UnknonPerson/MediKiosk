"""FastAPI application entry point."""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routes import processing

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")

    # Validate configuration
    if not settings.internal_service_token:
        logger.warning(
            "INTERNAL_SERVICE_TOKEN not set - "
            "service will reject all processing requests"
        )

    yield

    logger.info("Shutting down document processing service")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Internal document processing service for Vaidyam",
    lifespan=lifespan,
)

# CORS configuration (restrictive - only for internal communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # No CORS for internal service
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(processing.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns service health information for monitoring
    and deployment verification.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "configured": bool(settings.internal_service_token),
    }


@app.get("/", tags=["root"])
async def root() -> dict:
    """Root endpoint returning service information."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }
