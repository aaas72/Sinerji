from unittest.mock import MagicMock

import pytest

import app.services.matching as matching
from app.models.schemas import ProjectEvidence, SkillRequirement, StudentSkill
from app.services.explanation import generate_local_explanation
from app.services.ontology import canonicalize_skill_name, get_skill_parents
from app.services.semantic import cosine_similarity_bow, evaluate_semantic_stage, tokenize


def student_map(*skills: tuple[str, int]) -> dict[str, StudentSkill]:
    return {canonicalize_skill_name(name): StudentSkill(name, level) for name, level in skills}


# ── Skill names and ontology ─────────────────────────────────────────────────

@pytest.mark.parametrize("raw, expected", [
    ("ReactJS", "react"),
    ("  Node ", "node.js"),
    ("py", "python"),
    ("Rust", "rust"),
])
def test_canonicalize_skill_name(raw, expected):
    assert canonicalize_skill_name(raw) == expected


def test_skill_parents_come_from_local_taxonomy_without_db():
    cur = MagicMock()
    cache: dict = {}
    parents = get_skill_parents(cur, "Next.js", cache=cache)
    assert "react" in parents
    assert cache["next.js"] == parents
    cur.execute.assert_not_called()


# ── Hard filter ──────────────────────────────────────────────────────────────

def test_hard_filter_passes_when_no_requirements():
    result = matching.evaluate_hard_filter(MagicMock(), [], {})
    assert result.passed and result.score == 100.0


def test_hard_filter_full_score_when_all_levels_met():
    required = [SkillRequirement("React", 5, True), SkillRequirement("TypeScript", 4, False)]
    result = matching.evaluate_hard_filter(MagicMock(), required, student_map(("react", 7), ("ts", 4)))
    assert result.passed
    assert result.score == pytest.approx(100.0)
    assert result.missing_skills == [] and result.below_level_skills == []


def test_hard_filter_fails_when_mandatory_skill_missing():
    required = [SkillRequirement("Python", 5, True)]
    result = matching.evaluate_hard_filter(MagicMock(), required, student_map(("react", 9)), ontology_cache={})
    assert not result.passed
    assert result.missing_skills == ["Python"]
    assert result.score == 0.0


def test_hard_filter_flags_mandatory_skill_below_level():
    required = [SkillRequirement("React", 8, True)]
    result = matching.evaluate_hard_filter(MagicMock(), required, student_map(("react", 4)))
    assert not result.passed
    assert result.below_level_skills == ["React (required=8, student=4)"]
    assert result.score == pytest.approx(50.0)


def test_hard_filter_optional_skills_never_block():
    required = [SkillRequirement("React", 5, True), SkillRequirement("GraphQL", 5, False)]
    result = matching.evaluate_hard_filter(MagicMock(), required, student_map(("react", 5)), ontology_cache={})
    assert result.passed
    assert result.missing_skills == []
    assert result.score < 100.0


def test_hard_filter_uses_ontology_to_satisfy_parent_skill():
    # A Next.js developer satisfies a "React" requirement through the taxonomy.
    required = [SkillRequirement("React", 5, True)]
    result = matching.evaluate_hard_filter(MagicMock(), required, student_map(("next.js", 6)), ontology_cache={})
    assert result.passed
    assert result.missing_skills == []


# ── Bonus and weighting ──────────────────────────────────────────────────────

def test_surplus_bonus_rewards_exceeding_levels_and_is_capped():
    required = [SkillRequirement("React", 5, True)]
    assert matching.calculate_surplus_bonus(required, student_map(("react", 7))) == pytest.approx(3.0)
    assert matching.calculate_surplus_bonus(required, student_map(("react", 5))) == 0.0

    many = [SkillRequirement(f"s{i}", 1, True) for i in range(5)]
    assert matching.calculate_surplus_bonus(many, student_map(*[(f"s{i}", 10) for i in range(5)])) == 10.0


def test_dynamic_alpha_shifts_weight_to_semantics_with_richer_data():
    poor = matching.calculate_dynamic_alpha("", "", [])
    rich = matching.calculate_dynamic_alpha("x" * 60, "y" * 40, [ProjectEvidence("p", "d")])
    assert poor == pytest.approx(0.90)
    assert rich == pytest.approx(0.60)


# ── Semantic stage (bag-of-words fallback) ───────────────────────────────────

def test_cosine_similarity_bounds():
    assert cosine_similarity_bow(tokenize("react python"), tokenize("react python")) == pytest.approx(1.0)
    assert cosine_similarity_bow(tokenize("react"), tokenize("django")) == 0.0
    assert cosine_similarity_bow([], tokenize("react")) == 0.0


def test_semantic_stage_uses_projects_when_available():
    projects = [ProjectEvidence("Shop", "react ecommerce frontend"), ProjectEvidence("Bot", "telegram bot")]
    stage = evaluate_semantic_stage("react frontend developer", "react developer", projects)
    assert stage["has_projects"]
    assert stage["top_projects"][0]["title"] == "Shop"
    assert 0.0 <= stage["semantic_score"] <= 100.0


# ── End-to-end scoring with mocked database queries ──────────────────────────

@pytest.fixture
def mock_queries(monkeypatch):
    def apply(required, skills, profile="", submission="", projects=()):
        monkeypatch.setattr(matching, "fetch_task_requirements", lambda cur, task_id: required)
        monkeypatch.setattr(matching, "fetch_student_skills", lambda cur, uid: skills)
        monkeypatch.setattr(matching, "fetch_task_search_text", lambda cur, task_id: "react frontend dashboard")
        monkeypatch.setattr(matching, "fetch_student_profile_text", lambda cur, uid: profile)
        monkeypatch.setattr(matching, "fetch_submission_content", lambda cur, task_id, uid: submission)
        monkeypatch.setattr(matching, "fetch_student_completed_projects", lambda cur, uid: list(projects))
    return apply


def test_score_filters_out_student_missing_required_skill(mock_queries):
    mock_queries([SkillRequirement("Python", 5, True)], [StudentSkill("React", 8)])
    result = matching.score_student_against_task(MagicMock(), 1, 2, alpha=0.7, ontology_cache={})
    assert result["filtered"] is True
    assert result["semantic_score"] == 0.0
    assert "Missing required skills: Python" in result["reasons"]


def test_score_combines_hard_semantic_and_bonus(mock_queries):
    mock_queries(
        [SkillRequirement("React", 5, True)],
        [StudentSkill("React", 7)],
        profile="react frontend developer building dashboards",
        projects=[ProjectEvidence("Admin panel", "react dashboard frontend")],
    )
    result = matching.score_student_against_task(MagicMock(), 1, 2, alpha=0.7, ontology_cache={})
    assert result["filtered"] is False
    assert result["hard_score"] == pytest.approx(100.0)
    assert result["surplus_bonus"] == pytest.approx(3.0)
    assert 0.0 < result["score"] <= 100.0
    assert result["top_projects"][0]["title"] == "Admin panel"


# ── Explanation text ─────────────────────────────────────────────────────────

def test_explanation_tiers():
    excellent = generate_local_explanation(0.9, ["React"], [], "High", 95, 80)
    weak = generate_local_explanation(0.3, [], ["Python"], "Low", 30, 10)
    assert "mükemmel" in excellent
    assert "Python" in weak
    assert "%90.0" in excellent
