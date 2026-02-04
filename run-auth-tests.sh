#!/bin/bash

# Authentication E2E Test Runner with Comprehensive Logging
# This script runs authentication tests repeatedly until they all pass

set -e  # Exit on error (disabled for retry logic)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_ATTEMPTS=10
CURRENT_ATTEMPT=1
SERVER_PORT=5000
CLIENT_PORT=3000
SERVER_LOG="server-test.log"
CLIENT_LOG="client-test.log"
CYPRESS_LOG="cypress-test-run.log"
ERROR_LOG="auth-tests-error.log"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Authentication E2E Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if server is running
check_server() {
    curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1
    return $?
}

# Function to check if client is running
check_client() {
    curl -s http://localhost:$CLIENT_PORT > /dev/null 2>&1
    return $?
}

# Function to kill processes on ports
cleanup() {
    echo -e "${YELLOW}Cleaning up processes...${NC}"
    
    # Kill server
    if lsof -ti:$SERVER_PORT > /dev/null 2>&1; then
        echo "Stopping server on port $SERVER_PORT..."
        kill $(lsof -ti:$SERVER_PORT) 2>/dev/null || true
        sleep 2
    fi
    
    # Kill client
    if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
        echo "Stopping client on port $CLIENT_PORT..."
        kill $(lsof -ti:$CLIENT_PORT) 2>/dev/null || true
        sleep 2
    fi
}

# Trap cleanup on exit
trap cleanup EXIT INT TERM

# Initialize log files
echo "=== Authentication Test Run - $(date) ===" > "$SERVER_LOG"
echo "=== Client Log - $(date) ===" > "$CLIENT_LOG"
echo "=== Cypress Test Run - $(date) ===" > "$CYPRESS_LOG"
echo "=== Error Log - $(date) ===" > "$ERROR_LOG"

# Start server
echo -e "${BLUE}Starting server...${NC}"
cd server
npm run dev >> "../$SERVER_LOG" 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to be ready
echo "Waiting for server to start on port $SERVER_PORT..."
WAIT_COUNT=0
while ! check_server; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $WAIT_COUNT -gt 30 ]; then
        echo -e "${RED}Server failed to start after 60 seconds${NC}"
        echo "Server logs:"
        tail -n 50 "$SERVER_LOG"
        exit 1
    fi
    echo -n "."
done
echo ""
echo -e "${GREEN}Server started successfully!${NC}"

# Start client
echo -e "${BLUE}Starting client...${NC}"
cd client
npm run dev >> "../$CLIENT_LOG" 2>&1 &
CLIENT_PID=$!
cd ..

# Wait for client to be ready
echo "Waiting for client to start on port $CLIENT_PORT..."
WAIT_COUNT=0
while ! check_client; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $WAIT_COUNT -gt 60 ]; then
        echo -e "${RED}Client failed to start after 120 seconds${NC}"
        echo "Client logs:"
        tail -n 50 "$CLIENT_LOG"
        exit 1
    fi
    echo -n "."
done
echo ""
echo -e "${GREEN}Client started successfully!${NC}"

# Run tests with retry logic
while [ $CURRENT_ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test Attempt $CURRENT_ATTEMPT of $MAX_ATTEMPTS${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Run Cypress tests for auth directory only
    cd client
    if npm run cypress:run -- --spec "cypress/e2e/auth/**/*.cy.ts" >> "../$CYPRESS_LOG" 2>&1; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Test execution summary:"
        echo "  Attempt: $CURRENT_ATTEMPT"
        echo "  Server log: $SERVER_LOG"
        echo "  Client log: $CLIENT_LOG"
        echo "  Cypress log: $CYPRESS_LOG"
        echo "  Error log: $ERROR_LOG"
        echo ""
        
        # Show final test summary from Cypress log
        echo -e "${BLUE}Final Test Results:${NC}"
        tail -n 20 "../$CYPRESS_LOG"
        
        cd ..
        exit 0
    else
        echo ""
        echo -e "${RED}✗ Tests failed on attempt $CURRENT_ATTEMPT${NC}"
        echo ""
        
        # Extract and display errors
        echo -e "${YELLOW}Recent errors:${NC}"
        tail -n 30 "../$CYPRESS_LOG"
        echo ""
        
        # Log failure
        echo "[$(date)] Attempt $CURRENT_ATTEMPT failed" >> "../$ERROR_LOG"
        tail -n 50 "../$CYPRESS_LOG" >> "../$ERROR_LOG"
        echo "" >> "../$ERROR_LOG"
        
        CURRENT_ATTEMPT=$((CURRENT_ATTEMPT + 1))
        
        if [ $CURRENT_ATTEMPT -le $MAX_ATTEMPTS ]; then
            echo -e "${YELLOW}Retrying in 5 seconds...${NC}"
            sleep 5
        fi
    fi
    cd ..
done

# If we get here, all attempts failed
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}✗ TESTS FAILED AFTER $MAX_ATTEMPTS ATTEMPTS${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "Please review the following log files:"
echo "  Server log: $SERVER_LOG"
echo "  Client log: $CLIENT_LOG"
echo "  Cypress log: $CYPRESS_LOG"
echo "  Error log: $ERROR_LOG"
echo ""
echo "Screenshots: client/cypress/screenshots/"
echo "Videos: client/cypress/videos/"
echo ""

exit 1
