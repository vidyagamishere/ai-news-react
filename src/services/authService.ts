import type { User, LoginCredentials, SignupCredentials, AITopic } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://ai-news-scraper.vercel.app';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const { confirmPassword, ...signupData } = credentials;
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async validateToken(_token: string): Promise<User> {
    return this.request('/api/auth/profile');
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<User> {
    return this.request('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async upgradeSubscription(): Promise<User> {
    return this.request('/api/subscription/upgrade', {
      method: 'POST',
    });
  }

  async getAvailableTopics(): Promise<AITopic[]> {
    return this.request('/api/topics');
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }
}

export const authService = new AuthService();