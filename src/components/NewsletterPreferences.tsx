import React, { useState, useEffect } from 'react';
import { Mail, MailCheck, MailX, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// import { apiService } from '../services/api';
import './NewsletterPreferences.css';

interface NewsletterPreferencesProps {
  compact?: boolean;
}

const NewsletterPreferences: React.FC<NewsletterPreferencesProps> = ({ compact = false }) => {
  const { user, updatePreferences } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize subscription status from user preferences
    if (user?.preferences) {
      setIsSubscribed(user.preferences.newsletter_subscribed || false);
    }
  }, [user]);

  const handleSubscriptionToggle = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Update user preferences
      const newPreferences = {
        ...user.preferences,
        newsletter_subscribed: !isSubscribed,
        email_notifications: true // Ensure email notifications are enabled
      };

      // Call API to update preferences
      await updatePreferences(newPreferences);
      
      setIsSubscribed(!isSubscribed);
      setMessage(
        !isSubscribed 
          ? '✅ Subscribed to AI News Newsletter!' 
          : '📧 Unsubscribed from newsletter'
      );

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Failed to update newsletter preferences:', error);
      setMessage('❌ Failed to update preferences');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (compact) {
    return (
      <div className="newsletter-preferences-compact">
        <button
          className={`newsletter-toggle-btn ${isSubscribed ? 'subscribed' : ''}`}
          onClick={handleSubscriptionToggle}
          disabled={loading}
        >
          {loading ? (
            <div className="spinner" />
          ) : isSubscribed ? (
            <MailCheck size={16} />
          ) : (
            <Mail size={16} />
          )}
          <span>{isSubscribed ? 'Newsletter On' : 'Newsletter Off'}</span>
        </button>
        {message && <div className="message compact">{message}</div>}
      </div>
    );
  }

  return (
    <div className="newsletter-preferences">
      <div className="newsletter-header">
        <div className="newsletter-icon">
          <Mail size={24} />
        </div>
        <div className="newsletter-info">
          <h3>AI News Newsletter</h3>
          <p>Get beautiful PDF newsletters with curated AI content every 12 hours</p>
        </div>
      </div>

      <div className="newsletter-features">
        <div className="feature">
          <span className="feature-icon">🤖</span>
          <span>AI-enhanced article summaries</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📊</span>
          <span>Significance scoring for prioritized reading</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📄</span>
          <span>Beautiful PDF format for offline reading</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🌐</span>
          <span>Comprehensive coverage from 45+ AI sources</span>
        </div>
      </div>

      <div className="newsletter-control">
        <div className="subscription-status">
          <div className={`status-indicator ${isSubscribed ? 'active' : ''}`}>
            {isSubscribed ? <MailCheck size={20} /> : <MailX size={20} />}
          </div>
          <div className="status-text">
            <strong>
              {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </strong>
            <p>
              {isSubscribed 
                ? 'You\'ll receive newsletters every 12 hours'
                : 'Subscribe to get AI news delivered to your inbox'
              }
            </p>
          </div>
        </div>

        <button
          className={`newsletter-action-btn ${isSubscribed ? 'unsubscribe' : 'subscribe'}`}
          onClick={handleSubscriptionToggle}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Updating...</span>
            </>
          ) : isSubscribed ? (
            <>
              <MailX size={18} />
              <span>Unsubscribe</span>
            </>
          ) : (
            <>
              <MailCheck size={18} />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="newsletter-footer">
        <p>
          <Settings size={14} />
          You can unsubscribe at any time from the email or by toggling this setting
        </p>
      </div>
    </div>
  );
};

export default NewsletterPreferences;