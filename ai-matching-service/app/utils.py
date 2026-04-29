"""
Shared utility helpers for the matching service.
"""

from __future__ import annotations

import re
from collections import Counter
from typing import Dict

from app.config import DEFAULT_ALPHA, DEFAULT_MIN_SCORE, DEFAULT_TOP_K
from app.models.schemas import MatchRequestBase

# ── Skill-name normalisation ─────────────────────────────────────────────────

WORD_RE = re.compile(r"[a-zA-Z0-9_\-\+\.]+")

SKILL_ALIASES: Dict[str, str] = {
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "ts": "typescript",
    "js": "javascript",
    "py": "python",
}


def canonicalize_skill_name(skill_name: str) -> str:
    """Return the canonical lower-cased skill name."""
    normalized = (skill_name or "").strip().lower()
    return SKILL_ALIASES.get(normalized, normalized)


# ── Text helpers ──────────────────────────────────────────────────────────────

def clamp_100(value: float) -> int:
    """Clamp a float to int in [0, 100]."""
    return max(0, min(100, int(round(value))))


def tokenize(text: str) -> Counter:
    """Simple bag-of-words tokeniser."""
    tokens = [t.lower() for t in WORD_RE.findall(text or "") if len(t) > 1]
    return Counter(tokens)


# ── Runtime parameter parsing ─────────────────────────────────────────────────

def parse_runtime_params(payload: MatchRequestBase) -> Dict[str, float | int]:
    """Merge caller-supplied params with config defaults."""
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    top_k = DEFAULT_TOP_K if payload.top_k is None else int(payload.top_k)
    min_score = DEFAULT_MIN_SCORE if payload.min_score is None else float(payload.min_score)
    return {
        "alpha": max(0.0, min(1.0, alpha)),
        "top_k": max(1, top_k),
        "min_score": max(0.0, min(100.0, min_score)),
    }
