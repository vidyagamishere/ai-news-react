import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import type { TopStory } from '../services/api';
import SmartImage from './SmartImage';

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
        {stories.slice(0, 10).map((story, index) => (
          <div 
            key={index} 
            className="story-item clickable-story"
            onClick={() => window.open(story.url, '_blank', 'noopener,noreferrer')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open(story.url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <div className="story-rank">#{index + 1}</div>
            <div className="story-main">
              <div className="story-left">
                <h3 className="story-title">
                  {story.title}
                  <ExternalLink className="external-icon" />
                </h3>
                
                {story.imageUrl && (
                  <SmartImage
                    src={story.imageUrl}
                    alt={story.title}
                    className="story-image-smart"
                    fallbackType="hide"
                    aspectRatio="16/9"
                    maxWidth="280px"
                    lazy={true}
                  />
                )}
                
                <div className="story-meta">
                  <span className="story-source">{story.source}</span>
                  <div className="story-score">
                    <Star className="star-icon" />
                    <span>{story.significanceScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {(story.content_summary || story.summary) && (
                <div className="story-right">
                  <p className="story-summary">
                    {story.content_summary || story.summary}
                    {story.content_summary && (
                      <span className="llm-summary-badge" title="AI-generated summary">🤖</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStories;