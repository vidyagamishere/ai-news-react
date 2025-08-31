import React, { useState } from 'react';
import { RefreshCw, Zap, Database, Settings, Crown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import SubscriptionTiers from './subscription/SubscriptionTiers';

interface HeaderProps {
  onRefresh: () => void;
  onManualScrape: () => void;
  isLoading: boolean;
  lastUpdated?: string;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, onManualScrape, isLoading, lastUpdated }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleUpgrade = () => {
    setShowSubscriptionModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="header modern-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="title">
              <Zap className="title-icon" />
              AI News Through AI
            </h1>
            <p className="subtitle">Stay updated with the latest in AI</p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="header-center desktop-only">
            {lastUpdated && (
              <span className="last-updated">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="header-right">
            {/* Action Buttons */}
            <div className="header-actions desktop-only">
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className={`btn btn-icon ${isLoading ? 'loading' : ''}`}
                title="Refresh digest"
              >
                <RefreshCw className={`icon ${isLoading ? 'spinning' : ''}`} />
              </button>
              
              <button 
                onClick={onManualScrape}
                disabled={isLoading}
                className={`btn btn-icon ${isLoading ? 'loading' : ''}`}
                title="Update sources"
              >
                <Database className="icon" />
              </button>
            </div>

            {/* User Authentication */}
            {isAuthenticated && user ? (
              <div className="user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-avatar"
                  title={`${user.name} (${user.subscriptionTier})`}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.subscriptionTier === 'premium' && (
                    <Crown className="premium-badge" size={14} />
                  )}
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                      <span className={`subscription-badge ${user.subscriptionTier}`}>
                        {user.subscriptionTier === 'premium' ? (
                          <>
                            <Crown size={12} />
                            Premium
                          </>
                        ) : (
                          'Free'
                        )}
                      </span>
                    </div>
                    
                    <div className="menu-divider"></div>
                    
                    <button className="menu-item">
                      <Settings size={16} />
                      Preferences
                    </button>
                    
                    {user.subscriptionTier === 'free' && (
                      <button onClick={handleUpgrade} className="menu-item upgrade-btn">
                        <Crown size={16} />
                        Upgrade to Premium
                      </button>
                    )}
                    
                    <div className="menu-divider"></div>
                    
                    <button onClick={handleLogout} className="menu-item logout-btn">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={handleSignIn} className="btn btn-primary">
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="mobile-menu-toggle mobile-only"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {lastUpdated && (
                <div className="mobile-last-updated">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              )}
              
              <div className="mobile-actions">
                <button 
                  onClick={() => { onRefresh(); setShowMobileMenu(false); }}
                  disabled={isLoading}
                  className={`btn btn-outline ${isLoading ? 'loading' : ''}`}
                >
                  <RefreshCw className={`icon ${isLoading ? 'spinning' : ''}`} />
                  Refresh
                </button>
                
                <button 
                  onClick={() => { onManualScrape(); setShowMobileMenu(false); }}
                  disabled={isLoading}
                  className={`btn btn-outline ${isLoading ? 'loading' : ''}`}
                >
                  <Database className="icon" />
                  Update Sources
                </button>
              </div>

              {isAuthenticated && user && user.subscriptionTier === 'free' && (
                <button 
                  onClick={() => { handleUpgrade(); setShowMobileMenu(false); }}
                  className="btn btn-primary mobile-upgrade"
                >
                  <Crown size={16} />
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionTiers
          onClose={() => setShowSubscriptionModal(false)}
          showOnlyUpgrade={true}
        />
      )}
    </>
  );
};

export default Header;