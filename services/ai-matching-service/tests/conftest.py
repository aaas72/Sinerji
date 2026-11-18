"""Test configuration: no database, no Gemini, no transformer download."""

import os

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ["MATCHING_ENABLE_SEMANTIC"] = "false"
os.environ["GEMINI_API_KEY"] = ""
