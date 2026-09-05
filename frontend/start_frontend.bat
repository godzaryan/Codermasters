@echo off
echo Starting CodeMasters Frontend Server...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js could not be found. Please install Node.js and add it to your PATH.
    pause
    exit /b
)

echo Installing dependencies...
call npm install

echo Building production optimized bundle...
call npm run build

echo Starting Next.js frontend on port 80...
:: Ensure you run this script as Administrator so it can bind to port 80!
call npm start -- -p 80

pause
