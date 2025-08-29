#!/bin/bash

echo "Starting OPD-EMR Backend Server..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

echo "Starting server in development mode..."
echo "Server will be available at: http://localhost:5000"
echo "API Base URL: http://localhost:5000/api"
echo "Health Check: http://localhost:5000/health"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev
