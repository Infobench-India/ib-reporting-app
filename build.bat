@echo off
setlocal enabledelayedexpansion

REM Save the root directory
set "ROOT_DIR=%CD%"


REM === Main Logic ===
echo Building all applications...

if "%~1"=="" (
    REM No argument: build all
    call :build_app ib-container-ui
    call :build_app ib-analytics-ui
    call :build_app ib-auth-service
    call :build_app ib-sql-report-server
) else (
    REM Build specified application
    call :build_app %~1
)

echo.
echo ===================================================
echo ✅ Full Build and Installer Generation Completed!
echo Installers are in: %ROOT_DIR%\deploy\installers
echo ===================================================
echo.
pause
exit /b

REM Function to build individual app
:build_app
set "APP=%~1"
echo.
echo ---------------------------------------------------
echo 🚀 Building and Packaging: %APP%
echo ---------------------------------------------------

if "%APP%"=="ib-container-ui" (
    cd /d "%ROOT_DIR%\frontends\ib-container-app"
    call npm run build
) else if "%APP%"=="ib-analytics-ui" (
    cd /d "%ROOT_DIR%\frontends\ib-analytics-ui"
    call npm run build
) else if "%APP%"=="ib-auth-service" (
    cd /d "%ROOT_DIR%\backends\ib-auth-service"
    call npm run release
) else if "%APP%"=="ib-sql-report-server" (
    cd /d "%ROOT_DIR%\backends\ib-sql-report-server"
    call npm run release
) else (
    echo ❌ Unknown application: %APP%
)

cd /d "%ROOT_DIR%"
exit /b
