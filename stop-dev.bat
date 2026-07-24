@echo off
echo ============================================
echo  Municipal Decision Assistant — STOP
echo ============================================
echo.

REM -------------------------------------------
REM 1. Kill process on port 8080 (Spring Boot)
REM -------------------------------------------
echo [1/3] Stopping backend (port 8080)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Stopped PID %%a
)
echo Done.

REM -------------------------------------------
REM 2. Kill process on port 5173 (Vite frontend)
REM -------------------------------------------
echo [2/3] Stopping frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Stopped PID %%a
)
echo Done.

REM -------------------------------------------
REM 3. Stop Docker containers
REM -------------------------------------------
echo [3/3] Stopping Docker containers...
docker compose -f docker-compose.yml stop
echo Done.

echo ============================================
echo  All services stopped.
echo ============================================
pause
