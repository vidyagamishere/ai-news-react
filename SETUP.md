# AI News React Frontend - Setup Guide

## 🚀 Quick Start

Your React frontend is ready to run! Choose the easiest option for you:

### Option 1: Use the Setup Script (Recommended)
```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react
./run-app.sh
```

### Option 2: Manual Setup
```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react

# Test API connection first
node test-api.js

# Install dependencies (try one of these)
npm install
# OR if npm has issues:
sudo chown -R $(whoami) ~/.npm && npm install
# OR use a different package manager:
brew install yarn && yarn install
```

Then start the dev server:
```bash
npm run dev
# OR
yarn dev
```

## 📱 What You'll See

When the app starts successfully, you'll see:
- **Development server** running at `http://localhost:5173`
- **Modern AI News Interface** with:
  - 📊 **Metrics Dashboard**: Total updates, high impact stories
  - 🔥 **Top Stories**: Ranked by significance score
  - 📰 **Content Tabs**: Filter by Articles, Podcasts, Videos
  - 🔄 **Refresh Controls**: Manual content updates
  - 📱 **Responsive Design**: Works on all devices

## 🎯 Features Working

✅ **Real-time Data**: Connected to your AI News Scraper backend  
✅ **21 Total Articles**: From 12 different AI sources  
✅ **Mixed Content**: Blog posts, podcasts, and videos  
✅ **Interactive UI**: Hover effects, smooth animations  
✅ **External Links**: Direct access to original articles  
✅ **Significance Scoring**: Color-coded impact levels  

## 🔧 Troubleshooting

### If you get npm permission errors:
```bash
sudo chown -R $(whoami) ~/.npm
```

### If dependencies won't install:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### If the app won't start:
1. Check Node.js version: `node --version` (should be 18+)
2. Test API: `node test-api.js`
3. Check port 5173 is available

## 🚀 Deployment Ready

Your app is also ready to deploy to:
- **Vercel**: `vercel --prod`
- **Netlify**: Upload `dist/` folder after `npm run build`
- **GitHub Pages**: Follow instructions in DEPLOYMENT.md

## 📊 Backend Integration

Your frontend connects to:
- **API**: `https://ai-news-scraper.vercel.app`
- **Health**: https://ai-news-scraper.vercel.app/health
- **Sources**: 12 active AI news sources
- **Content**: Articles, podcasts, videos with smart categorization

---

## 🎉 You're All Set!

Your modern React frontend is ready to showcase your AI news content beautifully. Run the app and enjoy your professional-grade news aggregation interface!

**Next Steps:**
1. Run the app: `./run-app.sh`
2. Open browser: `http://localhost:5173`
3. Explore the interface and test all features
4. Deploy when ready: See DEPLOYMENT.md