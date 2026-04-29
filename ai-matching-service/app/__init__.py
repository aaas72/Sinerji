"""
Sinerji AI Matching Microservice – application factory.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import close_pool, open_pool
from app.routes import health, matching
from app.services.semantic import get_semantic_model


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup: open DB pool & preload semantic model.  Shutdown: close pool."""
    open_pool()
    get_semantic_model()  # Preload the model on startup
    yield
    close_pool()


app = FastAPI(
    title="Sinerji AI Matching Microservice",
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(matching.router)
