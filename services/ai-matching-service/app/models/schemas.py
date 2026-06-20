from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field # type: ignore

@dataclass
class SkillRequirement:
    skill_name: str
    required_level: int
    is_required: bool

@dataclass
class StudentSkill:
    skill_name: str
    level: int

@dataclass
class ProjectEvidence:
    title: str
    description: str
    similarity: float = 0.0

@dataclass
class HardFilterResult:
    passed: bool
    score: float
    missing_skills: List[str]
    below_level_skills: List[str]

# API Request/Response Models
class MatchRequest(BaseModel):
    task_id: int
    alpha: Optional[float] = None
    top_k: Optional[int] = None
    min_score: Optional[float] = None

class CandidateScore(BaseModel):
    student_user_id: int
    score: float
    filtered: bool
    reasons: List[str]
    explanation: Optional[str] = None
    top_projects: List[Dict[str, Any]]

class TaskMatchResponse(BaseModel):
    task_id: int
    candidates: List[CandidateScore]
    filtered_out: int = 0
    alpha: float = 0.5

class StudentMatchRequest(BaseModel):
    student_user_id: int
    alpha: Optional[float] = None
    min_score: Optional[float] = None

class TaskScore(BaseModel):
    task_id: int
    score: float
    reasons: List[str]
    explanation: Optional[str] = None

class StudentMatchResponse(BaseModel):
    student_user_id: int
    tasks: List[TaskScore]

class SingleMatchRequest(BaseModel):
    task_id: int
    student_user_id: int
    alpha: Optional[float] = None

class SingleMatchResponse(BaseModel):
    task_id: int
    student_user_id: int
    score: float
    filtered: bool
    reasons: List[str]
    explanation: Optional[str] = None
    semantic_details: Dict[str, Any]
