#!/bin/bash

# 🐾 Pet Care Tracker - Complete Launch Script
# This script launches the entire application with comprehensive logging

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}🐾 PET CARE TRACKER LAUNCHER${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_section() {
    echo -e "${CYAN}--- $1 ---${NC}"
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to show real-time logs
show_logs() {
    local log_file=$1
    local service_name=$2
    
    if [ -f "$log_file" ]; then
        print_status "Showing real-time logs for $service_name:"
        echo -e "${PURPLE}Press Ctrl+C to stop log monitoring${NC}"
        tail -f "$log_file" | while read line; do
            echo -e "${CYAN}[$service_name]${NC} $line"
        done
    else
        print_warning "Log file $log_file not found for $service_name"
    fi
}

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    print_section "Preparing Environment"
    
    # Kill existing processes on our ports
    kill_port 3001  # Backend
    kill_port 5173  # Frontend dev server
    kill_port 4173  # Frontend preview
    
    # Create logs directory
    mkdir -p logs
    
    print_section "Building Frontend"
    print_status "Building frontend for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend built successfully!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    print_section "Starting Backend Server"
    print_status "Starting backend server on port 3001..."
    
    # Start backend with logging
    cd backend
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3001/api/auth/register" "Backend"; then
        print_status "Backend server started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend server failed to start"
        exit 1
    fi
    
    print_section "Starting Frontend Development Server"
    print_status "Starting frontend development server on port 5173..."
    
    # Start frontend dev server with logging
    nohup npm run dev:frontend > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if wait_for_service "http://localhost:5173" "Frontend"; then
        print_status "Frontend development server started successfully (PID: $FRONTEND_PID)"
    else
        print_warning "Frontend development server may not be ready yet"
    fi
    
    print_section "Application Status"
    echo -e "${GREEN}✅ Backend:${NC} http://localhost:3001"
    echo -e "${GREEN}✅ Frontend:${NC} http://localhost:5173"
    echo -e "${GREEN}✅ Production Build:${NC} http://localhost:3001 (served by backend)"
    echo ""
    echo -e "${YELLOW}📊 Log Files:${NC}"
    echo -e "   Backend: logs/backend.log"
    echo -e "   Frontend: logs/frontend.log"
    echo ""
    echo -e "${PURPLE}🔧 Debug Commands:${NC}"
    echo -e "   Check backend logs: tail -f logs/backend.log"
    echo -e "   Check frontend logs: tail -f logs/frontend.log"
    echo -e "   Debug database: cd backend && node debug.js"
    echo -e "   Kill all processes: pkill -f 'node server.js' && pkill -f 'vite'"
    echo ""
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > logs/backend.pid
    echo $FRONTEND_PID > logs/frontend.pid
    
    print_section "Real-time Log Monitoring"
    echo -e "${CYAN}Starting real-time log monitoring...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Function to cleanup on exit
    cleanup() {
        print_section "Shutting Down Services"
        print_status "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        
        print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        
        print_status "Cleaning up PID files..."
        rm -f logs/backend.pid logs/frontend.pid
        
        print_status "All services stopped!"
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Show real-time logs from both services
    (
        # Backend logs
        if [ -f "logs/backend.log" ]; then
            tail -f logs/backend.log | while read line; do
                echo -e "${BLUE}[BACKEND]${NC} $line"
            done &
        fi
        
        # Frontend logs
        if [ -f "logs/frontend.log" ]; then
            tail -f logs/frontend.log | while read line; do
                echo -e "${GREEN}[FRONTEND]${NC} $line"
            done &
        fi
        
        # Wait for any child process to exit
        wait
    )
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --logs     Show logs only (don't start services)"
    echo "  -k, --kill     Kill all running services"
    echo "  -s, --status   Show status of running services"
    echo ""
    echo "Examples:"
    echo "  $0              # Start all services with logging"
    echo "  $0 --logs       # Show logs only"
    echo "  $0 --kill       # Kill all services"
    echo "  $0 --status     # Check service status"
}

# Function to show status
show_status() {
    print_header
    print_section "Service Status"
    
    if check_port 3001; then
        echo -e "${GREEN}✅ Backend:${NC} Running on port 3001"
    else
        echo -e "${RED}❌ Backend:${NC} Not running"
    fi
    
    if check_port 5173; then
        echo -e "${GREEN}✅ Frontend Dev:${NC} Running on port 5173"
    else
        echo -e "${RED}❌ Frontend Dev:${NC} Not running"
    fi
    
    if [ -f "logs/backend.pid" ]; then
        echo -e "${GREEN}📄 Backend PID:${NC} $(cat logs/backend.pid)"
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        echo -e "${GREEN}📄 Frontend PID:${NC} $(cat logs/frontend.pid)"
    fi
}

# Function to kill services
kill_services() {
    print_header
    print_section "Killing Services"
    
    # Kill by PID files
    if [ -f "logs/backend.pid" ]; then
        local pid=$(cat logs/backend.pid)
        print_status "Killing backend process (PID: $pid)..."
        kill $pid 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        local pid=$(cat logs/frontend.pid)
        print_status "Killing frontend process (PID: $pid)..."
        kill $pid 2>/dev/null || true
        rm -f logs/frontend.pid
    fi
    
    # Kill by port
    kill_port 3001
    kill_port 5173
    kill_port 4173
    
    print_status "All services killed!"
}

# Function to show logs only
show_logs_only() {
    print_header
    print_section "Log Monitoring"
    echo -e "${YELLOW}Press Ctrl+C to stop log monitoring${NC}"
    echo ""
    
    # Show logs from both services
    (
        if [ -f "logs/backend.log" ]; then
            tail -f logs/backend.log | while read line; do
                echo -e "${BLUE}[BACKEND]${NC} $line"
            done &
        fi
        
        if [ -f "logs/frontend.log" ]; then
            tail -f logs/frontend.log | while read line; do
                echo -e "${GREEN}[FRONTEND]${NC} $line"
            done &
        fi
        
        wait
    )
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -s|--status)
        show_status
        exit 0
        ;;
    -k|--kill)
        kill_services
        exit 0
        ;;
    -l|--logs)
        show_logs_only
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac