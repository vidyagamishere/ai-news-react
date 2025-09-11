import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleSignInProps {
  onSuccess: () => void;
}

declare global {
  interface Window {
    google: any;
    googleCallback: (response: any) => void;
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSuccess }) => {
  const { loading, googleLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Don't render Google Sign-In if not configured
  if (!googleClientId) {
    return null;
  }

  useEffect(() => {
    // Load Google Identity Services script with FedCM compliance
    // FedCM (Federated Credential Management) is now mandatory as of Oct 2024
    if (!window.google && googleClientId) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false, // Disable FedCM to avoid CORS issues
            // Traditional popup settings
            context: 'signin',
            ux_mode: 'popup',
            itp_support: false
          });
        }
      };
    }
  }, [googleClientId]);

  const handleGoogleResponse = async (response: any) => {
    try {
      if (response.credential) {
        await googleLogin(response.credential);
        onSuccess();
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      alert('Google Sign In not configured. Please use email/password for now.');
      return;
    }

    try {
      if (window.google && window.google.accounts) {
        console.log('Attempting Google Sign In...');
        window.google.accounts.id.prompt((notification: any) => {
          console.log('Google prompt notification:', notification);
          if (notification.isNotDisplayed()) {
            console.log('Google prompt not displayed - domain may not be authorized');
            alert('Google Sign In is not available on this domain. Please use email/password instead.');
          } else if (notification.isSkippedMoment()) {
            console.log('Google prompt skipped by user');
          }
        });
      } else {
        console.log('Google API not loaded');
        alert('Google Sign In loading... Please try again in a moment or use email/password.');
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      alert('Google Sign In temporarily unavailable. Please use email/password.');
    }
  };

  return (
    <div className="google-signin-container">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="google-signin-btn"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <div className="google-signin-notice" style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
        Having issues? Use email/password instead
      </div>
    </div>
  );
};

export default GoogleSignIn;