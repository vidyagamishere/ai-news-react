# Local Testing Guide - AI News React Frontend

## 🧪 Complete Local Testing Before Deployment

Follow these steps to thoroughly test your React app locally:

## Step 1: Prerequisites Check

```bash
cd /Users/vijayansubramaniyan/Desktop/AI-ML/Projects/ai-news-react

# Check Node.js version (should be 18+)
node --version

# Check if project files exist
ls -la src/components/
```

## Step 2: Test API Connection

```bash
# Test backend API is working
node test-api.js
```

**Expected Output:**
```
✅ Health check: healthy
✅ Digest loaded: Morning Digest
✅ Sources loaded: 12 of 12
🎉 All API endpoints working correctly!
```

## Step 3: Install Dependencies

Try these options in order:

### Option A: Fix npm permissions
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### Option B: Use yarn
```bash
# Install yarn if not available
brew install yarn
# or
npm install -g yarn --force

# Install dependencies
yarn install
```

### Option C: Use pnpm
```bash
# Install pnpm
brew install pnpm
# or
npm install -g pnpm --force

# Install dependencies
pnpm install
```

### Option D: Use the automated script
```bash
./run-app.sh
```

## Step 4: Start Development Server

```bash
# Using npm
npm run dev

# OR using yarn
yarn dev

# OR using pnpm
pnpm dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## Step 5: Open and Test the Application

Open your browser and go to: **http://localhost:5173**

### Visual Testing Checklist

#### 📱 **Initial Load**
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] Header displays "AI News Digest" with icons
- [ ] No console errors in browser dev tools (F12)

#### 🎨 **Layout & Design**
- [ ] Header is sticky at top
- [ ] Metrics dashboard shows 4 colored cards
- [ ] Top stories section displays ranked articles
- [ ] Content tabs show: All Content, Articles, Podcasts, Videos
- [ ] Article cards display properly with images/content
- [ ] Footer is at bottom

#### 📊 **Metrics Dashboard**
- [ ] Total Updates shows a number (should be ~21)
- [ ] High Impact shows count of important stories
- [ ] New Research shows research article count
- [ ] Industry Moves shows business news count
- [ ] Key Points list displays bullet points

#### 🔥 **Top Stories Section**
- [ ] Shows numbered ranking (1, 2, 3)
- [ ] Story titles are clickable links
- [ ] Source names display correctly
- [ ] Significance scores show with star icons
- [ ] External link icons appear

#### 📰 **Content Tabs**
- [ ] "All Content" tab is active by default
- [ ] Click "Articles" - shows only blog posts
- [ ] Click "Podcasts" - shows audio content
- [ ] Click "Videos" - shows video content
- [ ] Article counts in tab labels are accurate
- [ ] Content switches correctly between tabs

#### 🎯 **Article Cards**
- [ ] Cards have proper spacing and hover effects
- [ ] Source and time information display
- [ ] Significance scores show with colored badges
- [ ] Article titles are clickable
- [ ] Descriptions are readable
- [ ] "Read Time" or "Listen" or "Watch" labels appear
- [ ] External links open in new tabs

#### ⚡ **Interactive Features**
- [ ] "Refresh" button in header works
- [ ] "Update Sources" button triggers loading state
- [ ] Loading spinners work during updates
- [ ] Error messages appear/disappear properly
- [ ] Hover effects work on cards and buttons

#### 🎵 **Media Content** (if available)
- [ ] Audio players display for podcast content
- [ ] Video thumbnails show for video content
- [ ] Play buttons appear on video cards
- [ ] Duration displays correctly

## Step 6: Responsive Testing

Test on different screen sizes:

### Desktop Testing
```bash
# Open browser and resize window to test different sizes:
# - Large desktop (1920px+)
# - Medium desktop (1200px-1919px)
# - Small desktop (992px-1199px)
```

### Mobile/Tablet Testing
```bash
# In browser, press F12 and toggle device toolbar
# Test these device sizes:
# - iPhone (390px width)
# - iPad (768px width)
# - Android phone (360px width)
```

#### Mobile/Tablet Checklist
- [ ] Header stacks vertically on mobile
- [ ] Metrics cards stack in single column
- [ ] Content tabs work on mobile
- [ ] Article cards fit properly
- [ ] Text is readable without zooming
- [ ] Buttons are touch-friendly
- [ ] No horizontal scrolling

## Step 7: Performance Testing

### Load Time Testing
```bash
# In browser dev tools (F12):
# 1. Go to Network tab
# 2. Refresh page
# 3. Check load times:
```

**Expected Performance:**
- [ ] Initial page load < 2 seconds
- [ ] API calls complete < 3 seconds
- [ ] Images load progressively
- [ ] No failed network requests
- [ ] Bundle size reasonable (check in Network tab)

### Memory Testing
```bash
# In browser dev tools:
# 1. Go to Performance tab
# 2. Record a session while using the app
# 3. Check for memory leaks
```

## Step 8: Error Handling Testing

### Network Error Simulation
```bash
# In browser dev tools:
# 1. Go to Network tab
# 2. Set throttling to "Offline"
# 3. Refresh page
# 4. Check error handling
```

**Error Testing Checklist:**
- [ ] Offline mode shows proper error message
- [ ] Failed API calls show retry options
- [ ] Loading states handle timeouts gracefully
- [ ] Error messages are user-friendly

### API Endpoint Testing
```bash
# Test individual API endpoints in browser:
# 1. https://ai-news-scraper.vercel.app/health
# 2. https://ai-news-scraper.vercel.app/api/digest
# 3. https://ai-news-scraper.vercel.app/api/sources
```

## Step 9: Cross-Browser Testing

Test in multiple browsers:
- [ ] **Chrome** (primary)
- [ ] **Safari** (if on Mac)
- [ ] **Firefox**
- [ ] **Edge** (if on Windows)

## Step 10: Build Testing

Test production build locally:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Build Testing:**
- [ ] Build completes without errors
- [ ] Preview works at http://localhost:4173
- [ ] All features work in production build
- [ ] Console shows no errors
- [ ] Assets load correctly

## Step 11: Console & Dev Tools Check

### Browser Console (F12)
Check for these issues:
- [ ] No JavaScript errors
- [ ] No 404 errors for missing assets
- [ ] No CORS errors
- [ ] API calls return expected data
- [ ] React components render without warnings

### Common Issues to Check

#### API Issues
```javascript
// Check in console for these errors:
// ❌ CORS errors
// ❌ 404 API endpoints
// ❌ Timeout errors
// ❌ JSON parsing errors
```

#### React Issues
```javascript
// Check for these warnings:
// ⚠️  Key prop warnings
// ⚠️  Deprecated lifecycle warnings
// ⚠️  Memory leak warnings
```

## Step 12: Feature Integration Testing

### Manual Refresh Testing
1. Click "Refresh" button
2. Verify loading state appears
3. Check that content updates
4. Confirm new timestamp appears

### Manual Scrape Testing
1. Click "Update Sources" button
2. Verify longer loading time
3. Check for new articles
4. Confirm metrics update

### Tab Switching Testing
1. Click each content tab
2. Verify filtering works
3. Check article counts match
4. Ensure smooth transitions

## ✅ Ready for Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] ✅ All visual elements display correctly
- [ ] ✅ All interactive features work
- [ ] ✅ API integration functions properly  
- [ ] ✅ Responsive design works on all screen sizes
- [ ] ✅ No console errors or warnings
- [ ] ✅ Production build works locally
- [ ] ✅ Performance is acceptable
- [ ] ✅ Error handling works properly
- [ ] ✅ External links open correctly
- [ ] ✅ Media content displays properly

## 🚀 If All Tests Pass

Your app is ready for deployment! Proceed with:

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod
```

## 🔧 Common Issues & Solutions

### Issue: npm permission errors
**Solution:** `sudo chown -R $(whoami) ~/.npm`

### Issue: Port 5173 already in use
**Solution:** `npm run dev -- --port 3000`

### Issue: API connection fails
**Solution:** Check backend status: `node test-api.js`

### Issue: Build fails
**Solution:** `rm -rf node_modules package-lock.json && npm install`

---

Following this testing guide ensures your React frontend works perfectly before deployment! 🚀