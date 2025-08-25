import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Loading AI news..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <RefreshCw className="spinning" />
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;