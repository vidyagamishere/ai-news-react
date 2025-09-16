import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Brain, User, Sparkles, 
  Mail, Bell
} from 'lucide-react';
import type { AITopic, ContentType } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import './onboarding.css';

const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'New to AI', description: 'Just getting started with AI', icon: '🌱' },
  { id: 'intermediate', name: 'Some Experience', description: 'Know the basics, want to learn more', icon: '🚀' },
  { id: 'advanced', name: 'Experienced', description: 'Work with AI regularly', icon: '⚡' },
  { id: 'expert', name: 'AI Expert', description: 'Research or lead AI initiatives', icon: '🎯' }
];

const ROLE_TYPES = [
  { id: 'developer', name: 'Developer', icon: '💻' },
  { id: 'researcher', name: 'Researcher', icon: '🔬' },
  { id: 'student', name: 'Student', icon: '🎓' },
  { id: 'executive', name: 'Business Leader', icon: '👔' },
  { id: 'enthusiast', name: 'AI Enthusiast', icon: '❤️' },
  { id: 'other', name: 'Other', icon: '🤔' }
];

interface SimplifiedOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const SimplifiedOnboarding: React.FC<SimplifiedOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Step 1: Basic Info
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Step 2: AI Topics
  const [availableTopics, setAvailableTopics] = useState<AITopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Step 3: Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const { updatePreferences } = useAuth();
  const totalSteps = 3;

  useEffect(() => {
    loadAvailableTopics();
  }, []);

  const loadAvailableTopics = async () => {
    try {
      const topics = await authService.getAvailableTopics();
      setAvailableTopics(topics);
      
      // Pre-select some popular topics based on role
      const defaultTopics = topics.filter(t => 
        ['Machine Learning', 'AI Tools', 'AI Research'].includes(t.name)
      ).map(t => t.id);
      setSelectedTopics(defaultTopics);
    } catch (error) {
      console.error('Failed to load topics:', error);
      // Provide fallback topics
      setAvailableTopics([
        { id: '1', name: 'Machine Learning', category: 'technology', selected: false, description: 'Latest ML developments' },
        { id: '2', name: 'AI Tools', category: 'tools', selected: false, description: 'New AI applications and tools' },
        { id: '3', name: 'AI Research', category: 'research', selected: false, description: 'Academic research and papers' },
        { id: '4', name: 'Computer Vision', category: 'technology', selected: false, description: 'Image and video AI' },
        { id: '5', name: 'Natural Language Processing', category: 'technology', selected: false, description: 'Language AI and chatbots' },
        { id: '6', name: 'AI Ethics', category: 'ethics', selected: false, description: 'Responsible AI development' }
      ]);
      setSelectedTopics(['1', '2', '3']);
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      const newSelection = prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];
      
      // Ensure at least one topic is selected
      return newSelection.length === 0 ? [topicId] : newSelection;
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const preferences = {
        topics: availableTopics.filter(topic => 
          selectedTopics.includes(topic.id)
        ).map(topic => ({
          ...topic,
          selected: true
        })),
        content_types: ['articles', 'videos', 'events', 'learning'] as ContentType[],
        newsletter_frequency: 'weekly' as const,
        email_notifications: emailNotifications,
        weekly_digest: weeklyDigest,
        experience_level: selectedExperience,
        role_type: selectedRole,
        onboardingCompleted: true
      };

      await updatePreferences(preferences);
      localStorage.setItem('onboardingComplete', 'true');
      onComplete();
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      setError(error.message || 'Failed to save preferences. Please try again.');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (currentStep === totalSteps) {
      handleComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedExperience && selectedRole;
      case 2:
        return selectedTopics.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <User className="step-icon" size={48} />
        <h2>Welcome to Vidyagam!</h2>
        <p>Let's personalize your AI news experience in just a few steps</p>
      </div>

      <div className="form-section">
        <h3>What's your AI experience level?</h3>
        <div className="options-grid">
          {EXPERIENCE_LEVELS.map(level => (
            <button
              key={level.id}
              className={`option-card ${selectedExperience === level.id ? 'selected' : ''}`}
              onClick={() => setSelectedExperience(level.id)}
            >
              <span className="option-icon">{level.icon}</span>
              <div className="option-content">
                <h4>{level.name}</h4>
                <p>{level.description}</p>
              </div>
              {selectedExperience === level.id && (
                <Check className="selected-check" size={20} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>What best describes your role?</h3>
        <div className="options-grid compact">
          {ROLE_TYPES.map(role => (
            <button
              key={role.id}
              className={`option-card compact ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <span className="option-icon">{role.icon}</span>
              <span className="option-name">{role.name}</span>
              {selectedRole === role.id && (
                <Check className="selected-check" size={16} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <Brain className="step-icon" size={48} />
        <h2>Choose Your AI Interests</h2>
        <p>Select topics you'd like to follow (you can change these anytime)</p>
      </div>

      <div className="topics-container">
        <div className="topics-grid">
          {availableTopics.map(topic => (
            <button
              key={topic.id}
              className={`topic-card ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => handleTopicToggle(topic.id)}
            >
              <div className="topic-header">
                <span className="topic-name">{topic.name}</span>
                {selectedTopics.includes(topic.id) && (
                  <Check className="topic-check" size={16} />
                )}
              </div>
              <p className="topic-description">{topic.description}</p>
            </button>
          ))}
        </div>
        
        <div className="selection-info">
          <p>{selectedTopics.length} topics selected</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <Sparkles className="step-icon" size={48} />
        <h2>Almost Done!</h2>
        <p>Set your notification preferences to stay updated</p>
      </div>

      <div className="preferences-container">
        <div className="preference-item">
          <div className="preference-info">
            <Mail className="preference-icon" size={24} />
            <div>
              <h4>Email Notifications</h4>
              <p>Get important AI updates delivered to your inbox</p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <Bell className="preference-icon" size={24} />
            <div>
              <h4>Weekly Digest</h4>
              <p>Weekly summary of the most important AI developments</p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="completion-preview">
          <h4>🎉 You're all set!</h4>
          <p>After completing setup, you'll have access to:</p>
          <ul>
            <li>Personalized AI news feed</li>
            <li>Weekly digest emails</li>
            <li>Latest AI research and tools</li>
            <li>Curated content from 50+ sources</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="simplified-onboarding">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-steps">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`progress-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
                >
                  {i + 1 < currentStep ? <Check size={14} /> : i + 1}
                </div>
              ))}
            </div>
            <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
          <div className="progress-text">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              {retryCount < 3 && (
                <button onClick={handleRetry} className="retry-btn">
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding-actions">
          <div className="actions-left">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="btn btn-ghost"
                disabled={loading}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>

          <div className="actions-right">
            {onSkip && currentStep === 1 && (
              <button
                onClick={onSkip}
                className="btn btn-ghost"
                disabled={loading}
              >
                Skip for now
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="loading-content">
                  <span className="loading-spinner"></span>
                  Saving...
                </span>
              ) : currentStep === totalSteps ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedOnboarding;