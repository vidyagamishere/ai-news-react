import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopicSelector from '../components/onboarding/TopicSelector';
import Header from '../components/Header';
import './auth.css';

const Preferences: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="app">
      <Header 
        onRefresh={() => {}}
        onManualScrape={() => {}}
        isLoading={false}
      />
      
      <main className="main-content">
        <div className="main-content-contained">
          <div className="preferences-page">
            <div className="preferences-header">
              <button onClick={() => navigate('/dashboard')} className="back-btn">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <h1>Your Preferences</h1>
              <p>Update your AI interests and content preferences</p>
            </div>
            
            <TopicSelector 
              onComplete={handleComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;