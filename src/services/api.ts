// API service for connecting to AI News Scraper backend with admin validation
import axios from 'axios';

// Backend API URL - Stable domain that won't change between deployments
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://ai-news-scraper.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const params = refresh ? { refresh: 1 } : {};
    const response = await api.get('/api/digest', { params });
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

  // Generic GET method for new endpoints
  get: async (endpoint: string, params?: any): Promise<any> => {
    const response = await api.get(endpoint, { params });
    return response.data;
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