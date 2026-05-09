"""
Entry point for the AI Matching Microservice.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

from app import app  # noqa: F401
