@echo off
setlocal enabledelayedexpansion
title Municipal Decision Assistant - PRODUCTION

echo ============================================
echo  Municipal Decision Assistant
echo  PRODUCTION MODE
echo ============================================
echo.

echo [CHECK] Verifying requirements...

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Java not found. Install JDK 21+.
    pause
    exit /b 1
)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VER=%%v
echo   Java: %JAVA_VER%

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Maven not found.
    pause
    exit /b 1
)
echo   Maven: OK

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Node.js not found.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo   Node: %%v

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Docker not found.
    pause
    exit /b 1
)
echo   Docker: OK

echo.
echo [DEPS] Checking dependencies...
if not exist "frontend\node_modules" (
    echo   Installing frontend dependencies...
    pushd frontend
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        popd
        echo [FAIL] Frontend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)
echo   Dependencies: OK

if not exist ".env" copy .env.example .env >nul
echo   .env: OK

echo.
echo [BUILD] Building frontend...
pushd frontend
call npm run build
if !ERRORLEVEL! NEQ 0 (
    popd
    echo [FAIL] Frontend build failed.
    pause
    exit /b 1
)
popd
echo   Frontend: Built

echo.
echo [BUILD] Packaging Spring Boot application...
call mvn -pl platform-api -am package -Dskip.frontend.build=true -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Spring Boot packaging failed.
    pause
    exit /b 1
)
echo   Backend: Packaged

echo.
echo [DOCKER] Starting infrastructure (fresh containers)...
docker compose -f docker-compose-prod.yml down -v 2>nul
docker compose -f docker-compose-prod.yml up -d --force-recreate postgres qdrant neo4j
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Docker infrastructure failed to start.
    pause
    exit /b 1
)
echo   Waiting for services to be healthy...
for /l %%i in (1,1,30) do (
    for /f %%c in ('docker compose -f docker-compose-prod.yml ps 2^>nul ^| find /c "healthy"') do set COUNT=%%c
    if !COUNT! GEQ 3 goto :docker_ready
    timeout /t 2 >nul
)

:docker_ready
docker compose -f docker-compose-prod.yml ps 2>nul | findstr "mda-"
echo   All services healthy

set APP_JAR=platform-api\target\platform-api-1.0.0-RC1.jar
if not exist "%APP_JAR%" (
    echo [FAIL] Packaged application jar not found: %APP_JAR%
    pause
    exit /b 1
)

echo.
echo [CONFIG] Reading credentials from .env...
REM Read credentials from .env so they match what Docker Compose used.
REM Comment lines (#) are naturally skipped because the key includes the # prefix
REM and won't match any if-condition.
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="DB_URL" set DB_URL=%%b
    if "%%a"=="DB_USERNAME" set DB_USERNAME=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="AUTH_JWT_SECRET" set AUTH_JWT_SECRET=%%b
    if "%%a"=="QDRANT_ENABLED" set QDRANT_ENABLED=%%b
    if "%%a"=="QDRANT_HOST" set QDRANT_HOST=%%b
    if "%%a"=="QDRANT_REST_PORT" set QDRANT_REST_PORT=%%b
    if "%%a"=="NEO4J_URI" set NEO4J_URI=%%b
    if "%%a"=="NEO4J_USERNAME" set NEO4J_USERNAME=%%b
    if "%%a"=="NEO4J_PASSWORD" set NEO4J_PASSWORD=%%b
)

echo   DB_URL       = %DB_URL%
echo   DB_USERNAME  = %DB_USERNAME%
echo   DB_PASSWORD  = [hidden]
echo   JWT_SECRET   = [hidden]
echo   NEO4J_PASS   = [hidden]
echo   QDRANT_HOST  = %QDRANT_HOST%:%QDRANT_REST_PORT%

echo.
echo [START] Starting Spring Boot on http://localhost:8080...
echo ============================================
echo  Production server starting...
echo  Open http://localhost:8080 in your browser
echo  React is served by Spring Boot from the jar
echo ============================================
echo.

REM Pass credentials as explicit -D system properties so Spring Boot
REM resolves ${DB_PASSWORD} etc. reliably, regardless of env var propagation.
java ^
  -Dspring.profiles.active=prod ^
  -Dserver.ssl.enabled=false ^
  -Dspring.jpa.hibernate.ddl-auto=update ^
  -DDB_URL=%DB_URL% ^
  -DDB_USERNAME=%DB_USERNAME% ^
  -DDB_PASSWORD=%DB_PASSWORD% ^
  -DAUTH_JWT_SECRET=%AUTH_JWT_SECRET% ^
  -DQDRANT_ENABLED=%QDRANT_ENABLED% ^
  -DQDRANT_HOST=%QDRANT_HOST% ^
  -DQDRANT_REST_PORT=%QDRANT_REST_PORT% ^
  -DNEO4J_URI=%NEO4J_URI% ^
  -DNEO4J_USERNAME=%NEO4J_USERNAME% ^
  -DNEO4J_PASSWORD=%NEO4J_PASSWORD% ^
  -jar "%APP_JAR%"
pause
endlocal
