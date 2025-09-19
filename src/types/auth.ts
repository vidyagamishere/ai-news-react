export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  subscriptionTier: 'free' | 'premium';
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
}

export interface UserPreferences {
  topics: AITopic[];
  newsletter_frequency: '12_hours' | 'daily' | 'weekly' | 'monthly';
  email_notifications: boolean;
  breaking_news_alerts?: boolean;
  newsletter_subscribed?: boolean;
  content_types: ContentType[];
  onboardingCompleted?: boolean;
  onboarding_completed?: boolean;
}

export interface AITopic {
  id: string;
  name: string;
  description: string;
  category: 'company' | 'research' | 'news' | 'platform' | 'startup' | 
           'international' | 'robotics' | 'automotive' | 'creative' | 
           'policy' | 'language' | 'gaming' | 'healthcare' | 'finance' |
           'hardware' | 'cloud' | 'events' | 'learning' |
           // Legacy categories for backward compatibility
           'technology' | 'industry' | 'ethics' | 'tools';
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
  acceptTerms: boolean;
}

export interface SubscriptionTier {
  id: 'free' | 'premium';
  name: string;
  price: number;
  features: string[];
  limitations?: string[];
}