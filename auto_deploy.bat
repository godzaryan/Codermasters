@echo off
setlocal
title CodeMasters Auto-Deployer

echo ========================================================
echo       CodeMasters Auto-Deployer (Vercel Style)
echo ========================================================
echo This script will check GitHub every 15 seconds.
echo If it detects new code, it will automatically pull, 
echo kill the old servers, and reboot everything!
echo ========================================================
echo.

:loop
echo [%time%] Checking for updates on GitHub...

:: Fetch latest remote info without merging
git fetch origin main >nul 2>&1

:: Check if local branch is behind remote
git status -uno | findstr /C:"branch is behind" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [!] NEW CODE DETECTED! Starting deployment sequence...
    echo ========================================================
    
    echo [1/4] Pulling latest code from GitHub...
    git pull
    
    echo [2/4] Terminating old server instances...
    :: Kills existing node and python processes gracefully
    taskkill /F /IM node.exe >nul 2>&1
    taskkill /F /IM python.exe >nul 2>&1
    
    echo [3/4] Building and Booting Backend...
    cd backend
    start "CodeMasters Backend" start_server.bat
    cd ..
    
    echo [4/4] Building and Booting Frontend...
    cd frontend
    start "CodeMasters Frontend" start_frontend.bat
    cd ..
    
    echo ========================================================
    echo [SUCCESS] Live deployment finished! Servers are up!
    echo ========================================================
    echo.
)

:: Wait 15 seconds before checking again
timeout /t 15 /nobreak >nul
goto loop
