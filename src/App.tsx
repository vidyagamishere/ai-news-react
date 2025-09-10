import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import EmailVerification from './pages/EmailVerification';
import OTPVerification from './pages/OTPVerification';
import Preferences from './pages/Preferences';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Admin from './pages/Admin';
import Loading from './components/Loading';
import './App.css';
import './pages/legal.css';
import './pages/about.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading message="Loading..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects authenticated users to dashboard, except for onboarding)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading message="Loading..." />;
  }
  
  // Allow onboarding for authenticated users
  const currentPath = window.location.pathname;
  if (isAuthenticated && currentPath !== '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/landing" 
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signin" 
        element={<Navigate to="/auth" replace />}
      />
      <Route 
        path="/signup" 
        element={<Navigate to="/auth" replace />}
      />
      <Route 
        path="/verify-email" 
        element={<EmailVerification />}
      />
      <Route 
        path="/verify-otp" 
        element={<OTPVerification />}
      />
      <Route 
        path="/onboarding" 
        element={<Onboarding />}
      />
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;