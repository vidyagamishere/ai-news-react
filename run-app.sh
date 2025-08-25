#!/bin/bash

# AI News React Frontend Setup and Run Script

echo "🚀 Setting up AI News React Frontend..."

# Navigate to project directory
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react

# Check if we have node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    
    # Try different package managers
    if command -v pnpm &> /dev/null; then
        echo "Using pnpm..."
        pnpm install
    elif command -v yarn &> /dev/null; then
        echo "Using yarn..."
        yarn install
    else
        echo "Fixing npm permissions and installing..."
        sudo chown -R $(whoami) ~/.npm 2>/dev/null || true
        npm install
    fi
else
    echo "✅ Dependencies already installed"
fi

echo "🧪 Testing API connection..."
node test-api.js

echo "🚀 Starting development server..."
echo "📱 Your app will be available at: http://localhost:5173"
echo "🔗 Backend API: https://ai-news-scraper.vercel.app"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
if command -v pnpm &> /dev/null; then
    pnpm dev
elif command -v yarn &> /dev/null; then
    yarn dev
else
    npm run dev
fi