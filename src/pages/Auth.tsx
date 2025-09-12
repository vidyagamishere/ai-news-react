import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
    confirmPassword: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { login, signup, loading, error, isAuthenticated, sendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard
      console.log('User authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
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
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'You must accept the Terms of Service';
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
        try {
          await signup(formData);
          // If signup succeeds, user is logged in and goes to onboarding
          navigate('/onboarding');
        } catch (signupError: any) {
          if (signupError.message === 'OTP_VERIFICATION_REQUIRED') {
            // Backend requires OTP verification
            await sendOTP(formData.email, formData.name);
            navigate('/verify-otp?email=' + encodeURIComponent(formData.email) + '&userData=' + encodeURIComponent(JSON.stringify(formData)));
          } else {
            throw signupError;
          }
        }
      }
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Authentication error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoogleSuccess = () => {
    // Let Dashboard component handle routing based on user state
    navigate('/dashboard');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    });
    setFormErrors({});
  };

  const isSignIn = mode === 'signin';

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-left-panel">
          <div className="auth-branding">
            <div className="brand-content">
              <div className="brand-logo">
                <div className="neural-icon">🧠</div>
                <h1>Vidyagam</h1>
              </div>
              <h2>Intelligence at Light Speed</h2>
              <p>Join 50,000+ AI researchers, engineers, and visionaries accessing breakthrough intelligence curated by advanced neural networks.</p>
              
              <div className="brand-features">
                <div className="brand-feature">
                  <div className="feature-icon">🚀</div>
                  <div>
                    <strong>Quantum-Speed Intelligence</strong>
                    <span>Real-time AI developments before they break mainstream</span>
                  </div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">🔬</div>
                  <div>
                    <strong>Research-Grade Insights</strong>
                    <span>Direct pipeline from labs to your dashboard</span>
                  </div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">🎯</div>
                  <div>
                    <strong>Neural Personalization</strong>
                    <span>AI that learns your technical interests</span>
                  </div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">🏛️</div>
                  <div>
                    <strong>Elite Network Access</strong>
                    <span>Trusted by DeepMind, OpenAI, and top AI labs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-form-container">
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

            {!isSignIn && (
              <div className="form-group">
                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      required={!isSignIn}
                    />
                    <span className="checkbox-checkmark"></span>
                    I accept the <Link to="/terms" target="_blank">Terms of Service</Link> and{' '}
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
    </div>
  );
};

export default Auth;