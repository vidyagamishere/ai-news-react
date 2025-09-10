# AdSense Integration & SEO Tracking Guide

## 📊 Google AdSense Integration

### Step 1: AdSense Account Setup
1. **Apply for AdSense**: Visit https://www.google.com/adsense/
2. **Add your site**: Register `https://ai-news-react.vercel.app`
3. **Get approval**: Wait for Google AdSense approval (typically 1-14 days)
4. **Get Ad Client ID**: After approval, you'll receive a client ID like `ca-pub-1234567890123456`

### Step 2: Update Environment Variables

Add to your `.env.local` file:
```bash
VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
VITE_ENABLE_ADS=true
```

### Step 3: Add AdSense Script to HTML

Update `index.html` to include AdSense script:
```html
<!-- Add this in the <head> section -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
        crossorigin="anonymous"></script>

<!-- Add this meta tag for AdSense -->
<meta name="google-adsense-account" content="ca-pub-1234567890123456">
```

### Step 4: Update AdUnit Component

Your existing `AdUnit.tsx` component needs the real AdSense configuration:

```typescript
// src/components/ads/AdUnit.tsx
import React, { useEffect } from 'react';
import './AdUnit.css';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ adSlot, adFormat = 'horizontal', className }) => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const adsEnabled = import.meta.env.VITE_ENABLE_ADS === 'true';

  useEffect(() => {
    if (adsEnabled && clientId && typeof window !== 'undefined') {
      try {
        // Push ads to AdSense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adsEnabled, clientId]);

  if (!adsEnabled || !clientId) {
    return null;
  }

  const getAdStyle = () => {
    switch (adFormat) {
      case 'horizontal':
        return { width: '100%', height: '90px' };
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'vertical':
        return { width: '160px', height: '600px' };
      default:
        return { width: '100%', height: '90px' };
    }
  };

  return (
    <div className={`ad-unit ${className || ''}`}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;
```

### Step 5: Ad Placement Strategy

**Current placements in your app:**
- Header ad: After metrics dashboard
- Sidebar ad: In dashboard sidebar
- Footer ad: Bottom of dashboard

**Recommended additional placements:**
- Between article sections in content tabs
- After onboarding completion
- In newsletter signup areas

---

## 🔍 SEO Tracking Implementation

### Step 1: Google Analytics 4 Setup

1. **Create GA4 Property**: Visit https://analytics.google.com/
2. **Get Measurement ID**: Format `G-XXXXXXXXXX`
3. **Add to environment**:
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 2: Install and Configure Google Analytics

```bash
npm install gtag
```

Create `src/utils/analytics.ts`:
```typescript
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    });

    // Make gtag available globally
    (window as any).gtag = gtag;
  }
};

// Track page views
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Track user signup
export const trackSignup = (method: string) => {
  trackEvent('sign_up', 'engagement', method);
};

// Track newsletter subscription
export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', 'engagement');
};

// Track article clicks
export const trackArticleClick = (articleTitle: string, source: string) => {
  trackEvent('article_click', 'content', `${source}: ${articleTitle}`);
};
```

### Step 3: Add Analytics to Main App

Update `src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initGA } from './utils/analytics';
import './index.css';

// Initialize Google Analytics
initGA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Step 4: Add Route Tracking

Update `src/App.tsx`:
```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './utils/analytics';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return (
    <Routes>
      {/* Your existing routes */}
    </Routes>
  );
}
```

### Step 5: Add Event Tracking to Components

Update key components with tracking:

**Auth Component** (`src/pages/Auth.tsx`):
```typescript
import { trackSignup } from '../utils/analytics';

// In handleSubmit function:
if (mode === 'signup') {
  await signup(formData);
  trackSignup('email'); // Track email signup
  navigate('/onboarding');
}

// In handleGoogleSuccess:
trackSignup('google'); // Track Google signup
```

**ArticleCard Component**:
```typescript
import { trackArticleClick } from '../utils/analytics';

const handleArticleClick = (article) => {
  trackArticleClick(article.title, article.source);
  // Open article
};
```

**Newsletter Subscription**:
```typescript
import { trackNewsletterSignup } from '../utils/analytics';

