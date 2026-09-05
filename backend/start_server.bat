@echo off
echo Starting CodeMasters Backend Server...

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python could not be found. Please install Python 3.10+ and add it to your PATH.
    pause
    exit /b
)

:: Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install requirements
echo Installing dependencies...
pip install -r requirements.txt

:: Run the server
echo Starting FastAPI on port 6969...
:: Using uvicorn to run the FastAPI app, listening on all interfaces (0.0.0.0)
uvicorn main:app --host 0.0.0.0 --port 6969

pause
