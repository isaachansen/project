#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLIENT_PORT=5173
SERVER_PORT=3001
BUILD_DIR="dist"

echo -e "${BLUE}🚀 Tesla Charging Queue - Deployment Script${NC}"
echo "=============================================="

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required commands exist
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci
    log_success "Dependencies installed"
}

# Build the client
build_client() {
    log_info "Building client application..."
    npm run build
    log_success "Client built successfully"
}

# Build the server
build_server() {
    log_info "Building server application..."
    npm run server:build
    log_success "Server built successfully"
}

# Start the server in production mode
start_server() {
    log_info "Starting server on port $SERVER_PORT..."
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        log_warning ".env file not found. Make sure to set environment variables."
    fi
    
    # Set production environment
    export NODE_ENV=production
    export PORT=$SERVER_PORT
    
    # Start the server
    node dist/server.js &
    SERVER_PID=$!
    
    # Wait a moment and check if server started successfully
    sleep 2
    if kill -0 $SERVER_PID 2>/dev/null; then
        log_success "Server started successfully (PID: $SERVER_PID)"
        echo $SERVER_PID > server.pid
    else
        log_error "Failed to start server"
        exit 1
    fi
}

# Serve the client (for production, you'd typically use a web server like nginx)
serve_client() {
    log_info "Serving client application on port $CLIENT_PORT..."
    
    # For production, you should use a proper web server
    # This is a simple solution using Node.js serve package
    if ! command -v serve &> /dev/null; then
        log_info "Installing serve package globally..."
        npm install -g serve
    fi
    
    serve -s $BUILD_DIR -l $CLIENT_PORT &
    CLIENT_PID=$!
    
    # Wait a moment and check if client server started successfully
    sleep 2
    if kill -0 $CLIENT_PID 2>/dev/null; then
        log_success "Client served successfully (PID: $CLIENT_PID)"
        echo $CLIENT_PID > client.pid
    else
        log_error "Failed to serve client"
        exit 1
    fi
}

# Stop running services
stop_services() {
    log_info "Stopping services..."
    
    if [ -f server.pid ]; then
        SERVER_PID=$(cat server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            log_success "Server stopped"
        fi
        rm -f server.pid
    fi
    
    if [ -f client.pid ]; then
        CLIENT_PID=$(cat client.pid)
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill $CLIENT_PID
            log_success "Client server stopped"
        fi
        rm -f client.pid
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build    Build both client and server"
    echo "  start    Start both client and server"
    echo "  stop     Stop running services"
    echo "  restart  Stop, build, and start services"
    echo "  status   Check status of running services"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build     # Build the application"
    echo "  $0 start     # Start the application"
    echo "  $0 restart   # Full restart with rebuild"
}

# Check service status
check_status() {
    log_info "Checking service status..."
    
    # Check server
    if [ -f server.pid ]; then
        SERVER_PID=$(cat server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            log_success "Server is running (PID: $SERVER_PID) on port $SERVER_PORT"
        else
            log_warning "Server PID file exists but process is not running"
            rm -f server.pid
        fi
    else
        log_warning "Server is not running"
    fi
    
    # Check client
    if [ -f client.pid ]; then
        CLIENT_PID=$(cat client.pid)
        if kill -0 $CLIENT_PID 2>/dev/null; then
            log_success "Client is running (PID: $CLIENT_PID) on port $CLIENT_PORT"
        else
            log_warning "Client PID file exists but process is not running"
            rm -f client.pid
        fi
    else
        log_warning "Client server is not running"
    fi
    
    echo ""
    echo "🌐 Application URLs:"
    echo "   Client:  http://localhost:$CLIENT_PORT"
    echo "   Server:  http://localhost:$SERVER_PORT"
    echo "   Health:  http://localhost:$SERVER_PORT/health"
}

# Cleanup on script exit
cleanup() {
    if [ "$1" = "EXIT" ]; then
        log_info "Script interrupted. Cleaning up..."
        stop_services
    fi
}

# Set trap for cleanup
trap 'cleanup EXIT' INT TERM

# Main script logic
case "${1:-start}" in
    "build")
        check_dependencies
        install_dependencies
        build_client
        build_server
        log_success "Build completed successfully!"
        ;;
    "start")
        check_dependencies
        
        # Check if built files exist
        if [ ! -d "$BUILD_DIR" ] || [ ! -d "dist" ]; then
            log_warning "Built files not found. Building first..."
            install_dependencies
            build_client
            build_server
        fi
        
        start_server
        serve_client
        
        echo ""
        log_success "🎉 Application started successfully!"
        echo ""
        check_status
        echo ""
        log_info "To stop the application, run: $0 stop"
        log_info "To check status, run: $0 status"
        
        # Keep script running to maintain services
        wait
        ;;
    "stop")
        stop_services
        log_success "All services stopped"
        ;;
    "restart")
        log_info "Restarting application..."
        stop_services
        check_dependencies
        install_dependencies
        build_client
        build_server
        start_server
        serve_client
        
        echo ""
        log_success "🎉 Application restarted successfully!"
        check_status
        
        # Keep script running to maintain services
        wait
        ;;
    "status")
        check_status
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 