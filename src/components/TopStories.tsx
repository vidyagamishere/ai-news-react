import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import type { TopStory } from '../services/api';

interface TopStoriesProps {
  stories: TopStory[];
}

const TopStories: React.FC<TopStoriesProps> = ({ stories }) => {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="top-stories">
      <h2 className="section-title">🔥 Top Stories</h2>
      <div className="stories-list">
        {stories.map((story, index) => (
          <div key={index} className="story-item">
            <div className="story-rank">#{index + 1}</div>
            <div className="story-content">
              <h3 className="story-title">
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="story-link"
                >
                  {story.title}
                  <ExternalLink className="external-icon" />
                </a>
              </h3>
              <div className="story-meta">
                <span className="story-source">{story.source}</span>
                <div className="story-score">
                  <Star className="star-icon" />
                  <span>{story.significanceScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStories;