# AI News React Frontend - Deployment Guide

## Quick Start (Choose One Method)

### Option 1: Fix npm and run locally
```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react
sudo chown -R 501:20 "/Users/vijayansubramaniyan/.npm"
npm install
npm run dev
```

### Option 2: Use yarn (recommended)
```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react
npm install -g yarn
yarn install
yarn dev
```

### Option 3: Use pnpm
```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react
npm install -g pnpm
pnpm install
pnpm dev
```

## Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react
vercel --prod
```

### 2. Netlify
```bash
# Build for production
npm run build

# Upload dist/ folder to Netlify dashboard
# or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages
```bash
# Add to package.json scripts:
"homepage": "https://yourusername.github.io/ai-news-react",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Environment Configuration

### Development (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://ai-news-scraper.vercel.app
```

## Testing Before Deployment

```bash
# Test API connection
node test-api.js

# Build and test locally
npm run build
npm run preview
```

## Troubleshooting

### npm Permission Issues
```bash
sudo chown -R $(whoami) ~/.npm
# or
sudo chown -R 501:20 "/Users/vijayansubramaniyan/.npm"
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
# or
yarn install
```

### API Connection Issues
1. Check if backend is running: https://ai-news-scraper.vercel.app/health
2. Verify CORS configuration in backend
3. Check API_BASE_URL in src/services/api.ts

## Production Checklist

- [ ] API endpoints tested and working
- [ ] Build completes without errors
- [ ] Responsive design tested on mobile
- [ ] All components render correctly
- [ ] Loading states work properly
- [ ] Error handling functions correctly
- [ ] External links open properly
- [ ] Audio/video players work

## Performance Tips

1. **Code Splitting**: Already configured with Vite
2. **Image Optimization**: Consider adding next/image equivalent
3. **Bundle Analysis**: Use `npm run build -- --analyze`
4. **Caching**: Configure proper cache headers

## Monitoring

After deployment, monitor:
- **Load Times**: Should be under 3 seconds
- **API Response Times**: Monitor backend performance
- **Error Rates**: Check browser console for errors
- **User Experience**: Test all interactive features

---

Your React frontend is ready to deploy! It's fully integrated with your AI News Scraper backend at `https://ai-news-scraper.vercel.app`.