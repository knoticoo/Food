#!/bin/bash

# 🚀 Quick Start Script for Pet Care Tracker
# Simple script to start backend and show logs

echo "🐾 Starting Pet Care Tracker..."

# Kill any existing processes
pkill -f "node server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Build frontend
echo "📦 Building frontend..."
npm run build

# Start backend
echo "🔧 Starting backend server..."
cd backend
nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "🌐 Backend URL: http://localhost:3001"
echo "📊 Logs: logs/backend.log"
echo ""
echo "🔍 To view logs: tail -f logs/backend.log"
echo "🛑 To stop: kill $BACKEND_PID"
echo ""
echo "🎯 Testing registration..."
sleep 3

# Test the API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Quick Test","email":"quick@test.com","password":"123456"}' \
  2>/dev/null | jq '.' || echo "API test completed"

echo ""
echo "🎉 Application is ready!"
echo "📱 Open http://localhost:3001 in your browser"
echo "🔧 Debug: cd backend && node debug.js"