import os
import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from dotenv import load_dotenv # type: ignore

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
    return urlunsplit(
        (parts.scheme, parts.netloc, parts.path, normalized_query, parts.fragment)
    )

DATABASE_URL = normalize_database_url((os.getenv("DATABASE_URL") or "").strip())
PORT = int(os.getenv("PORT", "8001"))

# Matching Constants
DEFAULT_ALPHA = float(os.getenv("MATCHING_DEFAULT_ALPHA", "0.7"))
DEFAULT_TOP_K = int(os.getenv("MATCHING_DEFAULT_TOP_K", "20"))
DEFAULT_MIN_SCORE = float(os.getenv("MATCHING_DEFAULT_MIN_SCORE", "0"))
REQUIRED_LEVEL_GAP_TOLERANCE = int(os.getenv("MATCHING_REQUIRED_SKILL_GAP_TOLERANCE", "0"))
MANDATORY_THRESHOLD = float(os.getenv("MATCHING_MANDATORY_THRESHOLD", "0.85"))

# Semantic Constants
SEMANTIC_ENABLED = (os.getenv("MATCHING_ENABLE_SEMANTIC", "true") or "true").strip().lower() == "true"
SEMANTIC_MODEL_NAME = (os.getenv("MATCHING_SEMANTIC_MODEL", "sentence-transformers/all-MiniLM-L6-v2") or "").strip()

# AI Constants
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Regex & Static Mappings
WORD_RE = re.compile(r"[a-zA-Z0-9_\-\+\.]+")
SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "ts": "typescript",
    "js": "javascript",
    "py": "python",
}
