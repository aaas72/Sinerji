"""
Health-check endpoint.
"""

from __future__ import annotations

from typing import Dict

from fastapi import APIRouter

from app.config import SEMANTIC_ENABLED
from app.services.semantic import get_semantic_model

router = APIRouter()


@router.get("/health")
def health() -> Dict[str, str]:
    model_ready = get_semantic_model() is not None
    return {
        "status": "ok",
        "semantic": "enabled" if SEMANTIC_ENABLED else "disabled",
        "semantic_model_loaded": "yes" if model_ready else "no",
    }
