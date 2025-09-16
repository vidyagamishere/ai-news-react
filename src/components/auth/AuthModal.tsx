import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';
import './AuthModal.css';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  const { login, signup, loading, error, isAuthenticated, sendOTP } = useAuth();
  const navigate = useNavigate();

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Close modal when authenticated and route appropriately
  useEffect(() => {
    if (isAuthenticated) {
      handleClose();
      // Check if user has completed onboarding
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      if (onboardingComplete === 'true') {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (mode === 'signup' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'Please accept the terms';
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
      } else {
        try {
          await signup(formData);
          // Clear onboarding completion to trigger onboarding for new email signups
          localStorage.removeItem('onboardingComplete');
          // Don't navigate here - let the useEffect handle it
        } catch (signupError: any) {
          if (signupError.message === 'OTP_VERIFICATION_REQUIRED') {
            await sendOTP(formData.email, formData.name);
            navigate('/verify-otp?email=' + encodeURIComponent(formData.email) + '&userData=' + encodeURIComponent(JSON.stringify(formData)));
          } else {
            throw signupError;
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    });
    setFormErrors({});
    onSwitchMode(newMode);
  };

  const handleGoogleSuccess = () => {
    console.log('Google authentication successful');
    // For Google sign-in, we'll let the auth context handle onboarding routing
    // New users will be routed to onboarding, returning users to dashboard
    handleClose();
  };

  const isSignIn = mode === 'signin';

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div 
        className={`auth-modal ${isVisible ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <h2>{isSignIn ? 'Welcome back' : 'Join Vidyagam'}</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-modal-content">
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

          <p className="auth-subtitle">
            {isSignIn 
              ? 'Continue your AI intelligence journey' 
              : 'Get personalized AI news and insights'
            }
          </p>

          {/* Google Sign In - Primary Option */}
          <div className="auth-social-primary">
            <GoogleSignIn onSuccess={handleGoogleSuccess} />
            <p className="social-benefit">Instant access • No email verification required</p>
          </div>

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {!isSignIn && (
              <div className="form-group">
                <label htmlFor="modal-name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="modal-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {formErrors.name && (
                  <div className="field-error">{formErrors.name}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="modal-email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="modal-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              {formErrors.email && (
                <div className="field-error">{formErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="modal-password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignIn ? 'Enter your password' : 'Min 6 characters'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
                <label htmlFor="modal-confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="modal-confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <div className="field-error">{formErrors.confirmPassword}</div>
                )}
              </div>
            )}

            {!isSignIn && (
              <div className="form-group">
                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    />
                    <span className="checkbox-checkmark"></span>
                    I accept the <Link to="/terms" target="_blank">Terms</Link> and{' '}
                    <Link to="/privacy" target="_blank">Privacy Policy</Link>
                  </label>
                </div>
                {formErrors.acceptTerms && (
                  <div className="field-error">{formErrors.acceptTerms}</div>
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
              <p>
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => switchMode('signup')} 
                  className="auth-link-btn"
                >
                  Sign up here
                </button>
              </p>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;