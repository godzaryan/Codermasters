@echo off
setlocal EnableDelayedExpansion
title CodeMasters Auto-Deployer

echo ========================================================
echo       CodeMasters Auto-Deployer (Vercel Style)
echo ========================================================
echo This script checks GitHub every 15 seconds.
echo If it detects new code, it will automatically pull, 
echo close old server windows, and reboot everything!
echo ========================================================
echo.

:loop
echo [%time%] Checking for updates on GitHub...

:: 1. Get current commit hash
FOR /F "delims=" %%H IN ('git rev-parse HEAD') DO set LOCAL_HASH=%%H

:: 2. Fetch latest remote info
git fetch origin main >nul 2>&1

:: 3. Force local branch to match remote exactly (ignores local changes)
git reset --hard origin/main >nul 2>&1

:: 4. Get new commit hash
FOR /F "delims=" %%H IN ('git rev-parse HEAD') DO set NEW_HASH=%%H

:: 5. Compare hashes to see if an update actually occurred
IF "!LOCAL_HASH!" NEQ "!NEW_HASH!" (
    echo.
    echo ========================================================
    echo [!] NEW CODE DETECTED! Starting deployment sequence...
    echo ========================================================
    
    echo [1/3] Terminating old server windows...
    :: Kills the specific command windows by their title and all child processes (/T)
    taskkill /F /FI "WINDOWTITLE eq CodeMasters Backend*" /T >nul 2>&1
    taskkill /F /FI "WINDOWTITLE eq CodeMasters Frontend*" /T >nul 2>&1
    
    :: Failsafe: also kill rogue node/python processes just in case
    taskkill /F /IM node.exe >nul 2>&1
    taskkill /F /IM python.exe >nul 2>&1
    
    echo [2/3] Building and Booting Backend...
    cd backend
    start "CodeMasters Backend" cmd /c "start_server.bat"
    cd ..
    
    echo [3/3] Building and Booting Frontend...
    cd frontend
    start "CodeMasters Frontend" cmd /c "start_frontend.bat"
    cd ..
    
    echo ========================================================
    echo [SUCCESS] Live deployment finished! Servers are up!
    echo ========================================================
    echo.
)

:: Wait 15 seconds before checking again
timeout /t 15 /nobreak >nul
goto loop
