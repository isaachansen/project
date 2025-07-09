#!/bin/bash

# Start the Slack proxy server in the background
echo "🚀 Starting TypeScript Slack proxy server..."
npm run server &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Proxy server running on http://localhost:3001"
else
    echo "❌ Failed to start proxy server"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Start the frontend development server
echo "🎨 Starting frontend development server..."
npm run dev

# Cleanup: kill the proxy server when frontend stops
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null 