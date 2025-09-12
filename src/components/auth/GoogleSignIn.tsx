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
    // Load Google Identity Services script
    if (!window.google && googleClientId) {
      console.log('Loading Google Sign-In script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Google Sign-In script loaded');
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: false, // Disable FedCM to avoid CORS issues
              context: 'signin',
              ux_mode: 'popup',
              itp_support: false,
              // Add COOP-compliant settings
              state_cookie_domain: window.location.hostname,
              cookie_policy: 'single_host_origin'
            });
            console.log('Google Sign-In initialized successfully');
          } catch (error) {
            console.error('Google Sign-In initialization error:', error);
          }
        } else {
          console.error('Google Sign-In API not available after script load');
        }
      };

      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
      };
    } else if (window.google?.accounts?.id && googleClientId) {
      console.log('Google Sign-In already loaded, initializing...');
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: false,
          // Add COOP-compliant settings
          state_cookie_domain: window.location.hostname,
          cookie_policy: 'single_host_origin'
        });
        console.log('Google Sign-In initialized successfully (existing script)');
      } catch (error) {
        console.error('Google Sign-In initialization error (existing script):', error);
      }
    }
  }, [googleClientId]);

  const handleGoogleResponse = async (response: any) => {
    try {
      console.log('Google response received:', { 
        hasCredential: !!response.credential,
        credentialLength: response.credential?.length 
      });
      
      if (response.credential) {
        console.log('Attempting to authenticate with Google credential...');
        await googleLogin(response.credential);
        console.log('Google authentication successful');
        onSuccess();
      } else {
        console.error('No credential in Google response');
        alert('Google Sign In failed - no credentials received');
      }
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      
      // Show user-friendly error messages
      if (error.message?.includes('not configured')) {
        alert('Google Sign In is not configured on this server. Please use email/password authentication.');
      } else if (error.message?.includes('Invalid Google client')) {
        alert('Google Sign In configuration error. Please contact support.');
      } else if (error.message?.includes('Email not verified')) {
        alert('Please verify your email with Google first, then try again.');
      } else {
        alert(`Google Sign In failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      alert('Google Sign In not configured. Please use email/password for now.');
      return;
    }

    try {
      console.log('Google sign-in button clicked');
      console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
      console.log('Google API status:', {
        googleExists: !!window.google,
        accountsExists: !!window.google?.accounts,
        idExists: !!window.google?.accounts?.id
      });

      if (window.google?.accounts?.id) {
        console.log('Attempting Google Sign In...');
        
        // Use One Tap with COOP-compliant settings
        console.log('Using Google One Tap with COOP compliance...');
        
        if (isMobile()) {
          // Mobile-first approach: Use popup/redirect method
          console.log('Using mobile-optimized Google Sign-In...');
          
          try {
            // Create temporary container for Google button
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'temp-google-signin';
            buttonContainer.style.position = 'fixed';
            buttonContainer.style.top = '-9999px';
            buttonContainer.style.left = '-9999px';
            buttonContainer.style.zIndex = '9999';
            document.body.appendChild(buttonContainer);

            // Render Google Sign-In button
            window.google.accounts.id.renderButton(buttonContainer, {
              theme: 'filled_blue',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              width: 250
            });

            // Wait for button to render, then trigger click
            setTimeout(() => {
              const iframe = buttonContainer.querySelector('iframe');
              if (iframe) {
                // Move container to visible area temporarily
                buttonContainer.style.position = 'fixed';
                buttonContainer.style.top = '50%';
                buttonContainer.style.left = '50%';
                buttonContainer.style.transform = 'translate(-50%, -50%)';
                buttonContainer.style.zIndex = '10000';
                buttonContainer.style.backgroundColor = 'white';
                buttonContainer.style.padding = '20px';
                buttonContainer.style.borderRadius = '8px';
                buttonContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '5px';
                closeBtn.style.right = '10px';
                closeBtn.style.background = 'none';
                closeBtn.style.border = 'none';
                closeBtn.style.fontSize = '20px';
                closeBtn.style.cursor = 'pointer';
                closeBtn.onclick = () => {
                  document.body.removeChild(buttonContainer);
                };
                buttonContainer.appendChild(closeBtn);
                
                // Auto-remove after 10 seconds
                setTimeout(() => {
                  if (document.body.contains(buttonContainer)) {
                    document.body.removeChild(buttonContainer);
                  }
                }, 10000);
              } else {
                console.error('Google Sign-In button failed to render');
                document.body.removeChild(buttonContainer);
                alert('Google Sign In is not available on this device. Please use email/password authentication.');
              }
            }, 500);

          } catch (mobileError) {
            console.error('Mobile Google Sign-In failed:', mobileError);
            // Fallback to One Tap for mobile
            window.google.accounts.id.prompt();
          }
          
        } else {
          // Desktop: Try One Tap first, then fallback to button
          window.google.accounts.id.prompt((notification: any) => {
            console.log('Google prompt notification:', notification);
            
            if (notification.isNotDisplayed()) {
              console.log('Google One Tap not displayed, reason:', notification.getNotDisplayedReason());
              
              // Desktop fallback: show rendered button
              const buttonContainer = document.createElement('div');
              buttonContainer.style.position = 'fixed';
              buttonContainer.style.top = '50%';
              buttonContainer.style.left = '50%';
              buttonContainer.style.transform = 'translate(-50%, -50%)';
              buttonContainer.style.zIndex = '10000';
              buttonContainer.style.backgroundColor = 'white';
              buttonContainer.style.padding = '30px';
              buttonContainer.style.borderRadius = '12px';
              buttonContainer.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              document.body.appendChild(buttonContainer);

              // Add title
              const title = document.createElement('div');
              title.textContent = 'Sign in with Google';
              title.style.marginBottom = '15px';
              title.style.fontSize = '16px';
              title.style.fontWeight = 'bold';
              title.style.textAlign = 'center';
              buttonContainer.appendChild(title);

              // Render Google button
              const googleButtonDiv = document.createElement('div');
              buttonContainer.appendChild(googleButtonDiv);

              window.google.accounts.id.renderButton(googleButtonDiv, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                shape: 'rectangular',
                width: 250
              });

              // Add close button
              const closeBtn = document.createElement('button');
              closeBtn.innerHTML = '×';
              closeBtn.style.position = 'absolute';
              closeBtn.style.top = '10px';
              closeBtn.style.right = '15px';
              closeBtn.style.background = 'none';
              closeBtn.style.border = 'none';
              closeBtn.style.fontSize = '24px';
              closeBtn.style.cursor = 'pointer';
              closeBtn.onclick = () => {
                document.body.removeChild(buttonContainer);
              };
              buttonContainer.appendChild(closeBtn);

              // Auto-remove after 15 seconds
              setTimeout(() => {
                if (document.body.contains(buttonContainer)) {
                  document.body.removeChild(buttonContainer);
                }
              }, 15000);
            }
          });
        }
        
      } else {
        console.error('Google Sign-In API not available');
        if (!window.google) {
          alert('Google Sign In is still loading. Please wait a moment and try again, or use email/password authentication.');
        } else {
          alert('Google Sign In is not properly configured. Please use email/password authentication.');
        }
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      alert('Google Sign In temporarily unavailable. Please use email/password authentication.');
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