from fastapi import FastAPI, HTTPException # type: ignore
from contextlib import asynccontextmanager
from app.api.endpoints import router
from app.core.config import PORT
from app.core.logger import logger
from app.api.exceptions import global_exception_handler, http_exception_handler
from app.services.semantic import get_semantic_model
from app.database.connection import db_cursor
from app.services.ontology import ensure_ontology_table

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Logic
    logger.info("Starting Sinerji AI Matching Service...")
    
    # 1. Warm up Semantic Model
    logger.info("Initializing Semantic Model (Sentence-Transformers)...")
    get_semantic_model()
    
    # 2. Ensure DB tables
    logger.info("Ensuring database schema is up to date...")
    try:
        with db_cursor() as cur:
            ensure_ontology_table(cur)
        logger.info("Database schema verified.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    # Shutdown Logic
    logger.info("Shutting down Sinerji AI Matching Service...")

app = FastAPI(
    title="Sinerji AI Matching Service",
    description="Advanced AI matching engine with Dynamic Ontology and Semantic Similarity",
    version="2.1.0",
    lifespan=lifespan
)

# Register Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Sinerji AI Matching Engine",
        "version": "2.1.0"
    }

if __name__ == "__main__":
    import uvicorn # type: ignore
    logger.info(f"Launching server on port {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
