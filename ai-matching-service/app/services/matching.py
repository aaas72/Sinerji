from typing import List, Dict, Any
from app.models.schemas import SkillRequirement, StudentSkill, HardFilterResult, ProjectEvidence
from app.core.config import REQUIRED_LEVEL_GAP_TOLERANCE, MANDATORY_THRESHOLD, DEFAULT_ALPHA
from app.core.logger import logger
from app.services.ontology import get_skill_parents, canonicalize_skill_name, load_ontology_cache
from app.services.semantic import evaluate_semantic_stage
from app.services.explanation import generate_local_explanation
from app.database.queries import (
    fetch_task_requirements, fetch_student_skills,
    fetch_student_profile_text, fetch_student_completed_projects,
    fetch_task_search_text, fetch_submission_content,
)


def clamp_100(val: float) -> float:
    return max(0.0, min(100.0, val))


def calculate_dynamic_alpha(
    profile_text: str,
    submission_content: str,
    projects: List[ProjectEvidence],
) -> float:
    """Adjust alpha based on semantic data richness.
    - Poor data  → alpha ≈ 0.90 (rely on hard skills)
    - Rich data  → alpha ≈ 0.60 (semantic gets more weight)
    """
    richness = 0.0
    if len((profile_text or "").strip()) > 50:
        richness += 0.3
    if len((submission_content or "").strip()) > 30:
        richness += 0.4
    if len(projects) > 0:
        richness += 0.3

    max_alpha, min_alpha = 0.90, 0.60
    return max_alpha - (richness * (max_alpha - min_alpha))


def calculate_surplus_bonus(
    required: List[SkillRequirement],
    student_map: Dict[str, StudentSkill],
) -> float:
    """Award extra points when a student EXCEEDS required skill levels."""
    bonus = 0.0
    for req in required:
        key = canonicalize_skill_name(req.skill_name)
        s = student_map.get(key)
        if s and s.level > req.required_level:
            surplus = s.level - req.required_level
            bonus += surplus * 1.5          # 1.5 pts per surplus level
    return min(bonus, 10.0)                 # cap at 10 extra points


def evaluate_hard_filter(
    cur,
    required: List[SkillRequirement],
    student_map: Dict[str, StudentSkill],
    ontology_cache: Dict[str, List[str]] | None = None,
) -> HardFilterResult:
    if not required:
        return HardFilterResult(passed=True, score=100.0, missing_skills=[], below_level_skills=[])

    weighted_sum = 0.0
    total_weight = 0.0
    missing_skills: List[str] = []
    below_level_skills: List[str] = []

    for req in required:
        req_key = canonicalize_skill_name(req.skill_name)
        student_skill = student_map.get(req_key)

        # Ontology fallback — uses in-memory cache instead of per-skill DB query
        if student_skill is None:
            for s_key, s_val in student_map.items():
                parents = get_skill_parents(cur, s_key, cache=ontology_cache)
                if req_key in [canonicalize_skill_name(p) for p in parents]:
                    student_skill = s_val
                    logger.info(f"[ONTOLOGY] '{s_key}' satisfies '{req_key}'")
                    break

        weight = float(req.required_level) * (1.25 if req.is_required else 0.75)
        total_weight += weight

        if student_skill is None:
            if req.is_required:
                missing_skills.append(req.skill_name)
            continue

        if req.is_required and student_skill.level + REQUIRED_LEVEL_GAP_TOLERANCE < req.required_level:
            below_level_skills.append(
                f"{req.skill_name} (required={req.required_level}, student={student_skill.level})"
            )

        level_ratio = min(float(student_skill.level) / max(float(req.required_level), 1.0), 1.0)
        weighted_sum += level_ratio * weight

    mandatory_requirements = [r for r in required if r.is_required]
    passed = True
    if mandatory_requirements:
        failed_count = len(missing_skills) + len(below_level_skills)
        met_count = len(mandatory_requirements) - failed_count
        success_rate = met_count / len(mandatory_requirements)
        passed = success_rate >= MANDATORY_THRESHOLD

    score = 0.0 if total_weight == 0 else max(0.0, min(100.0, (weighted_sum / total_weight) * 100.0))
    return HardFilterResult(passed=passed, score=score, missing_skills=missing_skills, below_level_skills=below_level_skills)


def score_student_against_task(
    cur,
    task_id: int,
    student_user_id: int,
    alpha: float,
    task_text: str = None,
    ontology_cache: Dict[str, List[str]] | None = None,
) -> Dict[str, Any]:
    required_skills = fetch_task_requirements(cur, task_id)
    student_skills_list = fetch_student_skills(cur, student_user_id)
    student_skills = {canonicalize_skill_name(s.skill_name): s for s in student_skills_list}

    hard_result = evaluate_hard_filter(cur, required_skills, student_skills, ontology_cache)

    # Identify matched / missing skills
    matched_skill_names = [
        req.skill_name for req in required_skills
        if canonicalize_skill_name(req.skill_name) in student_skills
    ]
    reasons: List[str] = []
    if hard_result.missing_skills:
        reasons.append(f"Missing required skills: {', '.join(hard_result.missing_skills)}")
    if hard_result.below_level_skills:
        reasons.append(f"Required skill levels not met: {', '.join(hard_result.below_level_skills)}")

    # Surplus bonus for students who exceed requirements
    surplus_bonus = calculate_surplus_bonus(required_skills, student_skills)

    if not hard_result.passed:
        explanation = generate_local_explanation(
            hard_result.score / 100.0, matched_skill_names,
            hard_result.missing_skills, "Low",
            hard_result.score, 0.0,
        )
        return {
            "score": float(hard_result.score),
            "hard_score": float(hard_result.score),
            "semantic_score": 0.0,
            "surplus_bonus": 0.0,
            "filtered": True,
            "reasons": reasons or ["Failed hard filter."],
            "explanation": explanation,
            "semantic_details": {},
            "top_projects": [],
        }

    # ── Semantic stage ──────────────────────────────────────────────
    if not task_text:
        task_text = fetch_task_search_text(cur, task_id)

    profile_text = fetch_student_profile_text(cur, student_user_id)
    submission_text = fetch_submission_content(cur, task_id, student_user_id)
    projects = fetch_student_completed_projects(cur, student_user_id)

    semantic_stage = evaluate_semantic_stage(task_text, profile_text, projects, submission_text)
    semantic_score = float(semantic_stage["semantic_score"])

    # ── Dynamic alpha ───────────────────────────────────────────────
    dynamic_alpha = calculate_dynamic_alpha(profile_text, submission_text, projects)

    final_score = clamp_100(
        dynamic_alpha * hard_result.score
        + (1.0 - dynamic_alpha) * semantic_score
        + surplus_bonus
    )

    if not reasons:
        reasons.append("Passed hard filtering and semantic analysis.")

    semantic_level = "High" if semantic_score >= 80 else "Medium" if semantic_score >= 50 else "Low"
    explanation = generate_local_explanation(
        final_score / 100.0, matched_skill_names,
        hard_result.missing_skills, semantic_level,
        hard_result.score, semantic_score,
    )

    return {
        "score": final_score,
        "hard_score": float(hard_result.score),
        "semantic_score": semantic_score,
        "surplus_bonus": surplus_bonus,
        "filtered": False,
        "reasons": reasons,
        "explanation": explanation,
        "semantic_details": semantic_stage,
        "top_projects": semantic_stage["top_projects"],
    }
