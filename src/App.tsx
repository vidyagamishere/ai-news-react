import { useState, useEffect } from 'react';
import './App.css';
import { apiService, type DigestResponse } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import MetricsDashboard from './components/MetricsDashboard';
import TopStories from './components/TopStories';
import Loading from './components/Loading';
import AuthModal from './components/auth/AuthModal';
import TopicSelector from './components/onboarding/TopicSelector';
import SubscriptionTiers from './components/subscription/SubscriptionTiers';
import ContentTabs from './components/content/ContentTabs';
import AdUnit from './components/ads/AdUnit';

function AppContent() {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const fetchDigest = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getDigest(refresh);
      setDigest(data);
      setLastRefresh(new Date());
      
      console.log('Digest loaded:', data);
    } catch (err) {
      console.error('Failed to fetch digest:', err);
      setError('Failed to load AI news digest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDigest(true);
  };

  const handleManualScrape = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Trigger manual scraping
      const scrapeResult = await apiService.triggerScrape();
      console.log('Manual scrape result:', scrapeResult);
      
      // Wait a moment then refresh digest
      setTimeout(() => {
        fetchDigest(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to trigger manual scrape:', err);
      setError('Failed to update sources. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show welcome flow for new users
    if (isAuthenticated && user) {
      const hasCompletedOnboarding = user.preferences.topics.some(t => t.selected);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
        return;
      }
    }
    
    // Load initial data
    fetchDigest(false);
  }, [isAuthenticated, user]);

  // Handle new user sign up
  useEffect(() => {
    if (isAuthenticated && user) {
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - 5000; // Within 5 seconds
      if (isNewUser && !showOnboarding) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated, user]);

  // Show loading if auth is still loading
  if (authLoading) {
    return <Loading message="Loading..." />;
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <div className="app onboarding-app">
        <TopicSelector 
          onComplete={() => {
            setShowOnboarding(false);
            setShowWelcome(false);
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setShowWelcome(false);
          }}
        />
      </div>
    );
  }

  // Show welcome modal for new users
  if (showWelcome) {
    return (
      <div className="app">
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <h2>Welcome to AI News Digest!</h2>
            <p>Let's customize your experience</p>
            <div className="welcome-actions">
              <button 
                onClick={() => {
                  setShowWelcome(false);
                  setShowOnboarding(true);
                }}
                className="btn btn-primary"
              >
                Get Started
              </button>
              <button 
                onClick={() => setShowWelcome(false)}
                className="btn btn-ghost"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="app landing-app">
        <Header 
          onRefresh={handleRefresh}
          onManualScrape={handleManualScrape}
          isLoading={loading}
          lastUpdated={lastRefresh?.toISOString()}
        />
        
        <div className="landing-hero">
          <div className="hero-content">
            <h1>Stay Ahead in AI</h1>
            <p className="hero-subtitle">
              Get personalized AI news, insights, and updates delivered to your inbox. 
              Choose from curated topics and premium features.
            </p>
            
            <div className="hero-features">
              <div className="feature">
                <div className="feature-icon">📰</div>
                <h3>Curated Content</h3>
                <p>Hand-picked AI news from trusted sources</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <h3>Personalized Topics</h3>
                <p>Choose what matters most to you</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Daily Updates</h3>
                <p>Never miss important AI developments</p>
              </div>
            </div>

            <div className="hero-cta">
              <AuthModal 
                isOpen={true}
                onClose={() => {}}
                initialMode="signup"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !digest) {
    return <Loading message="Loading latest AI news..." />;
  }

  if (error && !digest) {
    return (
      <div className="app">
        <Header 
          onRefresh={handleRefresh}
          onManualScrape={handleManualScrape}
          isLoading={loading}
          lastUpdated={lastRefresh?.toISOString()}
        />
        <div className="error-container">
          <div className="error-message">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => fetchDigest(false)} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="app">
        <Header 
          onRefresh={handleRefresh}
          onManualScrape={handleManualScrape}
          isLoading={loading}
          lastUpdated={lastRefresh?.toISOString()}
        />
        <div className="error-container">
          <div className="error-message">
            <h2>📰 No News Available</h2>
            <p>No digest data available at the moment.</p>
            <button onClick={() => fetchDigest(true)} className="btn btn-primary">
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="app authenticated-app">
      <Header 
        onRefresh={handleRefresh}
        onManualScrape={handleManualScrape}
        isLoading={loading}
        lastUpdated={lastRefresh?.toISOString()}
      />
      
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {user?.subscriptionTier === 'free' && (
        <div className="upgrade-banner">
          <div className="upgrade-content">
            <span>🚀 Upgrade to Premium for daily digests, AI events, and exclusive content</span>
            <button 
              onClick={() => setShowWelcome(true)} 
              className="btn btn-small btn-primary"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      
      <main className="main-content">
        <div className="digest-header">
          <div className="digest-meta">
            <span className="digest-badge">{digest.badge}</span>
            <span className="digest-time">
              Updated: {new Date(digest.timestamp).toLocaleString()}
            </span>
            {user && (
              <span className="personalized-badge">
                Personalized for {user.name}
              </span>
            )}
          </div>
        </div>
        
        <MetricsDashboard 
          metrics={digest.summary.metrics}
          keyPoints={digest.summary.keyPoints}
        />
        
        {/* Header Ad - Non-intrusive banner */}
        <AdUnit 
          adSlot="1234567890"
          adFormat="horizontal"
          className="header-ad"
        />
        
        <TopStories stories={digest.topStories} />
        
        {/* Professional Content Tabs Interface */}
        <ContentTabs userTier={user?.subscriptionTier || 'free'} />
        
        {/* Content Ad - Between main sections */}
        <AdUnit 
          adSlot="2345678901"
          adFormat="rectangle"
          className="content-ad"
        />

        {user?.subscriptionTier === 'free' && (
          <div className="upgrade-section">
            <SubscriptionTiers showOnlyUpgrade={false} />
          </div>
        )}
      </main>
      
      {/* Footer Ad - Before footer */}
      <AdUnit 
        adSlot="3456789012"
        adFormat="horizontal"
        className="footer-ad"
      />
      
      <footer className="footer modern-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>AI News Digest - Powered by AI News Scraper API</p>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/about">About</a>
            </div>
          </div>
          <div className="footer-right">
            <a 
              href="https://ai-news-scraper.vercel.app/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="api-status"
            >
              API Status
            </a>
          </div>
        </div>
      </footer>
      
      {loading && (
        <div className="loading-overlay">
          <Loading message="Updating content..." />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
