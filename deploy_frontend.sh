#!/bin/bash

# Deploy AI News React Frontend with Authentication
echo "🚀 Deploying AI News React Frontend with Authentication..."

# Check if we're in the right directory
if [ ! -f "src/App.tsx" ]; then
    echo "❌ Error: App.tsx not found. Please run this from the ai-news-react directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if required authentication files exist
echo "📋 Checking authentication components..."
AUTH_FILES=(
    "src/types/auth.ts"
    "src/contexts/AuthContext.tsx"
    "src/services/authService.ts"
    "src/components/auth/AuthModal.tsx"
    "src/components/auth/GoogleSignIn.tsx"
    "src/components/auth/auth.css"
    "src/components/onboarding/TopicSelector.tsx"
    "src/components/onboarding/onboarding.css"
    "src/components/subscription/SubscriptionTiers.tsx"
    "src/components/subscription/subscription.css"
)

for file in "${AUTH_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing authentication file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "📝 Creating production environment template..."
    cat > .env.production << EOL
REACT_APP_API_BASE=https://your-backend-domain.vercel.app
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_ENVIRONMENT=production
EOL
fi

echo ""
echo "⚠️  IMPORTANT: Update your deployment platform with these environment variables:"
echo ""
echo "Required Variables:"
echo "- REACT_APP_API_BASE=https://your-backend-domain.vercel.app"
echo "- REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id"
echo "- REACT_APP_ENVIRONMENT=production"
echo ""

# Deploy to Vercel (if available)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo ""
    echo "✅ Deployment initiated!"
else
    echo "💡 Vercel CLI not found. You can:"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Or deploy by connecting your Git repository to Vercel/Netlify"
fi

echo ""
echo "🎉 Frontend deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in your deployment dashboard"
echo "2. Verify the backend API is accessible"
echo "3. Test the authentication flow"
echo "4. Configure Google OAuth credentials"

# Test build locally
echo ""
echo "🧪 Want to test locally first? Run:"
echo "npm run dev"