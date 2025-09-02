import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Brain, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import type { ContentType } from '../types/auth';
import './onboarding.css';

interface OnboardingData {
  occupation: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  selectedTopics: string[];
  subscribeNewsletter: boolean;
  acceptTerms: boolean;
}

interface AITopic {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultSelected?: boolean;
}

const aiTopics: AITopic[] = [
  { id: 'machine-learning', name: 'Machine Learning', description: 'Algorithms, models, and applications', category: 'Core AI', defaultSelected: true },
  { id: 'deep-learning', name: 'Deep Learning', description: 'Neural networks and advanced architectures', category: 'Core AI', defaultSelected: true },
  { id: 'nlp', name: 'Natural Language Processing', description: 'Text processing and language models', category: 'Core AI', defaultSelected: true },
  { id: 'computer-vision', name: 'Computer Vision', description: 'Image and video analysis', category: 'Core AI' },
  { id: 'robotics', name: 'Robotics', description: 'AI in robotics and automation', category: 'Applications' },
  { id: 'ai-ethics', name: 'AI Ethics', description: 'Responsible AI and societal impact', category: 'Ethics' },
  { id: 'generative-ai', name: 'Generative AI', description: 'Large language models and creative AI', category: 'Trending' },
  { id: 'ai-research', name: 'AI Research', description: 'Latest research papers and breakthroughs', category: 'Research' },
  { id: 'ai-business', name: 'AI in Business', description: 'Enterprise AI applications and strategy', category: 'Business' },
  { id: 'ai-tools', name: 'AI Tools & Platforms', description: 'Development frameworks and tools', category: 'Tools' }
];

const occupations = [
  'Software Engineer/Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Researcher',
  'Product Manager',
  'Business Analyst',
  'Student',
  'Academic/Professor',
  'Entrepreneur',
  'Consultant',
  'Other'
];

