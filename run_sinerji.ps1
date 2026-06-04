# Sinerji Project Startup Script
# This script starts the Backend Server, Frontend Client, and AI Matching Service in separate windows.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Sinerji Project Components   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Start Backend Server
Write-Host "[1/4] Starting Backend Server (Express)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal

# 2. Start Frontend Client
Write-Host "[2/4] Starting Frontend Client (Next.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -WindowStyle Normal

# 3. Start AI Matching Service
Write-Host "[3/4] Starting AI Matching Service (FastAPI)..." -ForegroundColor Green
# Using the python executable directly from the virtual environment to ensure uvicorn runs correctly
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-matching-service; .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload" -WindowStyle Normal

# 4. Start Student Verification Microservice
Write-Host "[4/4] Starting Student Verification Microservice..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/student-verification; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "All components are starting in separate terminal windows." -ForegroundColor Yellow
Write-Host "Please check each window for logs and status." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan