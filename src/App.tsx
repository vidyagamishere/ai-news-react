import { useState, useEffect } from 'react';
import './App.css';
import { apiService, type DigestResponse } from './services/api';
import Header from './components/Header';
import MetricsDashboard from './components/MetricsDashboard';
import TopStories from './components/TopStories';
import ContentSection from './components/ContentSection';
import Loading from './components/Loading';

function App() {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
    // Load initial data
    fetchDigest(false);
  }, []);

  if (loading && !digest) {
    return <Loading message="Loading latest AI news..." />;
  }

  if (error && !digest) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => fetchDigest(false)} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>📰 No News Available</h2>
          <p>No digest data available at the moment.</p>
          <button onClick={() => fetchDigest(true)} className="btn btn-primary">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
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
        <div className="digest-header">
          <div className="digest-meta">
            <span className="digest-badge">{digest.badge}</span>
            <span className="digest-time">
              Updated: {new Date(digest.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        
        <MetricsDashboard 
          metrics={digest.summary.metrics}
          keyPoints={digest.summary.keyPoints}
        />
        
        <TopStories stories={digest.topStories} />
        
        <ContentSection 
          blogArticles={digest.content.blog}
          audioArticles={digest.content.audio}
          videoArticles={digest.content.video}
        />
      </main>
      
      <footer className="footer">
        <p>AI News Digest - Powered by AI News Scraper API</p>
        <p>
          <a 
            href="https://ai-news-scraper.vercel.app/health" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            API Status
          </a>
        </p>
      </footer>
      
      {loading && (
        <div className="loading-overlay">
          <Loading message="Updating content..." />
        </div>
      )}
    </div>
  );
}

export default App;
