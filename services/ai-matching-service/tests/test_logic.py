from app.services.scoring import (
    evaluate_hard_filter,
    calculate_score,
)
from app.models.domain import (
    SkillRequirement,
    StudentSkill,
    ProjectEvidence,
)
from app.services.semantic import cosine_similarity_bow
from app.utils import tokenize, canonicalize_skill_name


def test_tokenize_and_cosine():
    text = "react nodejs python react"
    tokens = tokenize(text)
    assert tokens["react"] == 2
    assert tokens["nodejs"] == 1
    
    t2 = tokenize("react python")
    sim = cosine_similarity_bow(tokens, t2)
    assert sim > 0
    assert round(sim, 2) == 0.87


def test_canonicalize_skill_name():
    assert canonicalize_skill_name("ReactJS") == "react"
    assert canonicalize_skill_name("py") == "python"
    assert canonicalize_skill_name("Unknown") == "unknown"


def test_evaluate_hard_filter():
    reqs = [
        SkillRequirement(skill_name="python", required_level=5, is_required=True),
        SkillRequirement(skill_name="react", required_level=3, is_required=False)
    ]
    student = {
        "python": StudentSkill(skill_name="python", level=5),
        "react": StudentSkill(skill_name="react", level=1)
    }
    
    result = evaluate_hard_filter(reqs, student)
    assert result.passed is True
    assert len(result.missing_skills) == 0
    
    # Missing required skill
    student_lacking = {"react": StudentSkill(skill_name="react", level=5)}
    result2 = evaluate_hard_filter(reqs, student_lacking)
    assert result2.passed is False
    assert "python" in result2.missing_skills


def test_calculate_score_no_projects():
    # Should evaluate normally using only profile textual comparison
    reqs = []
    
    result = calculate_score(
        alpha=0.5,
        required_skills=reqs,
        student_skills={},
        task_text="build a backend in nodejs",
        student_profile_text="i am a nodejs developer",
        projects=[]
    )
    
    assert result["filtered"] is False
    assert result["semantic_score"] > 0
    assert result["score"] > 0

def test_calculate_score_missing_task():
    result = calculate_score(
        alpha=0.5,
        required_skills=[],
        student_skills={},
        task_text="",
        student_profile_text="bio",
        projects=[]
    )
    assert result["filtered"] is True
    assert "Task not found" in result["reasons"][0]
