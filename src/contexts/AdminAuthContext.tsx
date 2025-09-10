import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminApiKey: string | null;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Admin credentials (in production, these should be environment variables)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // Change this to a secure password
  apiKey: process.env.REACT_APP_ADMIN_API_KEY || 'admin-api-key-2024'
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (stored in localStorage)
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      try {
        const { isAuthenticated, apiKey, timestamp } = JSON.parse(savedAuth);
        // Check if authentication is still valid (24 hours)
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (isAuthenticated && isValid && apiKey) {
          setIsAdminAuthenticated(true);
          setAdminApiKey(apiKey);
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
  }, []);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const authData = {
          isAuthenticated: true,
          apiKey: ADMIN_CREDENTIALS.apiKey,
          timestamp: Date.now()
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

  const value = {
    isAdminAuthenticated,
    adminApiKey,
    adminLogin,
    adminLogout,
    isLoading
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