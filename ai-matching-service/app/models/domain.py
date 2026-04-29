"""
Domain dataclasses used throughout the matching pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class SkillRequirement:
    """A skill required (or preferred) by a task."""
    skill_name: str
    required_level: int
    is_required: bool


@dataclass
class StudentSkill:
    """A skill possessed by a student."""
    skill_name: str
    level: int


@dataclass
class ProjectEvidence:
    """A completed project used as portfolio evidence."""
    task_id: int
    title: str
    text: str


@dataclass
class HardFilterResult:
    """Outcome of the hard-filter evaluation stage."""
    passed: bool
    score: float
    missing_skills: List[str]
    below_level_skills: List[str]
