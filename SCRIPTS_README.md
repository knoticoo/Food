# 🐾 Pet Care Tracker - Launch Scripts

This directory contains several scripts to help you launch, monitor, and debug the Pet Care Tracker application.

## 📋 Available Scripts

### 1. `launch-all.sh` - Complete Application Launcher
**The most comprehensive script for launching the entire application.**

```bash
# Start everything with real-time logging
./launch-all.sh

# Show help
./launch-all.sh --help

# Check service status
./launch-all.sh --status

# Kill all services
./launch-all.sh --kill

# Show logs only (don't start services)
./launch-all.sh --logs
```

**Features:**
- ✅ Starts both backend and frontend servers
- ✅ Builds frontend for production
- ✅ Real-time log monitoring with color coding
- ✅ Automatic service health checks
- ✅ Graceful shutdown on Ctrl+C
- ✅ PID tracking for easy cleanup

### 2. `quick-start.sh` - Simple Backend Launcher
**Quick script to start just the backend with basic testing.**

```bash
# Start backend and test registration
./quick-start.sh
```

**Features:**
- ✅ Starts backend server
- ✅ Builds frontend
- ✅ Tests registration API
- ✅ Simple and fast

### 3. `monitor-logs.sh` - Log Monitor
**Real-time log monitoring with color coding.**

```bash
# Monitor all logs in real-time
./monitor-logs.sh
```

**Features:**
- ✅ Color-coded log output
- ✅ Monitors backend, frontend, and debug logs
- ✅ Highlights errors, warnings, and API calls

## 🚀 Quick Start Guide

### Option 1: Full Application (Recommended)
```bash
# Start everything with comprehensive logging
./launch-all.sh
```

### Option 2: Backend Only
```bash
# Start just the backend for API testing
./quick-start.sh
```

### Option 3: Monitor Existing Services
```bash
# Monitor logs if services are already running
./monitor-logs.sh
```

## 📊 Log Files

The scripts create the following log files:

- `logs/backend.log` - Backend server logs
- `logs/frontend.log` - Frontend development server logs
- `backend/database-YYYY-MM-DD.json` - Debug logs
- `logs/backend.pid` - Backend process ID
- `logs/frontend.pid` - Frontend process ID

## 🔧 Manual Commands

If you prefer to run commands manually:

```bash
# Build frontend
npm run build

# Start backend
cd backend && node server.js

# Start frontend dev server
npm run dev:frontend

# Debug database
cd backend && node debug.js

# View backend logs
tail -f logs/backend.log

# View frontend logs
tail -f logs/frontend.log
```

## 🌐 Application URLs

Once started, the application is available at:

- **Production Build**: http://localhost:3001 (served by backend)
- **Development Frontend**: http://localhost:5173 (if using dev server)
- **Backend API**: http://localhost:3001/api

## 🧪 Testing the API

Test registration and login:

```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### View Service Status
```bash
# Check what's running
./launch-all.sh --status
```

### Kill All Services
```bash
# Stop everything
./launch-all.sh --kill
```

### Debug Database
```bash
# Check database state
cd backend && node debug.js all
```

## 📝 Script Features

### `launch-all.sh` Features:
- **Environment Preparation**: Kills existing processes, creates log directories
- **Frontend Building**: Automatically builds the frontend for production
- **Backend Startup**: Starts backend server with logging
- **Health Checks**: Waits for services to be ready
- **Real-time Monitoring**: Shows logs from both services simultaneously
- **Graceful Shutdown**: Properly stops all services on Ctrl+C
- **PID Tracking**: Saves process IDs for easy cleanup

### `quick-start.sh` Features:
- **Simple Setup**: Minimal configuration for quick testing
- **API Testing**: Automatically tests registration endpoint
- **Clear Output**: Shows essential information only

### `monitor-logs.sh` Features:
- **Color Coding**: Different colors for different log types
- **Multi-source**: Monitors backend, frontend, and debug logs
- **Real-time**: Live log streaming
- **Error Highlighting**: Red for errors, yellow for warnings

## 🎯 Use Cases

### Development
```bash
# Start everything with full logging
./launch-all.sh
```

### Testing
```bash
# Quick backend test
./quick-start.sh
```

### Debugging
```bash
# Monitor logs only
./monitor-logs.sh
```

### Production-like Testing
```bash
# Use production build served by backend
./quick-start.sh
# Then open http://localhost:3001
```

## 📋 Requirements

- **Node.js**: Version 16 or higher
- **npm**: For package management
- **curl**: For API testing (optional)
- **jq**: For JSON formatting (optional)

## 🔍 Debug Commands

```bash
# Check database state
cd backend && node debug.js all

# View recent registrations
cd backend && node debug.js logs registrations 10

# View recent logins
cd backend && node debug.js logs logins 10

# Check specific user
cd backend && node debug.js check-user test@example.com

# Database statistics
cd backend && node debug.js stats
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Backend**: "Server running on port 3001"
2. **Frontend**: Build completes successfully
3. **API Test**: Registration returns success message
4. **Logs**: Real-time log output with color coding
5. **Web Access**: Application loads in browser

The registration and login system is fully functional and ready for use!