from fastapi import APIRouter, HTTPException # type: ignore
from typing import List
from app.models.schemas import (
    MatchRequest, TaskMatchResponse, CandidateScore,
    StudentMatchRequest, StudentMatchResponse, TaskScore,
    SingleMatchRequest, SingleMatchResponse
)
from app.database.connection import db_cursor
from app.database.queries import (
    fetch_task_owner_id, fetch_task_candidate_ids, 
    fetch_task_search_text, fetch_student_applied_task_ids
)
from app.services.matching import score_student_against_task
from app.services.ontology import ensure_ontology_table
from app.core.config import DEFAULT_ALPHA, DEFAULT_TOP_K, DEFAULT_MIN_SCORE

router = APIRouter(prefix="/api/v1")

@router.post("/match/rank-task-candidates", response_model=TaskMatchResponse)
async def match_task_candidates(payload: MatchRequest):
    # This endpoint was called /match/task
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    top_k = DEFAULT_TOP_K if payload.top_k is None else int(payload.top_k)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        candidate_ids = fetch_task_candidate_ids(cur, payload.task_id)
        task_text = fetch_task_search_text(cur, payload.task_id)
        
        ranked: List[CandidateScore] = []
        filtered_out = 0
        
        for student_user_id in candidate_ids:
            result = score_student_against_task(cur, payload.task_id, student_user_id, alpha, task_text)
            if result["filtered"]:
                filtered_out += 1
                continue
            
            ranked.append(CandidateScore(
                student_user_id=student_user_id,
                score=result["score"],
                filtered=False,
                reasons=result["reasons"],
                top_projects=result["top_projects"]
            ))
            
    ranked.sort(key=lambda x: x.score, reverse=True)
    return TaskMatchResponse(
        task_id=payload.task_id,
        top_candidates=ranked[:top_k],
        filtered_out=filtered_out
    )

@router.post("/match/recommend-tasks", response_model=StudentMatchResponse)
async def match_student_tasks(payload: StudentMatchRequest):
    # This endpoint was called /match/student
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    min_score = DEFAULT_MIN_SCORE if payload.min_score is None else float(payload.min_score)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        task_ids = fetch_student_applied_task_ids(cur, payload.student_user_id)
        ranked: List[TaskScore] = []
        
        for task_id in task_ids:
            result = score_student_against_task(cur, task_id, payload.student_user_id, alpha)
            if result["filtered"] or result["score"] < min_score:
                continue
                
            ranked.append(TaskScore(
                task_id=task_id,
                score=result["score"],
                reasons=result["reasons"]
            ))
            
    ranked.sort(key=lambda x: x.score, reverse=True)
    return StudentMatchResponse(
        student_user_id=payload.student_user_id,
        tasks=ranked
    )

@router.post("/match/score-student-task", response_model=SingleMatchResponse)
async def match_single_pair(payload: SingleMatchRequest):
    # This endpoint was called /match/single
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        result = score_student_against_task(cur, payload.task_id, payload.student_user_id, alpha)
        
    return SingleMatchResponse(
        task_id=payload.task_id,
        student_user_id=payload.student_user_id,
        score=result["score"],
        filtered=result["filtered"],
        reasons=result["reasons"],
        semantic_details=result["semantic_details"]
    )