const experienceLevels = [
  { id: 'beginner', name: 'Beginner', description: 'New to AI, want to learn the basics' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some AI knowledge, building practical skills' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced with AI, staying current with trends' },
  { id: 'expert', name: 'Expert', description: 'AI professional, need cutting-edge insights' }
];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    occupation: '',
    experienceLevel: 'intermediate',
    selectedTopics: aiTopics.filter(t => t.defaultSelected).map(t => t.id),
    subscribeNewsletter: true,
    acceptTerms: false
  });

  const { user, updatePreferences } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 5;

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTopic = (topicId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }));
  };

  const handleComplete = async () => {
    if (!onboardingData.acceptTerms) {
      alert('Please accept the Terms and Conditions to continue.');
      return;
    }

    setLoading(true);
    
    try {
      // Convert onboarding data to user preferences format
      const preferences = {
        topics: aiTopics.map(topic => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
          category: topic.category as 'technology',
          selected: onboardingData.selectedTopics.includes(topic.id)
        })),
        newsletterFrequency: 'daily' as const,
        emailNotifications: onboardingData.subscribeNewsletter,
        contentTypes: ['articles', 'videos', 'events', 'learning'] as ContentType[]
      };

      // Update user preferences
      await updatePreferences(preferences);

      // Store additional analytics data (occupation, experience level)
      const analyticsData = {
        occupation: onboardingData.occupation,
        experienceLevel: onboardingData.experienceLevel,
        onboardingCompletedAt: new Date().toISOString()
      };

      // Send analytics data to backend - using any to bypass type restrictions
      await (authService.updateUserPreferences as any)({
        ...preferences,
        analytics: analyticsData
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return onboardingData.occupation.length > 0;
      case 2: return onboardingData.experienceLevel.length > 0;
      case 3: return onboardingData.selectedTopics.length >= 3;
      case 4: return true; // Newsletter is optional
      case 5: return onboardingData.acceptTerms;
      default: return false;
    }
  };

  const groupedTopics = aiTopics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, AITopic[]>);

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="welcome-message">
            <h1>Welcome to AI News Digest!</h1>
            <p>Let's personalize your AI learning experience</p>
          </div>
          
          <div className="progress-bar">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        <div className="onboarding-content">
          {/* Step 1: Occupation */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-header">
                <Briefcase size={48} className="step-icon" />
                <h2>What's your current occupation?</h2>
                <p>This helps us understand your AI use cases and interests</p>
              </div>
              
              <div className="occupation-grid">
                {occupations.map(occupation => (
                  <button
                    key={occupation}
                    type="button"
                    className={`occupation-card ${onboardingData.occupation === occupation ? 'selected' : ''}`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, occupation }))}
                  >
                    {occupation}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-header">
                <Brain size={48} className="step-icon" />
                <h2>What's your AI experience level?</h2>
                <p>We'll tailor content complexity to match your background</p>
              </div>
              
              <div className="experience-options">
                {experienceLevels.map(level => (
                  <button
                    key={level.id}
                    type="button"
                    className={`experience-card ${onboardingData.experienceLevel === level.id ? 'selected' : ''}`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, experienceLevel: level.id as any }))}
                  >
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Topic Selection */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <BookOpen size={48} className="step-icon" />
                <h2>Choose your AI interests</h2>
                <p>Select at least 3 topics you'd like to learn about (3 pre-selected)</p>
              </div>
              
              <div className="topics-selection">
                {Object.entries(groupedTopics).map(([category, topics]) => (
                  <div key={category} className="topic-category">
                    <h3 className="category-title">{category}</h3>
                    <div className="topics-grid">
                      {topics.map(topic => (
                        <button
                          key={topic.id}
                          type="button"
                          className={`topic-card ${onboardingData.selectedTopics.includes(topic.id) ? 'selected' : ''}`}
                          onClick={() => toggleTopic(topic.id)}
                        >
                          <div className="topic-header">
                            <span className="topic-name">{topic.name}</span>
                            {onboardingData.selectedTopics.includes(topic.id) && (
                              <Check size={18} className="selected-icon" />
                            )}
                          </div>
                          <p className="topic-description">{topic.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="selection-counter">
                Selected: {onboardingData.selectedTopics.length} / {aiTopics.length}
                {onboardingData.selectedTopics.length < 3 && (
                  <span className="selection-hint"> (Select at least 3)</span>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Newsletter Subscription */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="step-header">
                <div className="step-icon">📧</div>
                <h2>Stay updated with our newsletter</h2>
                <p>Get personalized AI insights delivered to your inbox</p>
              </div>
              
              <div className="newsletter-options">
                <div className="newsletter-card">
                  <h3>AI News Digest Newsletter</h3>
                  <ul className="newsletter-features">
                    <li>✅ Weekly curated AI news</li>
                    <li>✅ Personalized content based on your interests</li>
                    <li>✅ Exclusive insights and analysis</li>
                    <li>✅ Early access to new features</li>
                  </ul>
                  
                  <div className="newsletter-toggle">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={onboardingData.subscribeNewsletter}
                        onChange={(e) => setOnboardingData(prev => ({ 
                          ...prev, 
                          subscribeNewsletter: e.target.checked 
                        }))}
                      />
                      <span className="toggle-slider"></span>
                      Subscribe to newsletter
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Terms and Conditions */}
          {currentStep === 5 && (
            <div className="step-content">
              <div className="step-header">
                <div className="step-icon">📋</div>
                <h2>Terms and Conditions</h2>
                <p>Please review and accept our terms to complete setup</p>
              </div>
              
              <div className="terms-content">
                <div className="terms-summary">
                  <h3>Summary of Terms</h3>
                  <ul>
                    <li>We collect and use data to personalize your AI news experience</li>
                    <li>Your personal information is protected and never shared without consent</li>
                    <li>You can update preferences and unsubscribe at any time</li>
                    <li>We use cookies to improve your browsing experience</li>
                    <li>Content is provided for informational purposes</li>
                  </ul>
                </div>
                
                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.acceptTerms}
                      onChange={(e) => setOnboardingData(prev => ({ 
                        ...prev, 
                        acceptTerms: e.target.checked 
                      }))}
                      required
                    />
                    <span className="checkbox-checkmark"></span>
                    I accept the <a href="/terms" target="_blank">Terms of Service</a> and{' '}
                    <a href="/privacy" target="_blank">Privacy Policy</a>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          <div className="actions-left">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost"
                disabled={loading}
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
          </div>

          <div className="actions-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                disabled={!isStepValid() || loading}
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="btn btn-primary"
                disabled={!isStepValid() || loading}
              >
                {loading ? 'Completing...' : 'Complete Setup'}
                <Check size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="onboarding-summary">
          <div className="summary-grid">
            <div className={`summary-item ${currentStep >= 1 ? 'completed' : ''}`}>
              <Briefcase size={16} />
              <span>Occupation</span>
            </div>
            <div className={`summary-item ${currentStep >= 2 ? 'completed' : ''}`}>
              <Brain size={16} />
              <span>Experience</span>
            </div>
            <div className={`summary-item ${currentStep >= 3 ? 'completed' : ''}`}>
              <BookOpen size={16} />
              <span>Topics</span>
            </div>
            <div className={`summary-item ${currentStep >= 4 ? 'completed' : ''}`}>
              <div className="step-icon">📧</div>
              <span>Newsletter</span>
            </div>
            <div className={`summary-item ${currentStep >= 5 ? 'completed' : ''}`}>
              <div className="step-icon">📋</div>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;