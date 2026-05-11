import math
from typing import List, Dict, Any
from app.core.config import SEMANTIC_ENABLED, SEMANTIC_MODEL_NAME, WORD_RE
from app.models.schemas import ProjectEvidence

try:
    from sentence_transformers import SentenceTransformer  # type: ignore
except ImportError:
    SentenceTransformer = None

_semantic_model = None
_semantic_model_error = None

def tokenize(text: str) -> List[str]:
    return WORD_RE.findall((text or "").lower())

def get_semantic_model():
    global _semantic_model, _semantic_model_error
    if not SEMANTIC_ENABLED:
        return None
    if _semantic_model_error is not None:
        return None
    if _semantic_model is not None:
        return _semantic_model
    try:
        if SentenceTransformer is None:
            raise ImportError("sentence_transformers not available")
        _semantic_model = SentenceTransformer(SEMANTIC_MODEL_NAME)
        return _semantic_model
    except Exception as ex:
        _semantic_model_error = ex
        return None

def cosine_similarity_bow(vec1: List[str], vec2: List[str]) -> float:
    from collections import Counter
    c1, c2 = Counter(vec1), Counter(vec2)
    words = list(set(c1.keys()) | set(c2.keys()))
    v1 = [c1.get(w, 0) for w in words]
    v2 = [c2.get(w, 0) for w in words]
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(a * a for a in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (mag1 * mag2)))

def semantic_similarity(task_text: str, target_text: str) -> float:
    """Compute cosine similarity between two texts using SentenceTransformer or BoW fallback."""
    task_text = (task_text or "").strip()
    target_text = (target_text or "").strip()
    if not task_text or not target_text:
        return 0.0

    model = get_semantic_model()
    if model is None:
        return cosine_similarity_bow(tokenize(task_text), tokenize(target_text))

    embeddings = model.encode([task_text, target_text])
    t_emb, s_emb = embeddings[0], embeddings[1]

    # FIX: Proper cosine similarity with magnitude division
    dot = float(sum(float(a) * float(b) for a, b in zip(t_emb, s_emb)))
    mag1 = math.sqrt(float(sum(float(a) ** 2 for a in t_emb)))
    mag2 = math.sqrt(float(sum(float(a) ** 2 for a in s_emb)))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (mag1 * mag2)))

def evaluate_semantic_stage(
    task_text: str,
    profile_text: str,
    projects: List[ProjectEvidence],
    submission_content: str = "",
) -> Dict[str, Any]:
    """Evaluate semantic similarity with an ADAPTIVE formula based on data availability."""
    profile_score = semantic_similarity(task_text, profile_text)
    submission_score = semantic_similarity(task_text, submission_content)

    project_scored: List[Dict[str, Any]] = []
    for p in projects:
        sim = semantic_similarity(task_text, f"{p.title} {p.description}")
        project_scored.append({"title": p.title, "similarity": sim})
    project_scored.sort(key=lambda x: x["similarity"], reverse=True)
    top_projects = project_scored[:2]

    avg_project_sim = 0.0
    if project_scored:
        avg_project_sim = sum(float(x["similarity"]) for x in project_scored) / len(project_scored)

    has_projects = len(projects) > 0

    # ADAPTIVE FORMULA: adjusts weights based on available data
    if has_projects:
        # Rich data: profile (25%) + projects (50%) + submission (25%)
        semantic_score = profile_score * 25.0 + avg_project_sim * 50.0 + submission_score * 25.0
    else:
        # No projects: profile (55%) + submission (45%)
        semantic_score = profile_score * 55.0 + submission_score * 45.0

    return {
        "profile_similarity": profile_score,
        "submission_similarity": submission_score,
        "project_similarities": project_scored,
        "top_projects": top_projects,
        "has_projects": has_projects,
        "semantic_score": max(0.0, min(100.0, semantic_score)),
    }
