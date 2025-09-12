// API service for connecting to AI News Scraper backend with admin validation
import axios from 'axios';

// Backend API URL - Stable domain that won't change between deployments
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://ai-news-scraper.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased to 15 seconds for content scraping
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for content requests with longer timeout
const contentApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 seconds for heavy content scraping operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DAILY_CACHE_KEY = 'daily_cache_timestamp';

// Check if we need to clear daily cache
const shouldClearDailyCache = (): boolean => {
  const lastClear = localStorage.getItem(DAILY_CACHE_KEY);
  if (!lastClear) return true;
  
  const timeSinceLastClear = Date.now() - parseInt(lastClear);
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return timeSinceLastClear > oneDayMs;
};

// Clear daily cache and mark timestamp
const clearDailyCache = (): void => {
  console.log('🗂️ Clearing daily cache - archiving old content');
  cache.clear();
  localStorage.setItem(DAILY_CACHE_KEY, Date.now().toString());
};

const getCacheKey = (endpoint: string, params?: any) => {
  return `${endpoint}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
};

// Types for API responses
export interface Article {
  title: string;
  description: string;
  content_summary?: string; // LLM-generated summary
  source: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  type: 'blog' | 'audio' | 'video';
  url: string;
  readTime: string;
  significanceScore: number;
  rankingScore?: number;
  priority?: number;
  thumbnail_url?: string;
  imageUrl?: string;
  audio_url?: string;
  duration?: number;
}

export interface Metrics {
  totalUpdates: number;
  highImpact: number;
  newResearch: number;
  industryMoves: number;
}

export interface TopStory {
  title: string;
  source: string;
  significanceScore: number;
  url: string;
  imageUrl?: string;
  summary?: string;
  content_summary?: string; // LLM-generated summary
}

export interface DigestResponse {
  summary: {
    keyPoints: string[];
    metrics: Metrics;
  };
  topStories: TopStory[];
  content: {
    blog: Article[];
    audio: Article[];
    video: Article[];
  };
  timestamp: string;
  badge: string;
  enhanced?: boolean;
  admin_features?: boolean;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  components: {
    database: boolean;
    scraper: boolean;
    processor: boolean;
    ai_sources: number;
  };
  auto_update?: {
    in_progress: boolean;
    last_run: string;
    errors: string[];
    auto_update_enabled: boolean;
  };
}

export interface Source {
  name: string;
  rss_url: string;
  website: string;
  enabled: boolean;
  priority: number;
  category: string;
  content_type?: string;
}

export interface SourcesResponse {
  sources: Source[];
  enabled_count: number;
  total_count: number;
}

export interface ScrapeResponse {
  message: string;
  articles_found: number;
  articles_processed: number;
  sources: string[];
  total_sources: number;
}

// API functions
export const apiService = {
  // Get current digest
  getDigest: async (refresh?: boolean): Promise<DigestResponse> => {
    // Check if we need to clear daily cache first
    if (shouldClearDailyCache()) {
      clearDailyCache();
    }
    
    const params = refresh ? { refresh: 1 } : {};
    const cacheKey = getCacheKey('/api/digest', params);
    
    // Skip cache if refresh is explicitly requested
    if (!refresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('🚀 Using cached digest data');
        return cached;
      }
    }
    
    console.log('📡 Fetching fresh digest data...');
    const response = await api.get('/api/digest', { params });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  // Get health status
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Get sources configuration
  getSources: async (): Promise<SourcesResponse> => {
    const response = await api.get('/api/sources');
    return response.data;
  },

  // Trigger manual scraping
  triggerScrape: async (priorityOnly = false): Promise<ScrapeResponse> => {
    const params = priorityOnly ? { priority_only: true } : {};
    const response = await api.get('/api/scrape', { params });
    return response.data;
  },

  // Trigger auto-update
  triggerAutoUpdate: async (): Promise<{ message: string; status: any }> => {
    const response = await api.post('/api/auto-update/trigger');
    return response.data;
  },

  // Get auto-update status
  getAutoUpdateStatus: async (): Promise<any> => {
    const response = await api.get('/api/auto-update/status');
    return response.data;
  },

  // Content filtering methods
  getContentTypes: async (): Promise<any> => {
    const response = await api.get('/api/content-types');
    return response.data;
  },

  getContentByType: async (contentType: string, refresh?: boolean): Promise<any> => {
    const params = refresh ? { refresh: true } : {};
    const response = await api.get(`/api/content/${contentType}`, { params });
    return response.data;
  },

  getUserPreferences: async (): Promise<any> => {
    const response = await api.get('/api/user-preferences');
    return response.data;
  },

  // Generic GET method for new endpoints with caching
  get: async (endpoint: string, params?: any): Promise<any> => {
    // Check if we need to clear daily cache for content endpoints
    if (endpoint.includes('/api/content/') && shouldClearDailyCache()) {
      clearDailyCache();
    }
    
    const cacheKey = getCacheKey(endpoint, params);
    
    // Check cache first for GET requests
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`🚀 Using cached data for ${endpoint}`);
      return cached;
    }
    
    console.log(`📡 Fetching fresh data for ${endpoint}...`);
    
    // Use contentApi for content endpoints that require longer timeout
    const apiInstance = endpoint.includes('/api/content/') ? contentApi : api;
    
    try {
      const response = await apiInstance.get(endpoint, { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error(`⏱️ Request timeout for ${endpoint}. This usually happens with all_sources content.`);
        throw new Error(`Content loading timed out. The server is processing ${endpoint.includes('all_sources') ? 'all sources' : 'content'} which may take longer than usual.`);
      }
      throw error;
    }
  },

  // Admin validation endpoints
  validateSources: async (adminKey: string, options?: {
    contentType?: string;
    priority?: number;
    timeout?: number;
    maxConcurrent?: number;
  }): Promise<any> => {
    const response = await api.post('/api/admin/validate-sources', options || {}, {
      headers: { 'X-Admin-Key': adminKey }
    });
    return response.data;
  },

  validateSingleSource: async (adminKey: string, sourceData: {
    name: string;
    rss_url: string;
    website?: string;
    content_type?: string;
  }): Promise<any> => {
    const response = await api.post('/api/admin/validate-single-source', sourceData, {
      headers: { 'X-Admin-Key': adminKey }
    });
    return response.data;
  },

  quickTest: async (adminKey: string): Promise<any> => {
    const response = await api.get('/api/admin/quick-test', {
      headers: { 'X-Admin-Key': adminKey }
    });
    return response.data;
  },

  getValidationStatus: async (adminKey: string): Promise<any> => {
    const response = await api.get('/api/admin/validation-status', {
      headers: { 'X-Admin-Key': adminKey }
    });
    return response.data;
  },
};

export default apiService;