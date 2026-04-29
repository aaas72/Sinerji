"""
Semantic similarity engine.

Provides transformer-based semantic similarity with a bag-of-words fallback.
Now includes skill-level semantic matching using cached embeddings so the model
can understand that "React" ≈ "Vue.js" ≈ "Frontend Framework" etc.
"""

from __future__ import annotations

import math
from collections import Counter
from typing import Dict, List, Optional, Tuple

import numpy as np

from app.config import SEMANTIC_ENABLED, SEMANTIC_MODEL_NAME
from app.utils import canonicalize_skill_name, tokenize

# ── Module-level singletons ───────────────────────────────────────────────────

_semantic_model = None
_semantic_model_error: Optional[Exception] = None

# Cache: canonical_skill_name → embedding vector (numpy array)
_skill_embedding_cache: Dict[str, "np.ndarray"] = {}


def get_semantic_model():
    """
    Lazy-load and cache the SentenceTransformer model.

    Priority:
      1. Local fine-tuned model  (models/sinerji-skill-matcher) -- if it exists
      2. Model from MATCHING_SEMANTIC_MODEL env var
      3. Default: all-MiniLM-L6-v2
    """
    global _semantic_model, _semantic_model_error

    if not SEMANTIC_ENABLED:
        return None
    if _semantic_model_error is not None:
        return None
    if _semantic_model is not None:
        return _semantic_model

    try:
        from pathlib import Path
        from sentence_transformers import SentenceTransformer

        # Prefer locally fine-tuned model if it exists
        local_model = Path(__file__).parent.parent.parent / "models" / "sinerji-skill-matcher"
        if local_model.exists() and (local_model / "config.json").exists():
            model_name = str(local_model)
            print(f"[semantic] Loading FINE-TUNED model from {local_model.name}")
        else:
            model_name = SEMANTIC_MODEL_NAME
            print(f"[semantic] Loading base model: {model_name}")

        _semantic_model = SentenceTransformer(model_name)
        return _semantic_model
    except Exception as ex:
        _semantic_model_error = ex
        return None



# ── Low-level similarity helpers ──────────────────────────────────────────────

def cosine_similarity_bow(a: Counter, b: Counter) -> float:
    """Bag-of-words cosine similarity (fallback when no transformer model)."""
    if not a or not b:
        return 0.0
    common = set(a).intersection(b)
    dot = sum(a[token] * b[token] for token in common)
    norm_a = math.sqrt(sum(v * v for v in a.values()))
    norm_b = math.sqrt(sum(v * v for v in b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))


def _embed(text: str) -> Optional["np.ndarray"]:
    """Return a unit-normalised embedding for `text`, or None if unavailable."""
    model = get_semantic_model()
    if model is None:
        return None
    try:
        vec = model.encode([text], normalize_embeddings=True)[0]
        return vec
    except Exception:
        return None


# ── Public: text-level similarity ─────────────────────────────────────────────

def semantic_similarity(task_text: str, target_text: str) -> float:
    """
    Compute semantic similarity between two long texts.

    Uses SentenceTransformer embeddings when available,
    falls back to bag-of-words cosine similarity otherwise.
    """
    task_text = (task_text or "").strip()
    target_text = (target_text or "").strip()
    if not task_text or not target_text:
        return 0.0

    emb_task = _embed(task_text)
    if emb_task is None:
        return cosine_similarity_bow(tokenize(task_text), tokenize(target_text))

    emb_target = _embed(target_text)
    if emb_target is None:
        return cosine_similarity_bow(tokenize(task_text), tokenize(target_text))

    dot = float(np.dot(emb_task, emb_target))
    return max(0.0, min(1.0, dot))


# ── Public: skill-level semantic matching ─────────────────────────────────────

def _get_skill_embedding(skill_name: str) -> Optional["np.ndarray"]:
    """
    Return a cached embedding for a skill name.

    We embed a short descriptive phrase like "skill: React" to give the model
    enough context to distinguish skill concepts from generic words.
    """
    key = canonicalize_skill_name(skill_name)
    if key in _skill_embedding_cache:
        return _skill_embedding_cache[key]

    phrase = f"skill: {skill_name}"  # domain-agnostic prefix
    vec = _embed(phrase)
    if vec is not None:
        _skill_embedding_cache[key] = vec
    return vec


def skill_semantic_similarity(skill_a: str, skill_b: str) -> float:
    """
    Compute semantic similarity between two *skill names*.

    Strategy:
    1. Exact / alias match → 1.0
    2. Transformer embedding similarity (cached per skill)
    3. Bag-of-words fallback
    """
    canon_a = canonicalize_skill_name(skill_a)
    canon_b = canonicalize_skill_name(skill_b)

    # Exact match after canonicalization
    if canon_a == canon_b:
        return 1.0

    emb_a = _get_skill_embedding(skill_a)
    emb_b = _get_skill_embedding(skill_b)

    if emb_a is not None and emb_b is not None:
        dot = float(np.dot(emb_a, emb_b))
        return max(0.0, min(1.0, dot))

    # Fallback: character-level token overlap
    return cosine_similarity_bow(tokenize(skill_a), tokenize(skill_b))


def best_skill_match(
    required_skill: str,
    student_skills: List[str],
) -> Tuple[Optional[str], float]:
    """
    Find the student skill that best matches a required skill.

    Returns (best_skill_name, similarity_score).
    If no student skills are provided, returns (None, 0.0).
    """
    if not student_skills:
        return None, 0.0

    best_name: Optional[str] = None
    best_sim = 0.0
    for s_skill in student_skills:
        sim = skill_semantic_similarity(required_skill, s_skill)
        if sim > best_sim:
            best_sim = sim
            best_name = s_skill

    return best_name, best_sim
