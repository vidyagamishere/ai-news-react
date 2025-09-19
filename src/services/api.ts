// UPDATED API service - Complete Router Architecture Integration
// All API calls now go through single router backend function
import axios from 'axios';

// Router-based backend URL - Single function handles ALL endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://ai-news-scraper-production.up.railway.app';

console.log('🏗️ API Service: Using Router Architecture');
console.log('🔗 Backend URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for Google auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for content requests with longer timeout
const contentApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for router processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Router request function - ALL API calls go through this
async function makeRouterRequest(
  endpoint: string, 
  method: string = 'GET', 
  params: any = {}, 
  headers: any = {},
  useContentApi: boolean = false
) {
  try {
    const apiInstance = useContentApi ? contentApi : api;
    
    console.log(`📡 Router Request: ${method} ${endpoint}`);
    
    // For GET requests, use query parameters
    if (method === 'GET') {
      const queryParams = new URLSearchParams({
        endpoint,
        ...params
      }).toString();
      
      const response = await apiInstance.get(`/api/index?${queryParams}`, { 
        headers: {
          ...headers,
          // Ensure proper CORS headers
          'Access-Control-Allow-Origin': '*',
        }
      });
      
      console.log(`✅ Router Response: ${endpoint} - ${response.status}`);
      return response.data;
    } 
    // For POST requests, use JSON body
    else {
      const requestBody = {
        endpoint,
        method,
        params,
        headers
      };
      
      const response = await apiInstance.post('/api/index', requestBody, { 
        headers: {
          ...headers,
          'Access-Control-Allow-Origin': '*',
        }
      });
      
      console.log(`✅ Router Response: ${endpoint} - ${response.status}`);
      return response.data;
    }
  } catch (error: any) {
    console.error(`❌ Router request failed for ${endpoint}:`, error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    
    // Handle router errors
    if (error.response?.status === 404) {
      throw new Error(`Endpoint ${endpoint} not found in router`);
    }
    
    // Return detailed error info
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Router request failed: ${errorMessage}`);
  }
}

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

// Types for API responses (same as before)
export interface Article {
  title: string;
  description: string;
  content_summary?: string;
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
  content_summary?: string;
}

export interface DigestResponse {
  summary: {
    keyPoints: string[];
    metrics: Metrics;
    personalized_greeting?: string;
    user_focus_topics?: string[];
    personalization_note?: string;
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
  personalized?: boolean;
  personalization_meta?: {
    user_topics: string[];
    content_types_requested: string[];
    filtering_applied: boolean;
    timestamp: string;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  components: {
    database: boolean;
    scraper: boolean;
    processor: boolean;
    ai_sources: number;
    authentication?: boolean;
  };
  auto_update?: {
    in_progress: boolean;
    last_run: string;
    errors: string[];
    auto_update_enabled: boolean;
  };
  router_info?: {
    architecture: string;
    scalable: boolean;
    function_limit_solved: boolean;
    auth_integrated?: boolean;
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
  router_architecture?: string;
}

export interface ScrapeResponse {
  message: string;
  articles_found: number;
  articles_processed: number;
  sources: string[];
  total_sources: number;
  router_handled?: boolean;
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
  };
  expires_in: number;
  router_auth?: boolean;
}

export interface AuthVerifyResponse {
  valid: boolean;
  user?: any;
  expires?: number;
  router_verified?: boolean;
  error?: string;
}

// Complete API service using router pattern
export const apiService = {
  // ===============================
  // CORE CONTENT ENDPOINTS
  // ===============================

  // Get current digest
  getDigest: async (refresh?: boolean): Promise<DigestResponse> => {
    if (shouldClearDailyCache()) {
      clearDailyCache();
    }
    
    const params = refresh ? { refresh: '1' } : {};
    const cacheKey = getCacheKey('digest', params);
    
    if (!refresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('🚀 Using cached digest data');
        return cached;
      }
    }
    
    console.log('📡 Fetching digest via router...');
    const data = await makeRouterRequest('digest', 'GET', params, {}, true);
    setCachedData(cacheKey, data);
    return data;
  },

  // Get health status
  getHealth: async (): Promise<HealthResponse> => {
    return await makeRouterRequest('health', 'GET');
  },

  // Get sources configuration
  getSources: async (): Promise<SourcesResponse> => {
    return await makeRouterRequest('sources', 'GET');
  },

  // Get personalized digest - requires authentication
  getPersonalizedDigest: async (refresh?: boolean): Promise<DigestResponse> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required for personalized content');
    }
    
    if (shouldClearDailyCache()) {
      clearDailyCache();
    }
    
    const params = refresh ? { refresh: '1' } : {};
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    const cacheKey = getCacheKey('personalized-digest', params);
    
    if (!refresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('🚀 Using cached personalized digest data');
        return cached;
      }
    }
    
    console.log('📡 Fetching personalized digest via router...');
    const data = await makeRouterRequest('personalized-digest', 'GET', params, headers, true);
    setCachedData(cacheKey, data);
    return data;
  },

  // ===============================
  // SCRAPING & AUTO-UPDATE
  // ===============================

  // Trigger manual scraping
  triggerScrape: async (priorityOnly = false): Promise<ScrapeResponse> => {
    const params = priorityOnly ? { priority_only: 'true' } : {};
    return await makeRouterRequest('scrape', 'GET', params);
  },

  // Trigger auto-update
  triggerAutoUpdate: async (): Promise<{ message: string; status: any }> => {
    return await makeRouterRequest('auto-update', 'POST', { action: 'trigger' });
  },

  // Get auto-update status
  getAutoUpdateStatus: async (): Promise<any> => {
    return await makeRouterRequest('auto-update', 'GET');
  },

  // ===============================
  // CONTENT FILTERING & TYPES
  // ===============================

  // Get available content types
  getContentTypes: async (): Promise<any> => {
    return await makeRouterRequest('content-types', 'GET');
  },

  // Get content by type (generic endpoint)
  getContentByType: async (contentType: string, refresh?: boolean): Promise<any> => {
    const params = refresh ? { refresh: 'true', content_type: contentType } : { content_type: contentType };
    return await makeRouterRequest('digest', 'GET', params, {}, true);
  },

  // Get user preferences - requires authentication
  getUserPreferences: async (): Promise<any> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required for user preferences');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return await makeRouterRequest('user-preferences', 'GET', {}, headers);
  },

  // ===============================
  // AUTHENTICATION ENDPOINTS
  // ===============================

  // Google OAuth authentication
  authenticateWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    console.log('🔐 Authenticating with Google via router...');
    
    const requestBody = {
      endpoint: 'auth/google',
      method: 'POST',
      params: {},
      headers: {},
      id_token: idToken
    };
    
    const response = await api.post('/api/index', requestBody);
    return response.data;
  },

  // Verify authentication token
  verifyAuth: async (): Promise<AuthVerifyResponse> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { valid: false, error: 'no_token' };
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    try {
      return await makeRouterRequest('auth/verify', 'GET', {}, headers);
    } catch (error) {
      console.log('🔐 Auth verification failed:', error);
      return { valid: false, error: 'invalid_token' };
    }
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    try {
      const result = await makeRouterRequest('auth/logout', 'POST', {}, headers);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return result;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Get available AI topics for authentication
  getAuthTopics: async (): Promise<any> => {
    return await makeRouterRequest('auth/topics', 'GET');
  },

  // ===============================
  // ADMIN ENDPOINTS
  // ===============================

  // Validate sources (admin only)
  validateSources: async (adminKey: string, options?: {
    contentType?: string;
    priority?: number;
    timeout?: number;
    maxConcurrent?: number;
  }): Promise<any> => {
    const headers = { 'X-Admin-Key': adminKey };
    const params = options || {};
    return await makeRouterRequest('admin/validate-sources', 'POST', params, headers);
  },

  // Validate single source (admin only)
  validateSingleSource: async (adminKey: string, sourceData: {
    name: string;
    rss_url: string;
    website?: string;
    content_type?: string;
  }): Promise<any> => {
    const headers = { 'X-Admin-Key': adminKey };
    return await makeRouterRequest('admin/validate-single-source', 'POST', sourceData, headers);
  },

  // Admin quick test
  quickTest: async (adminKey: string): Promise<any> => {
    const headers = { 'X-Admin-Key': adminKey };
    return await makeRouterRequest('admin/quick-test', 'GET', {}, headers);
  },

  // Get validation status (admin only)
  getValidationStatus: async (adminKey: string): Promise<any> => {
    const headers = { 'X-Admin-Key': adminKey };
    return await makeRouterRequest('admin/validation-status', 'GET', {}, headers);
  },

  // ===============================
  // TESTING & DEBUG
  // ===============================

  // Test Neon database
  testNeon: async (): Promise<any> => {
    return await makeRouterRequest('test-neon', 'GET');
  },

  // Generic router method for future endpoints
  callEndpoint: async (
    endpoint: string, 
    method: string = 'GET', 
    params: any = {}, 
    requireAuth: boolean = false,
    adminKey?: string
  ) => {
    let headers: any = {};
    
    if (requireAuth) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error(`Authentication required for ${endpoint}`);
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (adminKey) {
      headers['X-Admin-Key'] = adminKey;
    }
    
    return await makeRouterRequest(endpoint, method, params, headers);
  },

  // Generic GET method with router (backward compatibility)
  get: async (endpoint: string, params?: any): Promise<any> => {
    // Convert old-style endpoints to router format
    const routerEndpoint = endpoint.replace('/api/', '');
    return await makeRouterRequest(routerEndpoint, 'GET', params);
  }
};

console.log('✅ API Service initialized with complete router architecture');
console.log('🔗 All endpoints now route through single backend function');
console.log('🔐 Authentication, admin, and content endpoints integrated');

export default apiService;