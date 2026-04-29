"""
Matching API endpoints.

- POST /api/v1/match/score-student-task
- POST /api/v1/match/rank-task-candidates
- POST /api/v1/match/recommend-tasks
"""

from __future__ import annotations

from typing import Dict, List

from fastapi import APIRouter, HTTPException

from app.database import db_cursor
from app.models.schemas import (
    CandidateScore,
    RankTaskCandidatesRequest,
    RecommendTasksRequest,
    ScoreStudentTaskRequest,
    TaskScore,
)
from app.repositories.student_repo import (
    fetch_multiple_students_completed_projects,
    fetch_multiple_students_profile_text,
    fetch_multiple_students_skills,
    fetch_student_completed_projects,
    fetch_student_profile_text,
    fetch_student_skills,
)
from app.repositories.task_repo import (
    fetch_multiple_tasks_required_skills,
    fetch_multiple_tasks_text,
    fetch_open_task_ids,
    fetch_task_candidate_ids,
    fetch_task_owner,
    fetch_task_required_skills,
    fetch_task_text,
)
from app.services.scoring import calculate_score, score_student_against_task
from app.utils import parse_runtime_params

router = APIRouter(prefix="/api/v1/match")


@router.post("/score-student-task")
def score_student_task(payload: ScoreStudentTaskRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])

    with db_cursor() as cur:
        result = score_student_against_task(cur, payload.task_id, payload.student_user_id, alpha)

    return {
        "task_id": payload.task_id,
        "student_user_id": payload.student_user_id,
        **result,
    }


@router.post("/rank-task-candidates")
def rank_task_candidates(payload: RankTaskCandidatesRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])
    top_k = int(params["top_k"])
    min_score = float(params["min_score"])

    with db_cursor() as cur:
        owner = fetch_task_owner(cur, payload.task_id)
        if owner is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if owner != payload.company_user_id:
            raise HTTPException(status_code=403, detail="Company is not authorized for this task")

        candidate_ids = fetch_task_candidate_ids(cur, payload.task_id)
        if not candidate_ids:
            return {
                "task_id": payload.task_id,
                "alpha": alpha,
                "top_k": top_k,
                "min_score": min_score,
                "filtered_out": 0,
                "candidates": [],
            }

        task_required_skills = fetch_task_required_skills(cur, payload.task_id)
        task_text = fetch_task_text(cur, payload.task_id)

        students_skills = fetch_multiple_students_skills(cur, candidate_ids)
        students_profiles = fetch_multiple_students_profile_text(cur, candidate_ids)
        students_projects = fetch_multiple_students_completed_projects(cur, candidate_ids)

        ranked: List[CandidateScore] = []

        for student_user_id in candidate_ids:
            s_skills = students_skills.get(student_user_id, {})
            s_profile = students_profiles.get(student_user_id, "")
            s_projects = students_projects.get(student_user_id, [])

            result = calculate_score(
                alpha, task_required_skills, s_skills, task_text, s_profile, s_projects
            )
            if result["score"] < min_score:
                continue

            ranked.append(
                CandidateScore(
                    student_user_id=student_user_id,
                    score=int(result["score"]),
                    hard_score=float(result["hard_score"]),
                    semantic_score=float(result["semantic_score"]),
                    breakdown=dict(result["breakdown"]),
                    reasons=list(result["reasons"]),
                    top_projects=list(result["top_projects"]),
                    missing_skills=list(result["missing_skills"]),
                )
            )

        ranked.sort(key=lambda item: item.score, reverse=True)
        ranked = ranked[:top_k]

    return {
        "task_id": payload.task_id,
        "alpha": alpha,
        "top_k": top_k,
        "min_score": min_score,
        "candidates": [item.model_dump() for item in ranked],
    }


@router.post("/recommend-tasks")
def recommend_tasks(payload: RecommendTasksRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])
    top_k = int(params["top_k"])
    min_score = float(params["min_score"])

    with db_cursor() as cur:
        task_ids = fetch_open_task_ids(cur)
        if not task_ids:
            return {
                "student_user_id": payload.student_user_id,
                "alpha": alpha,
                "top_k": top_k,
                "min_score": min_score,
                "tasks": [],
            }

        student_skills = fetch_student_skills(cur, payload.student_user_id)
        student_profile_text = fetch_student_profile_text(cur, payload.student_user_id)
        projects = fetch_student_completed_projects(cur, payload.student_user_id)

        tasks_required_skills = fetch_multiple_tasks_required_skills(cur, task_ids)
        tasks_texts = fetch_multiple_tasks_text(cur, task_ids)

        ranked: List[TaskScore] = []

        for task_id in task_ids:
            t_skills = tasks_required_skills.get(task_id, [])
            t_text = tasks_texts.get(task_id, "")

            result = calculate_score(
                alpha, t_skills, student_skills, t_text, student_profile_text, projects
            )
            if result["score"] < min_score:
                continue

            ranked.append(
                TaskScore(
                    task_id=task_id,
                    score=int(result["score"]),
                    hard_score=float(result["hard_score"]),
                    semantic_score=float(result["semantic_score"]),
                    breakdown=dict(result["breakdown"]),
                    reasons=list(result["reasons"]),
                    top_projects=list(result["top_projects"]),
                    missing_skills=list(result["missing_skills"]),
                )
            )

        ranked.sort(key=lambda item: item.score, reverse=True)
        ranked = ranked[:top_k]

    return {
        "student_user_id": payload.student_user_id,
        "alpha": alpha,
        "top_k": top_k,
        "min_score": min_score,
        "tasks": [item.model_dump() for item in ranked],
    }
