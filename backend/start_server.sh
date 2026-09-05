#!/bin/bash

echo "Starting CodeMasters Backend Server..."

# Check if python3 is installed
if ! command -v python3 &> /dev/null
then
    echo "Python3 could not be found. Please install it first."
    exit
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "Starting FastAPI on port 6969..."
# Using uvicorn to run the FastAPI app, listening on all interfaces (0.0.0.0)
uvicorn main:app --host 0.0.0.0 --port 6969
