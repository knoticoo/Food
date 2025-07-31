#!/bin/bash

# Pet Care Tracker - Public Web Access Start Script
# This script builds the frontend and starts the server for public access

echo "🌐 Starting Pet Care Tracker for Public Web Access..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies."
        exit 1
    fi
fi

# Build the frontend
echo "🔨 Building frontend for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend."
    exit 1
fi

# Get the local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo "🚀 Starting server for public access..."
echo "   Local: http://localhost:3001"
echo "   Network: http://$LOCAL_IP:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="

# Start the backend server with host binding for public access
HOST=0.0.0.0 PORT=3001 node backend/server.js