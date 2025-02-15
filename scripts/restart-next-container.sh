#!/bin/bash

# Set error handling
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the container name (matching zizcon-v2_web_1 pattern)
CONTAINER_NAME=$(docker ps -a --filter "name=zizcon-v2_web_1" --format "{{.Names}}")

if [ -z "$CONTAINER_NAME" ]; then
    print_error "Next.js container not found"
    exit 1
fi

print_status "Found container: $CONTAINER_NAME"

# Stop the container
print_status "Stopping container..."
docker stop $CONTAINER_NAME || {
    print_error "Failed to stop container"
    exit 1
}

# Remove the container
print_status "Removing container..."
docker rm $CONTAINER_NAME || {
    print_error "Failed to remove container"
    exit 1
}

# Rebuild and start the container
print_status "Rebuilding and starting container..."
docker-compose up -d --build web || {
    print_error "Failed to rebuild and start container"
    exit 1
}

print_status "Container successfully restarted!"

# Follow the logs for 5 seconds to show startup progress
print_status "Showing startup logs (5 seconds)..."
timeout 5 docker logs -f $CONTAINER_NAME || true

print_status "Done! Container is running in the background."
