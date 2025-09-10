import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Loading from '../Loading';
import SmartImage from '../SmartImage';
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
  topic_summary?: string;
}

interface ContentTypesResponse {
  content_types: Record<string, ContentType>;
}

interface ContentTabsProps {
  userTier: string;
}

export default function ContentTabs({ userTier }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all_sources');
  const [contentTypes, setContentTypes] = useState<Record<string, ContentType>>({});
  const [content, setContent] = useState<Record<string, ContentResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const getTopicSummary = (contentType: string, contentInfo: ContentType): string => {
    const summaries: Record<string, string> = {
      'all_sources': 'Comprehensive coverage of AI developments from trusted industry publications, research institutions, and thought leaders. This curated feed aggregates the most significant breakthroughs, trends, and insights across the entire artificial intelligence landscape.',
      'blogs': 'In-depth analysis and expert perspectives from leading AI practitioners, researchers, and industry veterans. These blog posts offer detailed explanations of complex concepts, practical implementations, and strategic insights into AI adoption.',
      'podcasts': 'Audio conversations with AI pioneers, startup founders, and technology leaders discussing emerging trends, challenges, and opportunities. Perfect for staying informed while commuting or multitasking.',
      'videos': 'Visual learning content including conference talks, technical tutorials, product demos, and expert interviews. Ideal for understanding complex AI concepts through demonstrations and visual explanations.',
      'events': 'Upcoming conferences, workshops, webinars, and networking opportunities in the AI community. Stay connected with the latest gatherings where breakthrough research and industry developments are first announced.',
      'learn': 'Educational resources including courses, tutorials, research papers, and certification programs. Structured learning paths for advancing your AI knowledge from beginner to expert level.'
    };
    
    return summaries[contentType] || contentInfo.description || 'Discover the latest content in this category.';
  };

  const generateArticleSummary = (article: any, contentType: string): string => {
    const title = article.title || '';
    const source = article.source || '';
    
    if (title.length < 10) return 'Click to read the full article for detailed insights.';
    
    const summaryTemplates: Record<string, (title: string, source: string) => string> = {
      'all_sources': (t, _s) => `Latest development from ${_s}: ${t.length > 100 ? t.substring(0, 100) + '...' : t}`,
      'blogs': (t, _s) => `Expert analysis from ${_s}: This article explores ${t.toLowerCase().includes('ai') || t.toLowerCase().includes('machine') ? 'artificial intelligence applications and implications' : 'emerging technology trends and practical implementations'}.`,
      'podcasts': (t, _s) => `Audio discussion from ${_s}: Listen to expert insights on ${t.toLowerCase().includes('interview') ? 'industry perspectives and experiences' : 'current developments and future predictions'}.`,
      'videos': (t, _s) => `Video content from ${_s}: Watch detailed explanations and demonstrations ${t.toLowerCase().includes('tutorial') ? 'with step-by-step guidance' : 'covering key concepts and applications'}.`,
      'events': (t, _s) => `Upcoming event: ${t} - Connect with the AI community and learn from industry leaders at this ${t.toLowerCase().includes('conference') ? 'major conference' : 'networking opportunity'}.`,
      'learn': (t, _s) => `Educational resource from ${_s}: ${t.toLowerCase().includes('course') ? 'Structured learning program' : 'Knowledge resource'} designed to advance your understanding of AI concepts and applications.`
    };
    
    const generator = summaryTemplates[contentType] || summaryTemplates['all_sources'];
    return generator(title, source);
  };

  // Define tab order and tier access
  const tabOrder = ['all_sources', 'blogs', 'podcasts', 'videos', 'events', 'learn'];
  const premiumTabs: string[] = []; // All tabs are now available to all users
  
  const isTabAccessible = (tabKey: string): boolean => {
    if (!premiumTabs.includes(tabKey)) return true;
    return userTier === 'premium';
  };

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
      const response: ContentTypesResponse = await apiService.get('/api/content-types');
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

      const response: ContentResponse = await apiService.get(`/api/content/${contentType}`);
      
      // Sort articles by date (latest first)
      if (response.articles && response.articles.length > 0) {
        response.articles.sort((a, b) => {
          const dateA = new Date(a.published_date || a.date || 0).getTime();
          const dateB = new Date(b.published_date || b.date || 0).getTime();
          return dateB - dateA;
        });
      }
      
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
    .map(key => [key, contentTypes?.[key]] as [string, ContentType | undefined])
    .filter(([, info]) => info && info.name); // Only include defined content types with required properties

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
              className={`tab-button ${activeTab === key ? 'active' : ''} ${!isTabAccessible(key) ? 'premium-locked' : ''}`}
              onClick={() => isTabAccessible(key) ? handleTabClick(key) : null}
              disabled={!isTabAccessible(key)}
              title={!isTabAccessible(key) ? 'Upgrade to Premium to access this content' : ''}
            >
              <span className="tab-icon">{info?.icon || '📄'}</span>
              <span className="tab-name">{info?.name || key}</span>
              {!isTabAccessible(key) && <span className="premium-lock">🔒</span>}
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
          <>
            {/* Content Header */}
            <div className="content-header">
              <div className="content-title">
                <span className="content-icon">{currentContent.content_info?.icon || '📄'}</span>
                <h2>{currentContent.content_info?.name || 'Content'}</h2>
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

            <div className="topic-summary">
              <p className="content-description">{getTopicSummary(activeTab, currentContent.content_info)}</p>
            </div>

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
                    
                    {(article.imageUrl || article.thumbnail_url) && (
                      <SmartImage
                        src={article.imageUrl || article.thumbnail_url}
                        alt={article.title || 'Article image'}
                        className="article-image-smart"
                        fallbackType="placeholder"
                        aspectRatio="16/9"
                        maxWidth="350px"
                        lazy={true}
                      />
                    )}
                    
                    <div className="article-summary" itemProp="description">
                      {article.ai_summary || article.summary || generateArticleSummary(article, activeTab)}
                    </div>
                    
                    <p className="article-source">
                      <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                        <span itemProp="name">{article.source || 'Unknown Source'}</span>
                      </span>
                      {article.published_date && (
                        <span className="article-date">
                          • {new Date(article.published_date).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    
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
                <h3>No {currentContent.content_info?.name?.toLowerCase() || 'content'} available</h3>
                <p>
                  We're working to bring you the latest {currentContent.content_info?.name?.toLowerCase() || 'content'}. 
                  Check back soon or try refreshing.
                </p>
                <button onClick={handleRefresh} className="refresh-button">
                  🔄 Check Again
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="loading-state">
            <p>Select a tab to view content</p>
          </div>
        )}
      </div>
    </div>
  );
}