import React, { useState, useEffect, useCallback } from 'react';

interface Article {
  id: string;
  title: string;
  description?: string;
  url: string;
  source: string;
  published_date: string;
  significance_score: number;
  reading_time?: number;
  image_url?: string;
  content_type_label?: 'ARTICLE' | 'VIDEO' | 'AUDIO';
  ai_topic_label?: string;
}

interface GroupedContent {
  category: string;
  items: Article[];
  count: number;
}

interface PersonalizedFeedResponse {
  welcome_message: string;
  user_profile: {
    interests_count: number;
    content_types_count: number;
    publishers_count: number;
    time_filter: string;
    user_authenticated: boolean;
  };
  grouped_content: GroupedContent[];
  search_active: boolean;
  search_query?: string;
  total_items: number;
  filters_applied: {
    interests: string[];
    content_types: string[];
    publishers: string[];
    time_filter: string;
    search_query: string;
  };
}

// FilterOptions interface removed - not used in current implementation

const MobileDashboard: React.FC = () => {
  const [feedData, setFeedData] = useState<PersonalizedFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'mobile' | 'tablet' | 'web'>('mobile');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['ARTICLE', 'VIDEO', 'AUDIO']);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState('Last Week');
  
  // Available options
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);

  // Detect screen size and set current screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCurrentScreen('mobile');
      } else if (window.innerWidth < 1024) {
        setCurrentScreen('tablet');
      } else {
        setCurrentScreen('web');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load available options
  const loadAvailableOptions = useCallback(async () => {
    try {
      const interestsRes = await fetch('/api/v1/available-interests');
      
      if (interestsRes.ok) {
        const interestsData = await interestsRes.json();
        setAvailableInterests(interestsData.interests || []);
        // Set default interests
        if (selectedInterests.length === 0 && interestsData.interests?.length > 0) {
          setSelectedInterests(interestsData.interests.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Failed to load available options:', error);
    }
  }, [selectedInterests.length]);

  // Load personalized feed
  const loadPersonalizedFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterRequest = {
        interests: selectedInterests,
        content_types: selectedContentTypes,
        publishers: selectedPublishers,
        time_filter: timeFilter,
        search_query: searchQuery,
        limit: 50
      };

      const response = await fetch('/api/v1/personalized-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PersonalizedFeedResponse = await response.json();
      setFeedData(data);
    } catch (error) {
      console.error('Failed to load personalized feed:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedInterests, selectedContentTypes, selectedPublishers, timeFilter, searchQuery]);

  // Load initial data
  useEffect(() => {
    loadAvailableOptions();
  }, [loadAvailableOptions]);

  useEffect(() => {
    if (selectedInterests.length > 0) {
      loadPersonalizedFeed();
    }
  }, [loadPersonalizedFeed, selectedInterests.length]);

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    loadPersonalizedFeed();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedInterests(availableInterests.slice(0, 3));
    setSelectedContentTypes(['ARTICLE', 'VIDEO', 'AUDIO']);
    setSelectedPublishers([]);
    setTimeFilter('Last Week');
  };

  // Render content type icon
  const renderContentTypeIcon = (type: 'ARTICLE' | 'VIDEO' | 'AUDIO') => {
    switch (type) {
      case 'VIDEO':
        return <span className="text-red-500">📹</span>;
      case 'AUDIO':
        return <span className="text-green-500">🎧</span>;
      default:
        return <span className="text-blue-500">📄</span>;
    }
  };

  // Mobile Screen Component
  const MobileScreen = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Vidyagam</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search AI news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="space-y-4">
            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Last 24 hours">Last 24 hours</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            {/* Content Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Types</label>
              <div className="flex flex-wrap gap-2">
                {['ARTICLE', 'VIDEO', 'AUDIO'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (selectedContentTypes.includes(type)) {
                        setSelectedContentTypes(prev => prev.filter(t => t !== type));
                      } else {
                        setSelectedContentTypes(prev => [...prev, type]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedContentTypes.includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {renderContentTypeIcon(type as 'ARTICLE' | 'VIDEO' | 'AUDIO')} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={loadPersonalizedFeed}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : feedData ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-900 font-medium">{feedData.welcome_message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {feedData.total_items} articles found
              </p>
            </div>

            {/* Grouped Content */}
            {feedData.grouped_content.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 px-2">
                  {group.category} ({group.count})
                </h2>
                <div className="space-y-3">
                  {group.items.map((article, articleIndex) => (
                    <div key={articleIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {renderContentTypeIcon(article.content_type_label as 'ARTICLE' | 'VIDEO' | 'AUDIO')}
                            <span className="text-xs text-gray-500">{article.source}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {article.reading_time}min read
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {article.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(article.published_date).toLocaleDateString()}
                          </span>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-sm hover:underline"
                          >
                            Read more →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Tablet Screen Component
  const TabletScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Tablet Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Vidyagam AI News</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Filters</span>
              </button>
            </div>
            
            {/* Search and Quick Filters */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search AI news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Last Week">Last Week</option>
                <option value="Last 24 hours">Last 24 hours</option>
                <option value="Last Month">Last Month</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tablet Content Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : feedData ? (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {feedData.welcome_message}
                </h2>
                <p className="text-gray-600">
                  Showing {feedData.total_items} articles across {feedData.grouped_content.length} categories
                </p>
              </div>

              {/* Content Grid */}
              {feedData.grouped_content.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {group.category} ({group.count})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {group.items.map((article, articleIndex) => (
                      <div key={articleIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {renderContentTypeIcon(article.content_type_label as 'ARTICLE' | 'VIDEO' | 'AUDIO')}
                              <span className="text-sm text-gray-500">{article.source}</span>
                            </div>
                            <span className="text-sm text-gray-400">
                              {article.reading_time}min
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {article.title}
                          </h4>
                          
                          {article.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                              {article.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {new Date(article.published_date).toLocaleDateString()}
                            </span>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Read →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Web Screen Component  
  const WebScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Web Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Vidyagam AI News Platform</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>
            
            {/* Web Search and Filters Bar */}
            <div className="flex items-center space-x-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search across all AI news sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-6 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>
              </div>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-lg min-w-[150px]"
              >
                <option value="Last Week">Last Week</option>
                <option value="Last 24 hours">Last 24 hours</option>
                <option value="Last Month">Last Month</option>
                <option value="All Time">All Time</option>
              </select>
              
              <button
                onClick={applyFilters}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Web Content Layout */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 bg-white shadow-sm h-screen sticky top-[120px] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Filters</h3>
              
              {/* Content Types */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Content Types</h4>
                <div className="space-y-2">
                  {['ARTICLE', 'VIDEO', 'AUDIO'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedContentTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContentTypes(prev => [...prev, type]);
                          } else {
                            setSelectedContentTypes(prev => prev.filter(t => t !== type));
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="flex items-center space-x-2">
                        {renderContentTypeIcon(type as 'ARTICLE' | 'VIDEO' | 'AUDIO')}
                        <span>{type}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Topics ({selectedInterests.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableInterests.map((interest) => (
                    <label key={interest} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInterests(prev => [...prev, interest]);
                          } else {
                            setSelectedInterests(prev => prev.filter(i => i !== interest));
                          }
                        }}
                        className="mr-2"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              </div>
            ) : feedData ? (
              <div className="space-y-10">
                {/* Stats Bar */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {feedData.welcome_message}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Found {feedData.total_items} articles across {feedData.grouped_content.length} categories
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Filters: {feedData.filters_applied.interests.length} topics, 
                        {feedData.filters_applied.content_types.length} types
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                {feedData.grouped_content.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      {group.category} ({group.count} articles)
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      {group.items.map((article, articleIndex) => (
                        <div key={articleIndex} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {renderContentTypeIcon(article.content_type_label as 'ARTICLE' | 'VIDEO' | 'AUDIO')}
                                <span className="text-sm font-medium text-gray-600">{article.source}</span>
                              </div>
                              <span className="text-sm text-gray-400">
                                {article.reading_time}min read
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg">
                              {article.title}
                            </h4>
                            
                            {article.description && (
                              <p className="text-gray-600 mb-4 line-clamp-3">
                                {article.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {new Date(article.published_date).toLocaleDateString()}
                              </span>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline font-medium"
                              >
                                Read Full Article →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on screen size
  return (
    <>
      {currentScreen === 'mobile' && <MobileScreen />}
      {currentScreen === 'tablet' && <TabletScreen />}
      {currentScreen === 'web' && <WebScreen />}
      
      {/* Debug info - remove in production */}
      <div className="fixed bottom-4 right-4 bg-black text-white px-2 py-1 rounded text-xs">
        {currentScreen} ({window.innerWidth}px)
      </div>
    </>
  );
};

export default MobileDashboard;