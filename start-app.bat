@echo off
title Project Launcher
color 0B
cls

echo.
echo =========================================
echo          STARTING SERVICES...
echo =========================================
echo.
    
REM 1. START BACKEND (Express/Node)
echo [BACKEND] Starting API server...
start "Backend API" cmd /k "title Backend API | color 0E && cd backend && nodemon server.js"
    
REM 2. START FRONTEND (Vite/React)
echo [FRONTEND] Starting development server...
start "Frontend UI" cmd /k "title Frontend UI | color 0A && cd frontend && npm run dev"

REM 3. OPEN BROWSER
echo.
echo Waiting 4 seconds before opening browser...
timeout /t 4 /nobreak >nul
    
echo Opening browser to: http://localhost:5173
start http://localhost:5173
    
echo.
echo All components are running. Close all windows to stop.
pause >nul