"""
Application configuration.

Loads environment variables and validates settings for the AI matching microservice.
"""

from __future__ import annotations

import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv

load_dotenv()


def normalize_database_url(raw_url: str) -> str:
    """Strip Prisma-specific params (e.g. schema) not understood by psycopg."""
    parts = urlsplit(raw_url)
    query_items = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k.lower() != "schema"
    ]
    normalized_query = urlencode(query_items)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, normalized_query, parts.fragment))


# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = normalize_database_url((os.getenv("DATABASE_URL") or "").strip())
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for AI matching microservice")

# ── Matching defaults ─────────────────────────────────────────────────────────
DEFAULT_ALPHA = float(os.getenv("MATCHING_DEFAULT_ALPHA", "0.7"))
DEFAULT_TOP_K = int(os.getenv("MATCHING_DEFAULT_TOP_K", "20"))
DEFAULT_MIN_SCORE = float(os.getenv("MATCHING_DEFAULT_MIN_SCORE", "0"))
REQUIRED_LEVEL_GAP_TOLERANCE = int(os.getenv("MATCHING_REQUIRED_SKILL_GAP_TOLERANCE", "0"))

# ── Semantic model ────────────────────────────────────────────────────────────
SEMANTIC_MODEL_NAME = (
    os.getenv("MATCHING_SEMANTIC_MODEL", "sentence-transformers/all-MiniLM-L6-v2") or ""
).strip()
SEMANTIC_ENABLED = (
    (os.getenv("MATCHING_ENABLE_SEMANTIC", "true") or "true").strip().lower() == "true"
)

# ── Validation ────────────────────────────────────────────────────────────────
if DEFAULT_ALPHA < 0 or DEFAULT_ALPHA > 1:
    raise RuntimeError("MATCHING_DEFAULT_ALPHA must be between 0 and 1")
if DEFAULT_TOP_K <= 0:
    raise RuntimeError("MATCHING_DEFAULT_TOP_K must be > 0")
