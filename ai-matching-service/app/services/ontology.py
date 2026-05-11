import google.generativeai as genai # type: ignore
from typing import List, Dict, Optional
from app.core.config import GEMINI_API_KEY, SKILL_ALIASES
from app.core.logger import logger

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _genai_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    _genai_model = None

def canonicalize_skill_name(name: str) -> str:
    normalized = (name or "").strip().lower()
    return SKILL_ALIASES.get(normalized, normalized)

def ensure_ontology_table(cur):
    """Ensure the skill_ontology table exists in the database."""
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS skill_ontology (
            id SERIAL PRIMARY KEY,
            skill_name VARCHAR(255) NOT NULL,
            parent_name VARCHAR(255) NOT NULL,
            UNIQUE(skill_name, parent_name)
        )
    """
    )

def load_ontology_cache(cur) -> Dict[str, List[str]]:
    """Load ALL ontology mappings into memory in a single query for fast lookup."""
    cur.execute("SELECT skill_name, parent_name FROM skill_ontology")
    cache: Dict[str, List[str]] = {}
    for row in cur.fetchall():
        skill = str(row[0])
        parent = str(row[1])
        cache.setdefault(skill, []).append(parent)
    return cache

def infer_skill_parents(skill_name: str) -> List[str]:
    """Ask Gemini to identify parent technologies for a new skill."""
    if not _genai_model:
        return []
    
    prompt = (
        f"Given the technology/skill '{skill_name}', what are its broader parent technologies, languages, or categories? "
        "Return ONLY a comma-separated list of lowercase strings. "
        "Example: 'Django' -> 'python, back-end, web development'. "
        "Example: 'React' -> 'javascript, front-end, web development'."
    )
    
    try:
        response = _genai_model.generate_content(prompt)
        text = response.text.strip().lower()
        parents = [p.strip() for p in text.replace(".", "").split(",") if p.strip()]
        return parents
    except Exception as e:
        logger.error(f"Gemini inference failed for {skill_name}: {e}")
        return []

def get_skill_parents(cur, skill_name: str, cache: Optional[Dict[str, List[str]]] = None) -> List[str]:
    """Get parents from in-memory cache, DB, or infer via Gemini and cache them."""
    skill_key = canonicalize_skill_name(skill_name)

    # 1. Check in-memory cache first (fastest)
    if cache is not None and skill_key in cache:
        return cache[skill_key]
    
    # 2. Check DB
    cur.execute("SELECT parent_name FROM skill_ontology WHERE skill_name = %s", (skill_key,))
    rows = cur.fetchall()
    if rows:
        parents = [str(r[0]) for r in rows]
        if cache is not None:
            cache[skill_key] = parents
        return parents
    
    # 3. Infer via Gemini (only for truly unknown skills)
    logger.info(f"[ONTOLOGY] Learning new skill: {skill_key}")
    parents = infer_skill_parents(skill_key)
    for p in parents:
        try:
            cur.execute(
                "INSERT INTO skill_ontology (skill_name, parent_name) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (skill_key, p),
            )
        except Exception as e:
            logger.error(f"Failed to cache ontology for {skill_key} -> {p}: {e}")
    
    if cache is not None:
        cache[skill_key] = parents
    return parents
