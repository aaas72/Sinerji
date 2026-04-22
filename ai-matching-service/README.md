# AI Matching Microservice (Python)

This service implements objective AI matching for Sinerji as a standalone Python microservice.

## What it does

- Runs a two-stage pipeline:
	- Stage 1: Hard Filtering for required skill presence/level.
	- Stage 2: Semantic NLP on portfolio/completed projects.
- Reads task and student data directly from PostgreSQL.
- Produces objective suitability scores in range 0-100.
- Ranks candidates for a task and recommends tasks for a student.
- Returns explainability fields (reasons, top matching projects, missing skills).

## Endpoints

- `GET /health`
- `POST /api/v1/match/score-student-task`
- `POST /api/v1/match/rank-task-candidates`
- `POST /api/v1/match/recommend-tasks`

### Request options

All POST endpoints accept optional runtime controls:

- `alpha` (0..1): fusion weight for hard score.
- `top_k` (>0): maximum result count.
- `min_score` (0..100): minimum accepted score.

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `PORT`
- `MATCHING_DEFAULT_ALPHA`
- `MATCHING_DEFAULT_TOP_K`
- `MATCHING_DEFAULT_MIN_SCORE`
- `MATCHING_REQUIRED_SKILL_GAP_TOLERANCE`
- `MATCHING_ENABLE_SEMANTIC`
- `MATCHING_SEMANTIC_MODEL`

## Run locally

```bash
cd ai-matching-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```
