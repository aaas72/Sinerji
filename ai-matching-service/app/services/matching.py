from typing import List, Dict, Any
from app.models.schemas import SkillRequirement, StudentSkill, HardFilterResult, ProjectEvidence
from app.core.config import REQUIRED_LEVEL_GAP_TOLERANCE, MANDATORY_THRESHOLD, DEFAULT_ALPHA
from app.core.logger import logger
from app.services.ontology import get_skill_parents_cached, canonicalize_skill_name
from app.services.semantic import evaluate_semantic_stage
from app.database.queries import (
    fetch_task_requirements, fetch_student_skills, 
    fetch_student_profile_text, fetch_student_completed_projects
)

def clamp_100(val: float) -> float:
    return max(0.0, min(100.0, val))

def evaluate_hard_filter(cur, required: List[SkillRequirement], student_map: Dict[str, StudentSkill]) -> HardFilterResult:
    if not required:
        return HardFilterResult(passed=True, score=100.0, missing_skills=[], below_level_skills=[])

    weighted_sum = 0.0
    total_weight = 0.0
    missing_skills: List[str] = []
    below_level_skills: List[str] = []

    for req in required:
        req_key = canonicalize_skill_name(req.skill_name)
        student_skill = student_map.get(req_key)

        if student_skill is None:
            for s_key, s_val in student_map.items():
                parents = get_skill_parents_cached(cur, s_key)
                if req_key in [canonicalize_skill_name(p) for p in parents]:
                    student_skill = s_val
                    logger.info(f"[ONTOLOGY] Student's '{s_key}' dynamically satisfies requirement '{req_key}'")
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
        logger.debug(f"Student {met_count}/{len(mandatory_requirements)} mandatory skills. Rate: {success_rate:.2f}")

    score = 0.0 if total_weight == 0 else max(0.0, min(100.0, (weighted_sum / total_weight) * 100.0))
    return HardFilterResult(passed=passed, score=score, missing_skills=missing_skills, below_level_skills=below_level_skills)

def score_student_against_task(cur, task_id: int, student_user_id: int, alpha: float, task_text: str = None) -> Dict[str, Any]:
    required_skills = fetch_task_requirements(cur, task_id)
    student_skills_list = fetch_student_skills(cur, student_user_id)
    student_skills = {canonicalize_skill_name(s.skill_name): s for s in student_skills_list}

    hard_result = evaluate_hard_filter(cur, required_skills, student_skills)
    reasons: List[str] = []
    if hard_result.missing_skills:
        reasons.append(f"Missing required skills: {', '.join(hard_result.missing_skills)}")
    if hard_result.below_level_skills:
        reasons.append(f"Required skill levels not met: {', '.join(hard_result.below_level_skills)}")

    if not hard_result.passed:
        return {
            "score": float(hard_result.score),
            "filtered": True,
            "reasons": reasons or ["Failed hard filter."],
            "semantic_details": {},
            "top_projects": []
        }

    from app.database.queries import fetch_task_search_text # Avoid circular if needed
    if not task_text:
        task_text = fetch_task_search_text(cur, task_id)
    
    student_profile_text = fetch_student_profile_text(cur, student_user_id)
    projects = fetch_student_completed_projects(cur, student_user_id)

    semantic_stage = evaluate_semantic_stage(task_text, student_profile_text, projects)
    semantic_score = float(semantic_stage["semantic_score"])
    final_score = clamp_100((alpha * hard_result.score) + ((1.0 - alpha) * semantic_score))

    if not reasons:
        reasons.append("Passed hard filtering and semantic analysis.")

    return {
        "score": final_score,
        "filtered": False,
        "reasons": reasons,
        "semantic_details": semantic_stage,
        "top_projects": semantic_stage["top_projects"]
    }
