#!/bin/bash

echo "🚀 AI News React Frontend - Deployment Alternatives"
echo "=================================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📋 Multiple deployment options to avoid npm permission issues:${NC}"
echo ""

echo "🎯 OPTION 1: Use npx (No global install needed)"
echo "=============================================="
echo "cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react"
echo "npx vercel --prod"
echo ""

echo "🎯 OPTION 2: Fix npm permissions first"
echo "======================================"
echo "sudo chown -R $(whoami) /usr/local/lib/node_modules"
echo "npm install -g vercel"
echo "vercel --prod"
echo ""

echo "🎯 OPTION 3: Use Vercel Web Interface"
echo "====================================="
echo "1. Build locally: npm run build"
echo "2. Go to: https://vercel.com"
echo "3. Sign in and create new project"
echo "4. Upload the 'dist' folder"
echo ""

echo "🎯 OPTION 4: Use Netlify (Drag & Drop)"
echo "======================================"
echo "1. Build locally: npm run build"
echo "2. Go to: https://app.netlify.com/drop"
echo "3. Drag the 'dist' folder to deploy instantly"
echo ""

echo "🎯 OPTION 5: Use GitHub Pages"
echo "============================="
echo "1. Push to GitHub repository"
echo "2. Enable GitHub Pages in repo settings"
echo "3. Set source to 'dist' folder"
echo ""

echo -e "${GREEN}✅ RECOMMENDED: Try Option 1 (npx vercel) first!${NC}"
echo ""

# Check if we're in the right directory
if [ -f "package.json" ]; then
    echo "📍 You're in the correct directory"
    
    echo ""
    echo "🔍 Let's check your build first:"
    if [ -d "dist" ]; then
        echo "✅ Build directory exists"
        BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
        echo "   Build size: $BUILD_SIZE"
    else
        echo "📦 Building your app first..."
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ Build successful!"
            BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
            echo "   Build size: $BUILD_SIZE"
        else
            echo "❌ Build failed"
            exit 1
        fi
    fi
    
    echo ""
    echo "🚀 Ready to deploy! Try this command:"
    echo -e "${GREEN}npx vercel --prod${NC}"
    
else
    echo "❌ Please run this from the ai-news-react directory"
    exit 1
fi