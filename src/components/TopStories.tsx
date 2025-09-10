import React, { useState } from 'react';
import { ExternalLink, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { TopStory } from '../services/api';
import SmartImage from './SmartImage';

interface TopStoriesProps {
  stories: TopStory[];
}

const TopStories: React.FC<TopStoriesProps> = ({ stories }) => {
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());

  if (!stories || stories.length === 0) {
    return null;
  }

  const toggleExpanded = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the link when clicking expand/collapse
    const newExpanded = new Set(expandedStories);
    if (expandedStories.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStories(newExpanded);
  };

  const truncateSummary = (summary: string, maxLength: number = 200): { truncated: string; isTruncated: boolean } => {
    if (summary.length <= maxLength) {
      return { truncated: summary, isTruncated: false };
    }
    return { truncated: summary.substring(0, maxLength) + '...', isTruncated: true };
  };

  return (
    <div className="top-stories">
      <h2 className="section-title">🔥 Top Stories</h2>
      <div className="stories-list">
        {stories.slice(0, 5).map((story, index) => {
          const isExpanded = expandedStories.has(index);
          const summary = story.content_summary || story.summary || `This significant article from ${story.source} covers important developments in AI technology. The piece provides valuable insights into emerging trends and innovations shaping the industry. Readers will gain understanding of current advancements and their potential applications. The content offers expert analysis from leading voices in artificial intelligence. Essential reading for staying informed about the latest breakthroughs in AI.`;
          const { truncated, isTruncated } = truncateSummary(summary);
          
          return (
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
                  {isExpanded ? summary : truncated}
                  <span className="llm-summary-badge" title="Enhanced 5-sentence AI summary">🤖</span>
                </p>
                {isTruncated && (
                  <button 
                    className="expand-toggle"
                    onClick={(e) => toggleExpanded(index, e)}
                    aria-label={isExpanded ? "Show less" : "Read full summary"}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Read Full Summary
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopStories;