import React from 'react';
import { TrendingUp, AlertCircle, BookOpen, Building2 } from 'lucide-react';
import type { Metrics } from '../services/api';

interface MetricsDashboardProps {
  metrics: Metrics;
  keyPoints: string[];
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics, keyPoints }) => {
  return (
    <div className="metrics-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon total">
            <TrendingUp />
          </div>
          <div className="metric-content">
            <h3>{metrics.totalUpdates}</h3>
            <p>Total Updates</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon high-impact">
            <AlertCircle />
          </div>
          <div className="metric-content">
            <h3>{metrics.highImpact}</h3>
            <p>High Impact</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon research">
            <BookOpen />
          </div>
          <div className="metric-content">
            <h3>{metrics.newResearch}</h3>
            <p>New Research</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon industry">
            <Building2 />
          </div>
          <div className="metric-content">
            <h3>{metrics.industryMoves}</h3>
            <p>Industry Moves</p>
          </div>
        </div>
      </div>
      
      {keyPoints && keyPoints.length > 0 && (
        <div className="key-points">
          <h3>Today's Key Points</h3>
          <ul>
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;