import React from 'react';
import { RefreshCw, Zap, Database } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  onManualScrape: () => void;
  isLoading: boolean;
  lastUpdated?: string;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, onManualScrape, isLoading, lastUpdated }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="title">
            <Zap className="title-icon" />
            AI News Digest
          </h1>
          <p className="subtitle">Stay updated with the latest in AI</p>
        </div>
        
        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            title="Refresh digest"
          >
            <RefreshCw className={`icon ${isLoading ? 'spinning' : ''}`} />
            Refresh
          </button>
          
          <button 
            onClick={onManualScrape}
            disabled={isLoading}
            className={`btn btn-secondary ${isLoading ? 'loading' : ''}`}
            title="Trigger manual scraping"
          >
            <Database className="icon" />
            Update Sources
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;