import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  upgradeSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await authService.validateToken(token);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('authToken', token);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, token } = await authService.signup(credentials);
      localStorage.setItem('authToken', token);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      }));
      throw error;
    }
  };

  const googleLogin = async (idToken: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, token } = await authService.googleLogin(idToken);
      localStorage.setItem('authToken', token);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Google sign in failed'
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!authState.user) throw new Error('User not authenticated');
    
    try {
      const updatedUser = await authService.updateUserPreferences(preferences);
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      throw error;
    }
  };

  const upgradeSubscription = async () => {
    if (!authState.user) throw new Error('User not authenticated');
    
    try {
      const updatedUser = await authService.upgradeSubscription();
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    googleLogin,
    logout,
    updatePreferences,
    upgradeSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};