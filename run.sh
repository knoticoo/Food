#!/bin/bash

# Pet Care Tracker - Universal Start Script
# Usage: ./run.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}🐾 Pet Care Tracker${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

# Install dependencies
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies."
            exit 1
        fi
        print_status "Dependencies installed ✓"
    else
        print_status "Dependencies already installed ✓"
    fi
}

# Development mode
start_dev() {
    print_header
    print_status "Starting in DEVELOPMENT mode..."
    print_status "Backend: http://localhost:3001"
    print_status "Frontend: http://localhost:5173"
    echo ""
    print_warning "Press Ctrl+C to stop all servers"
    echo ""
    
    npm run dev
}

# Production mode
start_prod() {
    print_header
    print_status "Starting in PRODUCTION mode..."
    
    # Build frontend
    print_status "Building frontend for production..."
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build frontend."
        exit 1
    fi
    print_status "Frontend built successfully ✓"
    
    # Get local IP
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    print_status "Starting production server..."
    print_status "Local: http://localhost:3001"
    print_status "Network: http://$LOCAL_IP:3001"
    echo ""
    print_warning "Press Ctrl+C to stop the server"
    echo ""
    
    # Start production server
    HOST=0.0.0.0 PORT=3001 node backend/server.js
}

# Main execution
main() {
    MODE=${1:-dev}
    
    case $MODE in
        "dev"|"development")
            check_prerequisites
            install_dependencies
            start_dev
            ;;
        "prod"|"production")
            check_prerequisites
            install_dependencies
            start_prod
            ;;
        *)
            print_error "Invalid mode. Use 'dev' or 'prod'"
            echo ""
            echo "Usage:"
            echo "  ./run.sh          # Start in development mode"
            echo "  ./run.sh dev      # Start in development mode"
            echo "  ./run.sh prod     # Start in production mode"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"