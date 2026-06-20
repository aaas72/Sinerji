import pytest
from fastapi.testclient import TestClient
from app import app
import app.database as db_module
import app.repositories.task_repo as task_repo
import app.repositories.student_repo as student_repo
import app.routes.matching as matching_routes
import app.services.scoring as scoring_module

client = TestClient(app)

class MockCursor:
    def execute(self, *args, **kwargs):
        pass
    def fetchone(self):
        return None
    def fetchall(self):
        return []
    def __enter__(self):
        return self
    def __exit__(self, *args):
        pass

class MockConnection:
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def cursor(self):
        return MockCursor()

class MockPool:
    def connection(self):
        return MockConnection()

@pytest.fixture(autouse=True)
def mock_db_pool(mocker):
    mocker.patch.object(db_module, 'db_pool', MockPool())

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_score_student_task_not_found(mocker):
    mocker.patch.object(task_repo, 'fetch_task_required_skills', return_value=[])
    mocker.patch.object(task_repo, 'fetch_task_text', return_value="")

    response = client.post(
        "/api/v1/match/score-student-task",
        json={"task_id": 1, "student_user_id": 1, "alpha": 0.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filtered"] is True

def test_score_student_success(mocker):
    from app.models.domain import SkillRequirement, StudentSkill
    mocker.patch.object(task_repo, 'fetch_task_required_skills', return_value=[
        SkillRequirement(skill_name="python", required_level=1, is_required=True)
    ])
    mocker.patch.object(student_repo, 'fetch_student_skills', return_value={
        "python": StudentSkill(skill_name="python", level=5)
    })
    mocker.patch.object(task_repo, 'fetch_task_text', return_value="need python developer")
    mocker.patch.object(student_repo, 'fetch_student_profile_text', return_value="backend python dev")
    mocker.patch.object(student_repo, 'fetch_student_completed_projects', return_value=[])

    response = client.post(
        "/api/v1/match/score-student-task",
        json={"task_id": 1, "student_user_id": 1, "alpha": 0.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filtered"] is False
    assert data["score"] > 0
    assert data["hard_score"] == 100.0

def test_rank_task_candidates_unauthorized(mocker):
    mocker.patch.object(matching_routes, 'fetch_task_owner', return_value=999)
    response = client.post(
        "/api/v1/match/rank-task-candidates",
        json={"task_id": 1, "company_user_id": 1}
    )
    assert response.status_code == 403

def test_rank_task_candidates_success(mocker):
    mocker.patch.object(matching_routes, 'fetch_task_owner', return_value=1)
    mocker.patch.object(matching_routes, 'fetch_task_candidate_ids', return_value=[10, 20])

    mocker.patch.object(matching_routes, 'fetch_task_required_skills', return_value=[])
    mocker.patch.object(matching_routes, 'fetch_task_text', return_value="developer")

    mocker.patch.object(matching_routes, 'fetch_multiple_students_skills', return_value={})
    mocker.patch.object(matching_routes, 'fetch_multiple_students_profile_text', return_value={
        10: "developer", 20: "manager"
    })
    mocker.patch.object(matching_routes, 'fetch_multiple_students_completed_projects', return_value={})

    response = client.post(
        "/api/v1/match/rank-task-candidates",
        json={"task_id": 1, "company_user_id": 1}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["candidates"]) == 2

    