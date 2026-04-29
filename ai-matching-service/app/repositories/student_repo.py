"""
Student-related database queries.
"""

from __future__ import annotations

from typing import Dict, List

from app.models.domain import ProjectEvidence, StudentSkill
from app.utils import canonicalize_skill_name


def fetch_multiple_students_skills(
    cur, student_user_ids: List[int]
) -> Dict[int, Dict[str, StudentSkill]]:
    """Fetch skills for multiple students in a single query."""
    if not student_user_ids:
        return {}
    cur.execute(
        """
        SELECT ss.student_user_id, s.name, COALESCE(ss.level, 3)
        FROM student_skills ss
        JOIN skills s ON s.id = ss.skill_id
        WHERE ss.student_user_id = ANY(%s)
        """,
        (student_user_ids,),
    )
    result: Dict[int, Dict[str, StudentSkill]] = {uid: {} for uid in student_user_ids}
    for row in cur.fetchall():
        uid, raw_name, level = int(row[0]), str(row[1]).strip(), int(row[2])
        key = canonicalize_skill_name(raw_name)
        result[uid][key] = StudentSkill(skill_name=raw_name, level=level)
    return result


def fetch_student_skills(cur, student_user_id: int) -> Dict[str, StudentSkill]:
    """Fetch skills for a single student."""
    return fetch_multiple_students_skills(cur, [student_user_id]).get(student_user_id, {})


def fetch_multiple_students_profile_text(
    cur, student_user_ids: List[int]
) -> Dict[int, str]:
    """Fetch concatenated profile text for multiple students."""
    if not student_user_ids:
        return {}
    cur.execute(
        """
        SELECT
            user_id,
            COALESCE(full_name, ''),
            COALESCE(bio, ''),
            COALESCE(major, ''),
            COALESCE(categories_of_interest, ''),
            COALESCE(github_url, ''),
            COALESCE(website_url, '')
        FROM student_profiles
        WHERE user_id = ANY(%s)
        """,
        (student_user_ids,),
    )
    result: Dict[int, str] = {uid: "" for uid in student_user_ids}
    for row in cur.fetchall():
        uid = int(row[0])
        result[uid] = " ".join(str(part or "") for part in row[1:])
    return result


def fetch_student_profile_text(cur, student_user_id: int) -> str:
    """Fetch concatenated profile text for a single student."""
    return fetch_multiple_students_profile_text(cur, [student_user_id]).get(
        student_user_id, ""
    )


def fetch_multiple_students_completed_projects(
    cur, student_user_ids: List[int]
) -> Dict[int, List[ProjectEvidence]]:
    """Fetch completed project evidence for multiple students."""
    if not student_user_ids:
        return {}
    cur.execute(
        """
        SELECT
            s.student_user_id,
            t.id,
            COALESCE(t.title, ''),
            COALESCE(t.description, ''),
            COALESCE(s.submission_content, '')
        FROM submissions s
        JOIN tasks t ON t.id = s.task_id
        WHERE s.student_user_id = ANY(%s)
          AND LOWER(COALESCE(s.status, '')) IN ('approved', 'completed', 'done')
        """,
        (student_user_ids,),
    )
    result: Dict[int, List[ProjectEvidence]] = {uid: [] for uid in student_user_ids}
    for row in cur.fetchall():
        uid = int(row[0])
        task_id = int(row[1])
        title = str(row[2] or "")
        text = " ".join(str(part or "") for part in row[2:])
        result[uid].append(ProjectEvidence(task_id=task_id, title=title, text=text))
    return result


def fetch_student_completed_projects(
    cur, student_user_id: int
) -> List[ProjectEvidence]:
    """Fetch completed project evidence for a single student."""
    return fetch_multiple_students_completed_projects(cur, [student_user_id]).get(
        student_user_id, []
    )
