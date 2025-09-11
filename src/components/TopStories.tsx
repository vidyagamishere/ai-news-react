import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import type { TopStory } from '../services/api';
import SmartImage from './SmartImage';

interface TopStoriesProps {
  stories: TopStory[];
}

const TopStories: React.FC<TopStoriesProps> = ({ stories }) => {
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!stories || stories.length === 0) {
    return null;
  }

  const toggleExpanded = (index: number, event?: React.MouseEvent | React.TouchEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const newExpanded = new Set(expandedStories);
    if (expandedStories.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStories(newExpanded);
  };

  const openStoryLink = (url: string, event?: React.MouseEvent | React.TouchEvent) => {
    if (event) {
      event.stopPropagation();
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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
          
          // On mobile, always show full summary. On desktop, use truncation logic
          const { truncated, isTruncated } = isMobile ? { truncated: summary, isTruncated: false } : truncateSummary(summary);
          
          return (
            <div 
              key={index} 
              className="story-item"
            >
              <div className="story-rank">#{index + 1}</div>
              <div className="story-main">
                <div className="story-left">
                  <h3 className="story-title">
                    {story.title}
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
                  
                  <div className="story-actions">
                    {/* Only show expand toggle on desktop when content is truncated */}
                    {!isMobile && isTruncated && (
                      <button 
                        className="expand-toggle"
                        onClick={(e) => toggleExpanded(index, e)}
                        type="button"
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
                    
                    <button 
                      className="read-article-btn"
                      onClick={(e) => openStoryLink(story.url, e)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        openStoryLink(story.url, e);
                      }}
                      type="button"
                      aria-label="Open article in new tab"
                    >
                      <Link2 size={16} />
                      Read Article
                    </button>
                  </div>
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