import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSignIn from './GoogleSignIn';
import './auth.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, signup, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'signin') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
      }
      onClose();
    } catch (err) {
      // Error is handled in AuthContext
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-modal-content">
          <div className="auth-header">
            <h2 className="auth-title">
              {mode === 'signin' ? 'Welcome back' : 'Join AI News Digest'}
            </h2>
            <p className="auth-subtitle">
              {mode === 'signin' 
                ? 'Stay updated with the latest in AI' 
                : 'Get personalized AI news delivered to your inbox'
              }
            </p>
          </div>

          <div className="auth-social">
            <GoogleSignIn onSuccess={onClose} />
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="auth-switch-btn"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {mode === 'signup' && (
            <div className="auth-terms">
              <p>
                By creating an account, you agree to our{' '}
                <a href="/terms" target="_blank">Terms of Service</a>{' '}
                and <a href="/privacy" target="_blank">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;