import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminApiKey: string | null;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
  isCurrentUserAdmin: boolean;
  checkAdminAccess: () => boolean;
  handleMainAuthLogin: (email: string, password: string) => Promise<boolean>;
  createAdminUserSession: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Admin credentials (in production, these should be environment variables)
const ADMIN_CREDENTIALS = {
  username: 'admin@vidyagam.com',
  password: 'admin123', // Change this to a secure password
  apiKey: process.env.REACT_APP_ADMIN_API_KEY || 'admin-api-key-2024'
};

// Admin emails that have admin access
const ADMIN_EMAILS = [
  'admin@vidyagam.com',
  'vidyagam@gmail.com' // Add additional admin emails here if needed
];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Check if current user is an admin
  const checkAdminAccess = (): boolean => {
    return !!(isAuthenticated && user && ADMIN_EMAILS.includes(user.email));
  };

  const isCurrentUserAdmin = checkAdminAccess() || false;

  useEffect(() => {
    // Auto-grant admin access if user is logged in with admin email
    if (isCurrentUserAdmin) {
      setIsAdminAuthenticated(true);
      setAdminApiKey(ADMIN_CREDENTIALS.apiKey);
      localStorage.setItem('adminAuth', JSON.stringify({
        isAuthenticated: true,
        apiKey: ADMIN_CREDENTIALS.apiKey,
        timestamp: Date.now(),
        viaMainAuth: true
      }));
      setIsLoading(false);
      return;
    }

    // Check if admin is already logged in (stored in localStorage)
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      try {
        const { isAuthenticated, apiKey, timestamp, viaMainAuth } = JSON.parse(savedAuth);
        // Check if authentication is still valid (24 hours)
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (isAuthenticated && isValid && apiKey) {
          // If it was via main auth, verify user is still admin
          if (viaMainAuth && !isCurrentUserAdmin) {
            localStorage.removeItem('adminAuth');
            setIsAdminAuthenticated(false);
            setAdminApiKey(null);
          } else {
            setIsAdminAuthenticated(true);
            setAdminApiKey(apiKey);
          }
        } else {
          // Clear expired auth
          localStorage.removeItem('adminAuth');
        }
      } catch (error) {
        console.error('Error parsing admin auth:', error);
        localStorage.removeItem('adminAuth');
      }
    }
    setIsLoading(false);
  }, [isCurrentUserAdmin, user, isAuthenticated]);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials (support both email and old username format)
      if ((username === ADMIN_CREDENTIALS.username || username === 'admin') && 
          password === ADMIN_CREDENTIALS.password) {
        const authData = {
          isAuthenticated: true,
          apiKey: ADMIN_CREDENTIALS.apiKey,
          timestamp: Date.now(),
          viaDirectLogin: true
        };
        
        // Save to localStorage
        localStorage.setItem('adminAuth', JSON.stringify(authData));
        
        setIsAdminAuthenticated(true);
        setAdminApiKey(ADMIN_CREDENTIALS.apiKey);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
    setAdminApiKey(null);
  };

  const handleMainAuthLogin = async (email: string, password: string): Promise<boolean> => {
    // Check if this is an admin login attempt
    if (email === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create a mock admin user session in the main auth context
      createAdminUserSession();
      return true;
    }
    return false;
  };

  const createAdminUserSession = () => {
    // Create a mock admin user for the main auth context
    const adminUser = {
      id: 'admin-user',
      email: 'admin@vidyagam.com',
      name: 'Admin User',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      preferences: {
        onboardingCompleted: true,
        topics: []
      },
      subscriptionTier: 'premium' as const
    };

    // Store in localStorage to simulate auth
    localStorage.setItem('authToken', 'admin-mock-token');
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    
    // Grant admin access
    setIsAdminAuthenticated(true);
    setAdminApiKey(ADMIN_CREDENTIALS.apiKey);
    
    // Trigger page reload to let the main auth context pick up the admin session
    window.location.reload();
  };

  const value = {
    isAdminAuthenticated,
    adminApiKey,
    adminLogin,
    adminLogout,
    isLoading,
    isCurrentUserAdmin,
    checkAdminAccess,
    handleMainAuthLogin,
    createAdminUserSession
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;