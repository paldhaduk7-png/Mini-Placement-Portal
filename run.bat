@echo off
setlocal

title Mini Placement Portal Launcher

echo ========================================
echo       MINI PLACEMENT PORTAL
echo ========================================
echo.

:: 1. Check if Node.js / npm is available in PATH
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js/npm was not found. Please install Node.js and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Check if backend dependencies are installed
if not exist "%~dp0backend\node_modules" (
    echo [ERROR] Backend dependencies are missing.
    echo Please install them by running:
    echo cd backend
    echo npm install
    echo.
    pause
    exit /b 1
)

:: 3. Check if frontend dependencies are installed
if not exist "%~dp0frontend\node_modules" (
    echo [ERROR] Frontend dependencies are missing.
    echo Please install them by running:
    echo cd frontend
    echo npm install
    echo.
    pause
    exit /b 1
)

echo Starting Backend...
echo Starting Frontend...
echo.
echo Backend and Frontend are starting in separate windows.
echo.
echo ========================================
echo.

:: Launch Backend in a separate window
cd /d "%~dp0backend"
start "Mini Placement Portal - Backend Server" cmd /k "npm run dev"

:: Launch Frontend in a separate window
cd /d "%~dp0frontend"
start "Mini Placement Portal - Frontend Server" cmd /k "npm run dev"

:: Return to project root
cd /d "%~dp0"
