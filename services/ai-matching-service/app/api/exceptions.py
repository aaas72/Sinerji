from fastapi import Request, status # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from app.core.logger import logger

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected internal error occurred.",
            "type": type(exc).__name__,
            "message": str(exc) if hasattr(exc, 'message') else "See logs for details"
        }
    )

async def http_exception_handler(request: Request, exc: Exception):
    # This matches FastAPI's HTTPException
    return JSONResponse(
        status_code=getattr(exc, 'status_code', 400),
        content={"detail": getattr(exc, 'detail', str(exc))}
    )
