"""
Pydantic models for API request / response payloads.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Request models ────────────────────────────────────────────────────────────

class MatchRequestBase(BaseModel):
    alpha: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(default=None, gt=0)
    min_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)


class ScoreStudentTaskRequest(MatchRequestBase):
    task_id: int = Field(gt=0)
    student_user_id: int = Field(gt=0)


class RankTaskCandidatesRequest(MatchRequestBase):
    task_id: int = Field(gt=0)
    company_user_id: int = Field(gt=0)


class RecommendTasksRequest(MatchRequestBase):
    student_user_id: int = Field(gt=0)


# ── Response models ───────────────────────────────────────────────────────────

class CandidateScore(BaseModel):
    student_user_id: int
    score: int
    hard_score: float
    semantic_score: float
    breakdown: Dict[str, float]
    reasons: List[str]
    top_projects: List[Dict[str, Any]]
    missing_skills: List[str]


class TaskScore(BaseModel):
    task_id: int
    score: int
    hard_score: float
    semantic_score: float
    breakdown: Dict[str, float]
    reasons: List[str]
    top_projects: List[Dict[str, Any]]
    missing_skills: List[str]
