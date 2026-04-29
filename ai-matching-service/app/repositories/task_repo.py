"""
Task-related database queries.
"""

from __future__ import annotations

from typing import Dict, List

from app.models.domain import SkillRequirement


def fetch_task_owner(cur, task_id: int) -> int | None:
    """Return the company_user_id that owns *task_id*, or None."""
    cur.execute("SELECT company_user_id FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    return int(row[0]) if row else None


def fetch_multiple_tasks_required_skills(
    cur, task_ids: List[int]
) -> Dict[int, List[SkillRequirement]]:
    """Fetch skill requirements for multiple tasks in a single query."""
    if not task_ids:
        return {}
    cur.execute(
        """
        SELECT ts.task_id, s.name, COALESCE(ts.level, 3), COALESCE(ts.is_required, true)
        FROM task_skills ts
        JOIN skills s ON s.id = ts.skill_id
        WHERE ts.task_id = ANY(%s)
        """,
        (task_ids,),
    )
    result: Dict[int, List[SkillRequirement]] = {tid: [] for tid in task_ids}
    for row in cur.fetchall():
        tid, skill_name, required_level, is_required = (
            int(row[0]),
            str(row[1]),
            int(row[2]),
            bool(row[3]),
        )
        result[tid].append(
            SkillRequirement(
                skill_name=skill_name,
                required_level=required_level,
                is_required=is_required,
            )
        )
    return result


def fetch_task_required_skills(cur, task_id: int) -> List[SkillRequirement]:
    """Fetch skill requirements for a single task."""
    return fetch_multiple_tasks_required_skills(cur, [task_id]).get(task_id, [])


def fetch_multiple_tasks_text(cur, task_ids: List[int]) -> Dict[int, str]:
    """Fetch concatenated text fields for multiple tasks."""
    if not task_ids:
        return {}
    cur.execute(
        """
        SELECT id, COALESCE(title, ''), COALESCE(description, ''),
               COALESCE(detail_title, ''), COALESCE(detail_body, '')
        FROM tasks
        WHERE id = ANY(%s)
        """,
        (task_ids,),
    )
    result: Dict[int, str] = {tid: "" for tid in task_ids}
    for row in cur.fetchall():
        tid = int(row[0])
        result[tid] = " ".join(str(part or "") for part in row[1:])
    return result


def fetch_task_text(cur, task_id: int) -> str:
    """Fetch concatenated text fields for a single task."""
    return fetch_multiple_tasks_text(cur, [task_id]).get(task_id, "")


def fetch_open_task_ids(cur) -> List[int]:
    """Return IDs of all tasks with status 'open'."""
    cur.execute("SELECT id FROM tasks WHERE LOWER(COALESCE(status, '')) = 'open'")
    return [int(r[0]) for r in cur.fetchall()]


def fetch_task_candidate_ids(cur, task_id: int) -> List[int]:
    """Return student IDs who have submitted to *task_id*."""
    cur.execute(
        "SELECT DISTINCT student_user_id FROM submissions WHERE task_id = %s",
        (task_id,),
    )
    return [int(r[0]) for r in cur.fetchall()]