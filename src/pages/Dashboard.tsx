import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { apiService, type DigestResponse } from '../services/api';
import Header from '../components/Header';
import MetricsDashboard from '../components/MetricsDashboard';
import TopStories from '../components/TopStories';
import ContentTabs from '../components/content/ContentTabs';
import Loading from '../components/Loading';
import TopicSelector from '../components/onboarding/TopicSelector';
import AdUnit from '../components/ads/AdUnit';
import SEO from '../components/SEO';

const Dashboard: React.FC = () => {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { user } = useAuth();
  const { isCurrentUserAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const fetchDigest = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getDigest(refresh);
      setDigest(data);
      setLastRefresh(new Date());
      
      console.log('Digest loaded:', data);
      
      // Log enhanced backend features
      if (data.admin_features) {
        console.log('✅ Enhanced backend with admin validation active');
      }
      if (data.enhanced) {
        console.log('✅ Enhanced scraping with free AI sources active');
      }
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
      // Redirect admin users to admin panel
      if (isCurrentUserAdmin) {
        navigate('/admin');
        return;
      }

      // Check if email is verified for new users
      if (!user.emailVerified && new Date(user.createdAt).getTime() > Date.now() - (24 * 60 * 60 * 1000)) {
        // New user (within 24 hours) without verified email should be redirected to verification
        navigate('/verify-email?email=' + encodeURIComponent(user.email));
        return;
      }

      // For verified users, check onboarding status
      const hasCompletedOnboarding = user.preferences?.onboardingCompleted || 
                                   localStorage.getItem('onboardingComplete') === 'true' ||
                                   user.preferences?.topics?.some(t => t.selected) || false;
      
      // Check if user has any personalization data (indicates they've used the app before)
      const hasUserData = user.preferences?.newsletterFrequency || 
                          user.preferences?.contentTypes?.length > 0 ||
                          user.preferences?.emailNotifications !== undefined;
      
      // Only show onboarding for users without any previous data AND created recently
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - (5 * 60 * 1000);
      const needsOnboarding = !hasCompletedOnboarding && !hasUserData && isNewUser;
      
      if (needsOnboarding) {
        setShowOnboarding(true);
        return;
      }
    }
    
    fetchDigest(false);
  }, [user, navigate, isCurrentUserAdmin]);

  useEffect(() => {
    if (user) {
      // Only show welcome for truly new users who haven't completed onboarding
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - (5 * 60 * 1000);
      const hasCompletedOnboarding = user.preferences?.onboardingCompleted || 
                                   localStorage.getItem('onboardingComplete') === 'true' ||
                                   user.preferences?.topics?.some(t => t.selected) || false;
      
      if (isNewUser && !showOnboarding && !hasCompletedOnboarding) {
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
      <SEO 
        title="AI News Dashboard - Personalized AI Insights"
        description="Your personalized AI news dashboard with latest breakthroughs, industry insights, and research updates."
        url="/dashboard"
      />
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

      
      <main className="main-content">
        <div className="main-content-contained">
          
          <div className="dashboard-layout">
            <div className="dashboard-main">
              <TopStories stories={digest.topStories} />
              
              {import.meta.env.VITE_ENABLE_ADS === 'true' && digest.topStories && digest.topStories.length > 0 && (
                <AdUnit 
                  adSlot="1234567890"
                  adFormat="horizontal"
                  className="header-ad"
                />
              )}
              
              <ContentTabs userTier={user?.subscriptionTier || 'free'} />
              
              <div className="metrics-section">
                <MetricsDashboard 
                  metrics={digest.summary.metrics}
                />
              </div>
            </div>
            
            <div className="dashboard-sidebar">
              {import.meta.env.VITE_ENABLE_ADS === 'true' && digest.topStories && digest.topStories.length > 0 && (
                <AdUnit 
                  adSlot="2345678901"
                  adFormat="rectangle"
                  className="sidebar-ad"
                />
              )}

              {user?.subscriptionTier === 'free' && (
                <div className="sidebar-upgrade">
                  <div className="upgrade-card">
                    <div className="upgrade-header">
                      <Crown size={24} className="upgrade-icon" />
                      <h3>Upgrade to Premium</h3>
                    </div>
                    <div className="upgrade-features">
                      <div className="feature-item">✨ Daily AI digests</div>
                      <div className="feature-item">🎯 Personalized content</div>
                      <div className="feature-item">📱 Mobile access</div>
                    </div>
                    <button className="upgrade-btn">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {import.meta.env.VITE_ENABLE_ADS === 'true' && digest.topStories && digest.topStories.length > 0 && (
        <AdUnit 
          adSlot="3456789012"
          adFormat="horizontal"
          className="footer-ad"
        />
      )}
      
      <footer className="footer modern-footer">
        <div className="footer-content">
          <div className="footer-center">
            <p>Copyright @2025 by Vidyagam Learning LLC</p>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/about">About</Link>
              <a 
                href="/admin-validation" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#667eea', fontSize: '12px' }}
                title="Admin Panel (requires admin key)"
              >
                🛠️ Admin
              </a>
            </div>
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