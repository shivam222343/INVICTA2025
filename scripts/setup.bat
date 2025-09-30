@echo off
echo ========================================
echo    Invicta Registration App Setup
echo ========================================
echo.

echo [1/3] Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
) else (
    echo Dependencies already installed ✓
)
echo.

echo [2/3] Checking environment configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file with your Firebase credentials!
    echo    Open .env and replace the placeholder values with your actual Firebase config.
    echo.
) else (
    echo Environment file exists ✓
)
echo.

echo [3/3] Starting development server...
echo Opening browser preview...
echo.
echo 🚀 Your Invicta app will be available at: http://localhost:5173
echo.
echo Available routes:
echo   • http://localhost:5173/register - Registration form
echo   • http://localhost:5173/login    - Admin login
echo   • http://localhost:5173/admin    - Admin dashboard
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
