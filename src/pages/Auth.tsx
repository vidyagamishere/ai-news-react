import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import '../components/auth/auth.css';
import './auth.css';

type AuthMode = 'signin' | 'signup';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { login, signup, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Don't redirect here - let the form submission handle it
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (mode === 'signup' && !formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      if (mode === 'signin') {
        await login({ email: formData.email, password: formData.password });
        // Existing users go directly to dashboard
        navigate('/dashboard');
      } else {
        await signup(formData);
        // New users go to onboarding to collect preferences
        navigate('/onboarding');
      }
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Authentication error:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoogleSuccess = () => {
    // Google users should go to onboarding to complete profile
    navigate('/onboarding');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
  };

  const isSignIn = mode === 'signin';

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <div className="auth-brand">
            <h1>AI News Digest</h1>
            <p>{isSignIn ? 'Sign in to your account' : 'Create your account'}</p>
          </div>
        </div>

        <div className="auth-card">
          {/* Mode Toggle */}
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${isSignIn ? 'active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isSignIn ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-card-header">
            <h2>{isSignIn ? 'Welcome back' : 'Join AI News Digest'}</h2>
            <p>
              {isSignIn 
                ? 'Stay updated with the latest in AI' 
                : 'Get personalized AI news delivered to your inbox'
              }
            </p>
          </div>

          <div className="auth-social">
            <GoogleSignIn onSuccess={handleGoogleSuccess} />
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isSignIn && (
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
                    required={!isSignIn}
                  />
                </div>
                {formErrors.name && (
                  <div className="field-error">{formErrors.name}</div>
                )}
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
              {formErrors.email && (
                <div className="field-error">{formErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignIn ? 'Enter your password' : 'Enter your password (min 8 characters)'}
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
              {formErrors.password && (
                <div className="field-error">{formErrors.password}</div>
              )}
            </div>

            {!isSignIn && (
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
                    required={!isSignIn}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <div className="field-error">{formErrors.confirmPassword}</div>
                )}
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
              {loading 
                ? (isSignIn ? 'Signing in...' : 'Creating account...') 
                : (isSignIn ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          <div className="auth-footer">
            {isSignIn ? (
              <>
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => switchMode('signup')} 
                    className="auth-link-btn"
                  >
                    Create one here
                  </button>
                </p>
                
                <div className="auth-links">
                  <Link to="/forgot-password">Forgot your password?</Link>
                </div>
              </>
            ) : (
              <>
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => switchMode('signin')} 
                    className="auth-link-btn"
                  >
                    Sign in here
                  </button>
                </p>
                
                <div className="auth-terms">
                  <p>
                    By creating an account, you agree to our{' '}
                    <Link to="/terms">Terms of Service</Link>{' '}
                    and <Link to="/privacy">Privacy Policy</Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;