import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService, type DigestResponse } from '../services/api';
import Header from '../components/Header';
import MetricsDashboard from '../components/MetricsDashboard';
import TopStories from '../components/TopStories';
import ContentTabs from '../components/content/ContentTabs';
import Loading from '../components/Loading';
import TopicSelector from '../components/onboarding/TopicSelector';
import SubscriptionTiers from '../components/subscription/SubscriptionTiers';
import AdUnit from '../components/ads/AdUnit';

const Dashboard: React.FC = () => {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { user } = useAuth();

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
      
      const scrapeResult = await apiService.triggerScrape();
      console.log('Manual scrape result:', scrapeResult);
      
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
    if (user) {
      const hasCompletedOnboarding = user.preferences?.topics?.some(t => t.selected) || false;
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
        return;
      }
    }
    
    fetchDigest(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - 5000;
      if (isNewUser && !showOnboarding) {
        setShowWelcome(true);
      }
    }
  }, [user]);

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
        
        {import.meta.env.VITE_ENABLE_ADS === 'true' && (
          <AdUnit 
            adSlot="1234567890"
            adFormat="horizontal"
            className="header-ad"
          />
        )}
        
        <TopStories stories={digest.topStories} />
        
        <ContentTabs userTier={user?.subscriptionTier || 'free'} />
        
        {import.meta.env.VITE_ENABLE_ADS === 'true' && (
          <AdUnit 
            adSlot="2345678901"
            adFormat="rectangle"
            className="content-ad"
          />
        )}

        {user?.subscriptionTier === 'free' && (
          <div className="upgrade-section">
            <SubscriptionTiers showOnlyUpgrade={false} />
          </div>
        )}
      </main>
      
      {import.meta.env.VITE_ENABLE_ADS === 'true' && (
        <AdUnit 
          adSlot="3456789012"
          adFormat="horizontal"
          className="footer-ad"
        />
      )}
      
      <footer className="footer modern-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>AI News Digest - Powered by AI News Scraper API</p>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/about">About</Link>
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
};

export default Dashboard;