const handleNewsletterSignup = () => {
  trackNewsletterSignup();
  // Process subscription
};
```

### Step 6: Enhanced SEO Implementation

Update `index.html` with comprehensive meta tags:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>AI News Digest - Your Source for AI News & Insights</title>
  <meta name="title" content="AI News Digest - Your Source for AI News & Insights">
  <meta name="description" content="Get personalized AI news, research breakthroughs, and industry insights delivered daily. Stay ahead with curated content from 500+ trusted sources.">
  <meta name="keywords" content="AI news, artificial intelligence, machine learning, deep learning, AI research, tech news, AI insights">
  <meta name="author" content="AI News Digest">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ai-news-react.vercel.app/">
  <meta property="og:title" content="AI News Digest - Your Source for AI News & Insights">
  <meta property="og:description" content="Get personalized AI news, research breakthroughs, and industry insights delivered daily.">
  <meta property="og:image" content="https://ai-news-react.vercel.app/og-image.png">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://ai-news-react.vercel.app/">
  <meta property="twitter:title" content="AI News Digest - Your Source for AI News & Insights">
  <meta property="twitter:description" content="Get personalized AI news, research breakthroughs, and industry insights delivered daily.">
  <meta property="twitter:image" content="https://ai-news-react.vercel.app/twitter-image.png">
  
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI News Digest",
    "description": "Personalized AI news, events, and learning resources",
    "url": "https://ai-news-react.vercel.app",
    "sameAs": [
      "https://twitter.com/ainewsdigest",
      "https://linkedin.com/company/ainewsdigest"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "AI News Digest"
    }
  }
  </script>
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  
  <!-- AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
          crossorigin="anonymous"></script>
  <meta name="google-adsense-account" content="ca-pub-1234567890123456">
</head>
```

### Step 7: Add Structured Data

Create `src/components/StructuredData.tsx`:
```typescript
import React from 'react';

interface StructuredDataProps {
  type: 'article' | 'organization' | 'website';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getSchema = () => {
    switch (type) {
      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "author": data.author,
          "datePublished": data.publishedAt,
          "publisher": {
            "@type": "Organization",
            "name": "AI News Digest"
          }
        };
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AI News Digest",
          "description": "AI news aggregation and personalized insights platform",
          "url": "https://ai-news-react.vercel.app"
        };
      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema()) }}
    />
  );
};

export default StructuredData;
```

---

## 🚀 Implementation Steps

### Immediate Actions:

1. **Apply for AdSense**: Submit your site for review
2. **Set up GA4**: Create Google Analytics property
3. **Update environment variables**: Add the tracking IDs
4. **Implement tracking**: Add analytics utils and tracking calls

### Code Updates Needed:

```bash
# Install dependencies
npm install gtag

# Update environment variables
echo "VITE_ADSENSE_CLIENT_ID=your-adsense-id" >> .env.local
echo "VITE_GA_MEASUREMENT_ID=your-ga-id" >> .env.local
echo "VITE_ENABLE_ADS=true" >> .env.local
```

### Key Tracking Events to Implement:

1. **User Registration**: Track signup method (email/Google)
2. **Newsletter Subscription**: Track subscription preferences
3. **Article Engagement**: Track clicks, time spent, shares
4. **Topic Selection**: Track user interests and preferences
5. **Conversion Funnel**: Track onboarding completion rates

### SEO Best Practices Already Implemented:

✅ **Semantic HTML structure**
✅ **Responsive meta viewport**
✅ **Clean URL structure with React Router**
✅ **Fast loading with Vite build optimization**
✅ **Mobile-first responsive design**

### Additional SEO Recommendations:

1. **Add sitemap.xml** with all pages
2. **Implement robots.txt** with proper crawling instructions
3. **Add Open Graph images** for social sharing
4. **Use semantic HTML tags** (article, section, nav, etc.)
5. **Optimize Core Web Vitals** with lazy loading and image optimization

This setup will give you comprehensive tracking of user behavior, ad performance, and SEO metrics to optimize your AI news platform effectively.