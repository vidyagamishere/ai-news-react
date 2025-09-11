import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, TrendingUp, Archive as ArchiveIcon, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import Header from '../components/Header';
import Loading from '../components/Loading';
import TopStories from '../components/TopStories';
import ContentTabs from '../components/content/ContentTabs';
import SEO from '../components/SEO';

interface ArchivedDigest {
  id: string;
  archive_date: string;
  digest_data: any;
  top_stories_count: number;
  total_articles: number;
  sources_processed: number;
  created_at: string;
}

interface ArchiveStats {
  total_digests: number;
  total_articles: number;
  total_top_stories: number;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
  content_types: Record<string, number>;
  retention_days: number;
  scraping_days: number;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  source: string;
  content_type: string;
  significance_score: number;
  summary: string;
  archived_date: string;
  is_top_story: boolean;
}

const Archive: React.FC = () => {
  const [archives, setArchives] = useState<ArchivedDigest[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<any>(null);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [view, setView] = useState<'calendar' | 'search' | 'digest'>('calendar');

  const { user } = useAuth();

  useEffect(() => {
    loadArchiveData();
  }, []);

  const loadArchiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load recent archives and stats
      const [archivesResponse, statsResponse] = await Promise.all([
        apiService.get('/api/archive/digests?days=30'),
        apiService.get('/api/archive/stats')
      ]);

      setArchives(archivesResponse.archives || []);
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to load archive data:', err);
      setError('Failed to load archive data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDigestByDate = async (date: string) => {
    try {
      setLoading(true);
      const digest = await apiService.get(`/api/archive/digest/${date}`);
      setSelectedDigest(digest);
      setSelectedDate(date);
      setView('digest');
    } catch (err) {
      console.error(`Failed to load digest for ${date}:`, err);
      setError(`No digest found for ${date}`);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const results = await apiService.get(`/api/archive/search?q=${encodeURIComponent(searchQuery)}&days=30`);
      setSearchResults(results.results || []);
      setView('search');
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !selectedDigest) {
    return <Loading message="Loading archive..." />;
  }

  if (error && !selectedDigest && !archives.length) {
    return (
      <div className="app">
        <Header onRefresh={() => {}} onManualScrape={() => {}} isLoading={false} />
        <div className="error-container">
          <div className="error-message">
            <h2>⚠️ Archive Error</h2>
            <p>{error}</p>
            <button onClick={() => loadArchiveData()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app authenticated-app">
      <SEO 
        title="Vidyagam Archive | Intelligence at Light Speed"
        description="Browse historical AI news digests and search through archived articles."
        url="/archive"
      />
      <Header onRefresh={loadArchiveData} onManualScrape={() => {}} isLoading={loading} />
      
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <main className="main-content">
        <div className="main-content-contained">
          <div className="archive-header">
            <div className="archive-title">
              <ArchiveIcon size={32} />
              <div>
                <h1>News Archive</h1>
                <p>Browse and search through historical AI news digests</p>
              </div>
            </div>

            {stats && (
              <div className="archive-stats">
                <div className="stat-card">
                  <Calendar size={20} />
                  <div>
                    <div className="stat-value">{stats.total_digests}</div>
                    <div className="stat-label">Days Archived</div>
                  </div>
                </div>
                <div className="stat-card">
                  <TrendingUp size={20} />
                  <div>
                    <div className="stat-value">{stats.total_articles}</div>
                    <div className="stat-label">Total Articles</div>
                  </div>
                </div>
                <div className="stat-card">
                  <Clock size={20} />
                  <div>
                    <div className="stat-value">{stats.retention_days}</div>
                    <div className="stat-label">Retention Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="archive-nav">
            <button 
              className={`nav-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <Calendar size={16} />
              Calendar View
            </button>
            <button 
              className={`nav-btn ${view === 'search' ? 'active' : ''}`}
              onClick={() => setView('search')}
            >
              <Search size={16} />
              Search Archive
            </button>
            {selectedDigest && (
              <button 
                className={`nav-btn ${view === 'digest' ? 'active' : ''}`}
                onClick={() => setView('digest')}
              >
                <ArchiveIcon size={16} />
                {formatDate(selectedDate)}
              </button>
            )}
          </div>

          {view === 'calendar' && (
            <div className="archive-calendar">
              <h2>Recent Digests</h2>
              <div className="digests-grid">
                {archives.map((archive) => (
                  <div 
                    key={archive.id} 
                    className="digest-card"
                    onClick={() => loadDigestByDate(archive.archive_date)}
                  >
                    <div className="digest-date">
                      {formatDate(archive.archive_date)}
                    </div>
                    <div className="digest-stats">
                      <span>{archive.top_stories_count} top stories</span>
                      <span>{archive.total_articles} articles</span>
                      <span>{archive.sources_processed} sources</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {archives.length === 0 && (
                <div className="no-archives">
                  <ArchiveIcon size={48} />
                  <h3>No Archives Yet</h3>
                  <p>Archives will appear here as daily digests are generated.</p>
                </div>
              )}
            </div>
          )}

          {view === 'search' && (
            <div className="archive-search">
              <h2>Search Archive</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search articles by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
                <button 
                  onClick={performSearch} 
                  disabled={searchLoading || !searchQuery.trim()}
                  className="search-btn"
                >
                  {searchLoading ? <Loading /> : <Search size={16} />}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3>{searchResults.length} results found</h3>
                  <div className="results-list">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        className={`result-item ${result.is_top_story ? 'top-story' : ''}`}
                        onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="result-header">
                          <h4>{result.title}</h4>
                          <div className="result-meta">
                            <span className="source">{result.source}</span>
                            <span className="date">{formatDate(result.archived_date)}</span>
                            {result.is_top_story && <span className="top-story-badge">🔥 Top Story</span>}
                          </div>
                        </div>
                        <p className="result-summary">{result.summary}</p>
                        <div className="result-score">
                          Score: {result.significance_score.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'digest' && selectedDigest && (
            <div className="archived-digest">
              <div className="digest-header">
                <button 
                  onClick={() => setView('calendar')} 
                  className="back-btn"
                >
                  <ChevronLeft size={16} />
                  Back to Calendar
                </button>
                <h2>{formatDate(selectedDate)}</h2>
              </div>

              {/* Display the archived digest using existing components */}
              <TopStories stories={selectedDigest.topStories || []} />
              <ContentTabs 
                userTier={user?.subscriptionTier || 'free'} 
                topStories={selectedDigest.topStories || []}
                isArchive={true}
                archiveContent={selectedDigest.content}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Archive;