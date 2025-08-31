import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Loading from '../Loading';
import './ContentTabs.css';

interface ContentType {
  name: string;
  description: string;
  icon: string;
}

interface ContentResponse {
  content_type: string;
  content_info: ContentType;
  articles: any[];
  total: number;
  sources_available: number;
  user_tier: string;
  featured_sources: Array<{name: string, website: string}>;
}

interface ContentTypesResponse {
  content_types: Record<string, ContentType>;
}

interface ContentTabsProps {
  userTier: string;
}

export default function ContentTabs({ userTier: _ }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all_sources');
  const [contentTypes, setContentTypes] = useState<Record<string, ContentType>>({});
  const [content, setContent] = useState<Record<string, ContentResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Define tab order for professional presentation
  const tabOrder = ['all_sources', 'blogs', 'podcasts', 'videos', 'events', 'learn'];

  // Load available content types on mount
  useEffect(() => {
    loadContentTypes();
  }, []);

  // Load content for active tab
  useEffect(() => {
    if (activeTab && !content[activeTab] && !loading[activeTab]) {
      loadContent(activeTab);
    }
  }, [activeTab]);

  const loadContentTypes = async () => {
    try {
      const response: ContentTypesResponse = await apiService.get('/content-types');
      setContentTypes(response.content_types);
    } catch (err) {
      console.error('Failed to load content types:', err);
      setError('Failed to load content types');
    }
  };

  const loadContent = async (contentType: string) => {
    try {
      setLoading(prev => ({ ...prev, [contentType]: true }));
      setError(null);

      const response: ContentResponse = await apiService.get(`/content/${contentType}`);
      setContent(prev => ({ ...prev, [contentType]: response }));
    } catch (err) {
      console.error(`Failed to load ${contentType} content:`, err);
      setError(`Failed to load ${contentType} content`);
    } finally {
      setLoading(prev => ({ ...prev, [contentType]: false }));
    }
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleRefresh = () => {
    loadContent(activeTab);
  };

  // All content types are available to all users, ordered professionally
  const availableContentTypes = tabOrder
    .map(key => [key, contentTypes[key]] as [string, ContentType])
    .filter(([, info]) => info); // Only include defined content types

  const currentContent = content[activeTab];
  const isLoading = loading[activeTab];

  return (
    <div className="content-tabs">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-list">
          {availableContentTypes.map(([key, info]) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => handleTabClick(key)}
              disabled={false}
            >
              <span className="tab-icon">{info.icon}</span>
              <span className="tab-name">{info.name}</span>
            </button>
          ))}
        </div>
        
      </div>

      {/* Content Display */}
      <div className="tab-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <Loading message={`Loading ${contentTypes[activeTab]?.name || activeTab}...`} />
        ) : currentContent ? (
          <div className="content-section">
            {/* Content Header */}
            <div className="content-header">
              <div className="content-title">
                <span className="content-icon">{currentContent.content_info.icon}</span>
                <h2>{currentContent.content_info.name}</h2>
                <span className="content-count">
                  {currentContent.total} {currentContent.total === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="content-actions">
                <button onClick={handleRefresh} className="refresh-button">
                  🔄 Refresh
                </button>
              </div>
            </div>

            <p className="content-description">{currentContent.content_info.description}</p>

            {/* Content Stats */}
            <div className="content-stats">
              <div className="stat">
                <span className="stat-value">{currentContent.sources_available}</span>
                <span className="stat-label">Sources</span>
              </div>
              <div className="stat">
                <span className="stat-value">{currentContent.total}</span>
                <span className="stat-label">Articles</span>
              </div>
              <div className="stat">
                <span className="stat-value">{currentContent.user_tier}</span>
                <span className="stat-label">Tier</span>
              </div>
            </div>

            {/* Featured Sources */}
            {currentContent.featured_sources && currentContent.featured_sources.length > 0 && (
              <div className="featured-sources">
                <h3>Featured Sources</h3>
                <div className="sources-grid">
                  {currentContent.featured_sources.map((source, index) => (
                    <div key={index} className="source-card">
                      <a href={source.website} target="_blank" rel="noopener noreferrer">
                        {source.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles with SEO optimization */}
            {currentContent.articles && currentContent.articles.length > 0 ? (
              <div className="articles-list">
                <h3>Latest Content</h3>
                {currentContent.articles.map((article, index) => (
                  <article key={index} className="article-card" itemScope itemType="https://schema.org/Article">
                    <h4 itemProp="headline">{article.title || 'Untitled'}</h4>
                    <p className="article-source">
                      <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                        <span itemProp="name">{article.source || 'Unknown Source'}</span>
                      </span>
                    </p>
                    {article.summary && (
                      <p className="article-summary" itemProp="description">{article.summary}</p>
                    )}
                    {article.url && (
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="read-more"
                        itemProp="url"
                      >
                        Read More →
                      </a>
                    )}
                    <meta itemProp="datePublished" content={article.published_date || new Date().toISOString()} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-content">
                <div className="no-content-icon">📭</div>
                <h3>No {currentContent.content_info.name.toLowerCase()} available</h3>
                <p>
                  We're working to bring you the latest {currentContent.content_info.name.toLowerCase()}. 
                  Check back soon or try refreshing.
                </p>
                <button onClick={handleRefresh} className="refresh-button">
                  🔄 Check Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="loading-state">
            <p>Select a tab to view content</p>
          </div>
        )}
      </div>
    </div>
  );
}