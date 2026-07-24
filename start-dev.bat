@echo off
setlocal enabledelayedexpansion
title Municipal Decision Assistant — DEV

echo ============================================
echo  Municipal Decision Assistant
echo  DEVELOPMENT MODE
echo ============================================
echo.

REM ── Verify requirements ──
echo [CHECK] Verifying requirements...

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Java not found. Install JDK 21+ and add to PATH.
    pause & exit /b 1
)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VER=%%v
echo   Java: %JAVA_VER%

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Maven not found. Install Maven 3.9+ and add to PATH.
    pause & exit /b 1
)
echo   Maven: OK

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Node.js not found. Install Node.js 22+.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo   Node: %%v

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Docker not found. Install Docker Desktop.
    pause & exit /b 1
)
echo   Docker: OK

echo.

REM ── Install frontend dependencies if absent ──
echo [DEPS] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo   Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo [FAIL] npm install failed.
        pause & exit /b 1
    )
) else (
    echo   Frontend dependencies: OK
)

REM ── Copy .env if absent ──
if not exist ".env" (
    echo   Creating .env from .env.example...
    copy .env.example .env >nul
)

echo.

REM ── Start Docker ──
echo [DOCKER] Starting infrastructure...
docker compose -f docker-compose.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Docker failed to start.
    pause & exit /b 1
)

echo   Waiting for services to become healthy...
docker compose -f docker-compose.yml ps --format json 2>nul | findstr "healthy" >nul
for /l %%i in (1,1,30) do (
    docker compose -f docker-compose.yml ps 2>nul | findstr "healthy" | find /c "healthy" >nul
    if !ERRORLEVEL! EQU 0 (
        for /f %%c in ('docker compose -f docker-compose.yml ps 2^>nul ^| find /c "healthy"') do set COUNT=%%c
        if !COUNT! GEQ 3 goto :docker_ready
    )
    timeout /t 2 >nul
)
:docker_ready
echo   Services:
docker compose -f docker-compose.yml ps 2>nul | findstr "mda-"
echo.

REM ── Install Maven modules ──
echo [MAVEN] Installing dependency modules...
call mvn install -DskipTests -q -pl platform-audit,platform-auth,platform-document,platform-search,platform-ai,platform-neo4j,platform-workspace,platform-observability 2>&1 | findstr /v "BUILD"
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Maven install failed. Check Maven output above.
    pause & exit /b 1
)
echo   Maven modules: OK
echo.

REM ── Start Spring Boot ──
echo [START] Starting Spring Boot on port 8080...
start "MDA - Spring Boot" cmd /k "cd /d %~dp0 && echo Spring Boot starting... && mvn -pl platform-api spring-boot:run -Dspring-boot.run.profiles=dev -Dskip.frontend.build=true"

REM ── Start Vite ──
echo [START] Starting Vite dev server on port 5173...
start "MDA - Frontend" cmd /k "cd /d %~dp0frontend && echo Vite starting... && npm run dev"

echo.
echo ============================================
echo  All services starting!
echo.
echo   Postgres : localhost:5433
echo   Qdrant   : localhost:6333
echo   Neo4j    : localhost:7687
echo   Backend  : http://localhost:8080
echo   Frontend : http://localhost:5173
echo   Ollama   : localhost:11434
echo ============================================
echo.
echo Wait 30 seconds for Spring Boot to start,
echo then open http://localhost:5173
echo.
pause
endlocal