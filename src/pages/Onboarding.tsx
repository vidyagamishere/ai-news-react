import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SimplifiedOnboarding from '../components/onboarding/SimplifiedOnboarding';
import Loading from '../components/Loading';
import './onboarding.css';


const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/dashboard');
  };

  if (!user) {
    return <Loading message="Loading..." />;
  }

  return (
    <div className="onboarding-page">
      <SimplifiedOnboarding 
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default Onboarding;