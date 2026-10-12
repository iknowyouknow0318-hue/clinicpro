@echo off
title ClinicFlow AI Launcher
echo ========================================================
echo        ClinicFlow AI - Fullstack Healthcare Platform
echo ========================================================
echo.

echo [1/2] Starting Spring Boot Backend on http://localhost:8080 ...
start "ClinicFlow Backend" cmd /k "cd backend && mvn spring-boot:run"

echo [2/2] Starting Vite React Frontend on http://localhost:3000 ...
start "ClinicFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 4 seconds for services to initialize...
timeout /t 4 >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo   ClinicFlow AI is running!
echo   - Web App:      http://localhost:3000
echo   - Backend API:  http://localhost:8080/api
echo   - H2 Console:   http://localhost:8080/h2-console
echo ========================================================
