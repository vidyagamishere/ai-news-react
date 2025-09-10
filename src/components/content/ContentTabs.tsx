import { useState, useEffect } from 'react';
import { apiService, type TopStory } from '../../services/api';
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
  topStories?: TopStory[];
}

export default function ContentTabs({ userTier, topStories = [] }: ContentTabsProps) {
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
    
    if (title.length < 10) return 'This article provides detailed insights and analysis on the latest developments. Click to read comprehensive coverage of key topics, expert perspectives, and industry implications that will enhance your understanding of the subject matter.';
    
    const summaryTemplates: Record<string, (title: string, source: string) => string> = {
      'all_sources': (title, source) => `This comprehensive article from ${source} explores "${title}" and the latest developments in AI technology. The piece provides detailed analysis and expert insights into emerging trends and their potential impact on the industry. Readers will gain valuable understanding of current innovations and future implications. The content offers practical perspectives that help contextualize recent advancements. Essential reading for staying informed about the rapidly evolving AI landscape.`,
      'blogs': (title, source) => `This expert analysis from ${source} titled "${title}" delves deep into artificial intelligence applications and emerging technological implementations. The article provides comprehensive insights into industry trends and practical applications of AI systems. Readers will discover detailed explanations of complex concepts and their real-world implications. The content offers valuable perspectives from industry professionals and researchers. Perfect for understanding both technical aspects and strategic considerations in AI development.`,
      'podcasts': (title, source) => `This engaging audio discussion from ${source} on "${title}" features expert insights on current AI developments and future predictions. Listeners will hear in-depth conversations about industry perspectives and professional experiences in the field. The podcast explores emerging trends and their potential impact on various sectors. Expert guests share valuable knowledge about challenges and opportunities in AI implementation. Ideal for gaining diverse viewpoints on the evolving artificial intelligence landscape.`,
      'videos': (title, source) => `This informative video content from ${source} about "${title}" provides detailed explanations and visual demonstrations of key AI concepts and applications. Viewers will see comprehensive coverage of technological implementations and practical use cases. The content includes expert commentary and real-world examples that illustrate complex topics. Visual learners will appreciate the clear presentations and step-by-step guidance provided. Essential viewing for understanding both theoretical foundations and practical applications.`,
      'events': (title, source) => `This upcoming event "${title}" hosted by ${source} offers valuable opportunities to connect with the AI community and learn from industry leaders at this significant gathering. Attendees will participate in discussions about cutting-edge developments and network with professionals across the field. The event features presentations from experts and researchers sharing their latest findings. Participants will gain insights into emerging trends and future directions in artificial intelligence. An excellent opportunity for professional development and industry networking.`,
      'learn': (title, source) => `This educational resource from ${source} on "${title}" provides structured learning opportunities designed to advance understanding of AI concepts and practical applications. The content covers essential topics with comprehensive explanations and guided instruction. Learners will develop both theoretical knowledge and practical skills through well-designed curriculum. The resource includes examples and exercises that reinforce key concepts and principles. Perfect for building expertise in artificial intelligence technologies and methodologies.`
    };
    
    const generator = summaryTemplates[contentType] || summaryTemplates['all_sources'];
    return generator(title, source);
  };

  const filterOutTopStories = (articles: any[]): any[] => {
    if (!topStories || topStories.length === 0) return articles;
    
    const topStoryUrls = new Set(topStories.slice(0, 5).map(story => story.url));
    const topStoryTitles = new Set(topStories.slice(0, 5).map(story => story.title.toLowerCase()));
    
    return articles.filter(article => {
      if (topStoryUrls.has(article.url)) return false;
      if (topStoryTitles.has(article.title?.toLowerCase())) return false;
      return true;
    });
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
                {(activeTab === 'all_sources' ? filterOutTopStories(currentContent.articles) : currentContent.articles).map((article, index) => (
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