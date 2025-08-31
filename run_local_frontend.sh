#!/bin/bash

# Local Frontend Development Server
echo "🎨 Starting AI News React Frontend (Local Development)"

# Check if we're in the right directory
if [ ! -f "src/App.tsx" ]; then
    echo "❌ Error: App.tsx not found. Please run this from the ai-news-react directory."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found. Please create it with local configuration."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if all auth components exist
echo "🔍 Checking authentication components..."
REQUIRED_FILES=(
    "src/types/auth.ts"
    "src/contexts/AuthContext.tsx"
    "src/services/authService.ts"
    "src/components/auth/AuthModal.tsx"
    "src/components/auth/GoogleSignIn.tsx"
    "src/components/onboarding/TopicSelector.tsx"
    "src/components/subscription/SubscriptionTiers.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Build check
echo "🔨 Running build check..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before running development server."
    exit 1
fi

echo "✅ Build successful!"

# Start development server
echo ""
echo "🌟 Starting development server at http://localhost:3000"
echo "🔗 Make sure backend is running at http://localhost:8000"
echo ""
echo "Frontend Features Available:"
echo "  ✅ Authentication (Sign up/Sign in)"
echo "  ✅ Google OAuth integration"
echo "  ✅ Topic preferences"
echo "  ✅ Subscription tiers"
echo "  ✅ Personalized dashboard"
echo "  ✅ Mobile responsive design"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev