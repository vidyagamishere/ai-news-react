import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, type DigestResponse } from '../services/api';
import Header from '../components/Header';
import TopStories from '../components/TopStories';
import Loading from '../components/Loading';
import SEO from '../components/SEO';

// Lazy load heavy components
const MetricsDashboard = lazy(() => import('../components/MetricsDashboard'));
const ContentTabs = lazy(() => import('../components/content/ContentTabs'));
const TopicSelector = lazy(() => import('../components/onboarding/TopicSelector'));
const AdUnit = lazy(() => import('../components/ads/AdUnit'));

const Dashboard: React.FC = () => {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [digestLoading, setDigestLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to auth');
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchDigest = async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
      } else {
        setDigestLoading(true);
      }
      setError(null);
      
      // Add timeout with fallback data
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );
      
      const dataPromise = apiService.getDigest(refresh);
      
      try {
        const data = await Promise.race([dataPromise, timeoutPromise]) as DigestResponse;
        setDigest(data);
        setLastRefresh(new Date());
        
        console.log('Digest loaded:', data);
        
        // Log enhanced backend features
        if ((data as any).admin_features) {
          console.log('✅ Enhanced backend with admin validation active');
        }
        if ((data as any).enhanced) {
          console.log('✅ Enhanced scraping with free AI sources active');
        }
      } catch (timeoutErr) {
        console.log('API timeout, loading fallback data...');
        // Provide fallback data for fast loading
        const fallbackData: DigestResponse = {
          topStories: [
            {
              id: 'fallback-1',
              title: 'Welcome to Vidyagam AI News',
              summary: 'Your personalized AI news dashboard is loading. We are fetching the latest AI developments from 45+ sources to bring you the most relevant content.',
              url: '#',
              source: 'Vidyagam',
              timestamp: new Date().toISOString(),
              significanceScore: 8.5,
              category: 'general'
            },
            {
              id: 'fallback-2',
              title: 'Loading Latest AI Intelligence',
              summary: 'Our AI systems are curating breaking news from top research labs, startups, and industry leaders. This usually takes just a few seconds.',
              url: '#',
              source: 'AI News Network',
              timestamp: new Date().toISOString(),
              significanceScore: 7.8,
              category: 'technology'
            }
          ],
          summary: {
            metrics: {
              totalUpdates: 0,
              highImpact: 0,
              research: 0,
              industryMoves: 0
            },
            lastUpdated: new Date().toISOString()
          },
          content: [],
          timestamp: new Date().toISOString(),
          badge: 'Loading'
        };
        
        setDigest(fallbackData);
        setError('Loading cached content while fetching latest updates...');
        
        // Continue trying to load real data in background
        dataPromise.then(realData => {
          setDigest(realData);
          setError(null);
          setLastRefresh(new Date());
          console.log('Real data loaded after fallback:', realData);
        }).catch(() => {
          // Keep fallback data if real data fails
          console.log('Continuing with fallback data');
        });
      }
    } catch (err) {
      console.error('Failed to fetch digest:', err);
      setError('Unable to load content. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setDigestLoading(false);
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
      // Skip email verification check for now to avoid redirect loops
      // if (!user.emailVerified && new Date(user.createdAt).getTime() > Date.now() - (24 * 60 * 60 * 1000)) {
      //   navigate('/verify-email?email=' + encodeURIComponent(user.email));
      //   return;
      // }

      // For verified users, check onboarding status
      const hasCompletedOnboarding = user.preferences?.onboardingCompleted || 
                                   localStorage.getItem('onboardingComplete') === 'true' ||
                                   user.preferences?.topics?.some(t => t.selected) || false;
      
      // Check if user has any personalization data (indicates they've used the app before)
      const hasUserData = user.preferences?.newsletterFrequency || 
                          user.preferences?.contentTypes?.length > 0 ||
                          user.preferences?.emailNotifications !== undefined;
      
      // Show onboarding for users without any previous data AND created recently (extended for Google users)
      const needsOnboarding = !hasCompletedOnboarding && !hasUserData;
      
      if (needsOnboarding) {
        setShowOnboarding(true);
        return;
      }
    }
    
    // Start loading digest immediately, prioritize top stories
    fetchDigest(false);
    
    // Preload content types in background for faster tab switching
    setTimeout(() => {
      apiService.get('/api/content-types').catch(() => {
        // Silently fail, will be retried when tab is clicked
      });
    }, 2000);
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      // Only show welcome for truly new users who haven't completed onboarding
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      const hasCompletedOnboarding = user.preferences?.onboardingCompleted || 
                                   localStorage.getItem('onboardingComplete') === 'true' ||
                                   user.preferences?.topics?.some(t => t.selected) || false;
      
      if (isNewUser && !showOnboarding && !hasCompletedOnboarding) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Show loading while authentication is being determined
  if (authLoading) {
    return <Loading message="Checking authentication..." />;
  }

  // If not authenticated, the useEffect will redirect to /auth
  if (!isAuthenticated) {
    return <Loading message="Redirecting to sign in..." />;
  }

  if (showOnboarding) {
    return (
      <div className="app onboarding-app">
        <Suspense fallback={<Loading message="Loading onboarding..." />}>
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
        </Suspense>
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

  // Show loading only for initial page load, not for digest updates
  if (digestLoading && !digest) {
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
        title="Vidyagam AI News Dashboard | Intelligence at Light Speed"
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
                <Suspense fallback={<div style={{height: '90px', background: '#f5f5f5', borderRadius: '8px'}} />}>
                  <AdUnit 
                    adSlot="1234567890"
                    adFormat="horizontal"
                    className="header-ad"
                  />
                </Suspense>
              )}
              
              <Suspense fallback={<Loading message="Loading content tabs..." />}>
                <ContentTabs 
                  userTier={user?.subscriptionTier || 'free'} 
                  topStories={digest.topStories} 
                />
              </Suspense>
              
              <div className="metrics-section">
                <Suspense fallback={<div style={{height: '200px', background: '#f5f5f5', borderRadius: '8px'}} />}>
                  <MetricsDashboard 
                    metrics={digest.summary.metrics}
                  />
                </Suspense>
              </div>
            </div>
            
            <div className="dashboard-sidebar">
              {import.meta.env.VITE_ENABLE_ADS === 'true' && digest.topStories && digest.topStories.length > 0 && (
                <Suspense fallback={<div style={{height: '250px', background: '#f5f5f5', borderRadius: '8px'}} />}>
                  <AdUnit 
                    adSlot="2345678901"
                    adFormat="rectangle"
                    className="sidebar-ad"
                  />
                </Suspense>
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
        <Suspense fallback={<div style={{height: '90px', background: '#f5f5f5', borderRadius: '8px'}} />}>
          <AdUnit 
            adSlot="3456789012"
            adFormat="horizontal"
            className="footer-ad"
          />
        </Suspense>
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