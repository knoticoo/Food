#!/bin/bash

# 📊 Log Monitor for Pet Care Tracker
# Real-time log monitoring with color coding

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}📊 PET CARE TRACKER LOG MONITOR${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"
echo ""

# Function to monitor backend logs
monitor_backend() {
    if [ -f "logs/backend.log" ]; then
        tail -f logs/backend.log | while read line; do
            # Color code different types of logs
            if [[ $line == *"ERROR"* ]]; then
                echo -e "${RED}[BACKEND]${NC} $line"
            elif [[ $line == *"WARN"* ]]; then
                echo -e "${YELLOW}[BACKEND]${NC} $line"
            elif [[ $line == *"register"* ]] || [[ $line == *"login"* ]]; then
                echo -e "${GREEN}[BACKEND]${NC} $line"
            else
                echo -e "${BLUE}[BACKEND]${NC} $line"
            fi
        done
    else
        echo -e "${YELLOW}No backend log file found${NC}"
    fi
}

# Function to monitor frontend logs
monitor_frontend() {
    if [ -f "logs/frontend.log" ]; then
        tail -f logs/frontend.log | while read line; do
            # Color code different types of logs
            if [[ $line == *"error"* ]]; then
                echo -e "${RED}[FRONTEND]${NC} $line"
            elif [[ $line == *"warn"* ]]; then
                echo -e "${YELLOW}[FRONTEND]${NC} $line"
            elif [[ $line == *"API"* ]]; then
                echo -e "${GREEN}[FRONTEND]${NC} $line"
            else
                echo -e "${PURPLE}[FRONTEND]${NC} $line"
            fi
        done
    else
        echo -e "${YELLOW}No frontend log file found${NC}"
    fi
}

# Function to monitor debug logs
monitor_debug() {
    if [ -f "backend/database-$(date +%Y-%m-%d).json" ]; then
        tail -f backend/database-$(date +%Y-%m-%d).json | while read line; do
            echo -e "${CYAN}[DEBUG]${NC} $line"
        done
    else
        echo -e "${YELLOW}No debug log file found for today${NC}"
    fi
}

# Start monitoring all logs
(
    monitor_backend &
    monitor_frontend &
    monitor_debug &
    wait
)