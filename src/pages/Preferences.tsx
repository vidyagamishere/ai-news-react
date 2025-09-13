import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import NewsletterPreferences from '../components/NewsletterPreferences';
import SEO from '../components/SEO';
import './Preferences.css';

const Preferences: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="app">
        <Header onRefresh={() => {}} onManualScrape={() => {}} isLoading={false} />
        <div className="main-content">
          <div className="error-container">
            <p>Please log in to access preferences.</p>
            <Link to="/auth" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app authenticated-app">
      <SEO 
        title="Preferences | AI News Intelligence"
        description="Manage your AI news preferences, newsletter subscriptions, and account settings."
        url="/preferences"
      />
      <Header onRefresh={() => {}} onManualScrape={() => {}} isLoading={false} />
      
      <main className="main-content">
        <div className="main-content-contained">
          <div className="preferences-header">
            <Link to="/dashboard" className="back-link">
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>
            <h1>Preferences</h1>
            <p>Manage your AI news experience and account settings</p>
          </div>

          <div className="preferences-container">
            {/* User Information Section */}
            <div className="preferences-section">
              <div className="section-header">
                <User size={20} />
                <h2>Account Information</h2>
              </div>
              <div className="user-info-card">
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <div className="subscription-badge">
                    {user.subscriptionTier === 'premium' ? (
                      <span className="premium-badge">Premium Member</span>
                    ) : (
                      <span className="free-badge">Free Account</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Preferences Section */}
            <div className="preferences-section">
              <div className="section-header">
                <Mail size={20} />
                <h2>Newsletter Preferences</h2>
              </div>
              <NewsletterPreferences />
            </div>

            {/* Notification Preferences Section */}
            <div className="preferences-section">
              <div className="section-header">
                <Bell size={20} />
                <h2>Notification Preferences</h2>
              </div>
              <div className="notification-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <strong>Email Notifications</strong>
                    <p>Receive important updates and newsletters</p>
                  </div>
                  <div className="setting-control">
                    <input 
                      type="checkbox" 
                      id="email-notifications"
                      checked={user.preferences?.email_notifications !== false}
                      readOnly
                    />
                    <label htmlFor="email-notifications" className="toggle-switch">
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <strong>Newsletter Frequency</strong>
                    <p>How often you receive newsletters</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      value={user.preferences?.newsletter_frequency || '12_hours'}
                      disabled
                    >
                      <option value="12_hours">Every 12 hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="preferences-section">
              <div className="section-header">
                <h2>Account Actions</h2>
              </div>
              <div className="account-actions">
                <p className="note">
                  Need to update your email or other account details? Contact support or 
                  sign in again with your Google account to refresh your information.
                </p>
                <div className="action-buttons">
                  <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
                  </Link>
                  <Link to="/archive" className="btn btn-secondary">
                    View Archive
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;