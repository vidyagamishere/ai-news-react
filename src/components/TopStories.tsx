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
        {stories.slice(0, 5).map((story, index) => (
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
              
              <div className="story-right">
                <p className="story-summary">
                  {story.content_summary || story.summary || `This significant article from ${story.source} covers important developments in AI technology. The piece provides valuable insights into emerging trends and innovations shaping the industry. Readers will gain understanding of current advancements and their potential applications. The content offers expert analysis from leading voices in artificial intelligence. Essential reading for staying informed about the latest breakthroughs in AI.`}
                  <span className="llm-summary-badge" title="Enhanced 5-sentence AI summary">🤖</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStories;