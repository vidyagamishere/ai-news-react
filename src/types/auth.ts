export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  subscriptionTier: 'free' | 'premium';
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  topics: AITopic[];
  newsletterFrequency: 'daily' | 'weekly';
  emailNotifications: boolean;
  contentTypes: ContentType[];
}

export interface AITopic {
  id: string;
  name: string;
  description: string;
  category: 'technology' | 'research' | 'industry' | 'ethics' | 'tools';
  selected: boolean;
}

export type ContentType = 'articles' | 'podcasts' | 'videos' | 'events' | 'learning';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface SubscriptionTier {
  id: 'free' | 'premium';
  name: string;
  price: number;
  features: string[];
  limitations?: string[];
}