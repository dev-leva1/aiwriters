import React from 'react';
import { Link } from 'react-router-dom';
import { Story, AIRating } from '../types';

interface StoryCardProps {
  story: Story & {
    aiGenerated?: boolean;
    views?: number; 
  };
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  // Определяет класс для рейтинга в зависимости от значения
  const getRatingClass = (score: AIRating | undefined): string => {
    if (!score) return 'rating-poor';
    const overallScore = score.overallScore;
    if (overallScore >= 4.5) return 'rating-excellent';
    if (overallScore >= 3.5) return 'rating-good';
    if (overallScore >= 2.5) return 'rating-average';
    if (overallScore >= 1.5) return 'rating-below-average';
    return 'rating-poor';
  };

  // Форматирование даты создания
  const formattedDate = story.createdAt 
    ? new Date(story.createdAt).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) 
    : 'Неизвестная дата';

  // Лимитирует количество символов в контенте
  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="story-card" style={{
      position: 'relative',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-surface-2) 100%)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.1)',
      margin: '15px 0',
    }}>
      {/* Неоновая граница при наведении (через CSS переменные) */}
      <style>{`
        .story-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.2);
          border: 1px solid var(--primary-color);
        }
        .story-card:hover .story-card-title {
          color: var(--primary-color);
        }
        .story-card:hover .glow-effect {
          opacity: 1;
        }
        .tags-container::-webkit-scrollbar {
          height: 4px;
          background: var(--dark-surface-2);
        }
        .tags-container::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 2px;
        }
      `}</style>
      
      {/* Эффект свечения по краям */}
      <div className="glow-effect" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boxShadow: 'inset 0 0 10px var(--primary-color)',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        borderRadius: '8px',
        zIndex: 1
      }}></div>
      
      {/* Заголовок карточки */}
      <div className="story-card-header" style={{
        padding: '15px 20px',
        borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
        background: 'var(--dark-surface-2)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to={`/stories/${story.id}`} style={{ textDecoration: 'none', display: 'block', width: '80%' }}>
          <h3 className="story-card-title" style={{
            margin: '0',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            transition: 'color 0.3s ease',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {story.title}
          </h3>
        </Link>
        
        {story.aiGenerated && (
          <div className="ai-badge" style={{
            background: 'linear-gradient(135deg, #4a00e0, #8e2de2)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 10px rgba(142, 45, 226, 0.4)',
            backdropFilter: 'blur(5px)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
              <path d="M21 12.5C21 17.1944 17.1944 21 12.5 21C7.80558 21 4 17.1944 4 12.5C4 7.80558 7.80558 4 12.5 4C17.1944 4 21 7.80558 21 12.5Z" stroke="white" strokeWidth="2" />
              <path d="M12.5 8V12.5L15.5 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            AI
          </div>
        )}
      </div>
      
      {/* Тело карточки */}
      <div className="story-card-body" style={{ padding: '15px 20px' }}>
        <div className="meta-info" style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          fontSize: '0.85rem',
          color: 'var(--muted-color)'
        }}>
          <div className="author" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.15 19.25 6.86 18.05C6.6 17.81 6.5 17.44 6.61 17.11C7.2 15.4 8.97 14 12 14C15.03 14 16.8 15.4 17.39 17.11C17.5 17.44 17.4 17.81 17.14 18.05C15.85 19.25 14.03 20 12 20Z" fill="var(--muted-color)" />
            </svg>
            {story.author?.username || 'Неизвестный автор'}
          </div>
          <div className="divider" style={{ margin: '0 10px', color: 'var(--muted-color)' }}>•</div>
          <div className="date" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="var(--muted-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formattedDate}
          </div>
          {story.genre && (
            <>
              <div className="divider" style={{ margin: '0 10px', color: 'var(--muted-color)' }}>•</div>
              <div className="genre" style={{ 
                background: 'rgba(0, 229, 255, 0.1)', 
                padding: '2px 8px', 
                borderRadius: '30px',
                fontSize: '0.8rem',
                color: 'var(--primary-color)',
                border: '1px solid rgba(0, 229, 255, 0.2)'
              }}>
                {story.genre}
              </div>
            </>
          )}
        </div>
        
        <div className="content-preview" style={{ 
          color: 'var(--text-color)',
          marginBottom: '15px',
          lineHeight: '1.6',
          position: 'relative'
        }}>
          {truncateContent(story.content)}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30px',
            background: 'linear-gradient(to top, var(--dark-surface), transparent)',
            pointerEvents: 'none'
          }}></div>
        </div>
        
        {story.tags && story.tags.length > 0 && (
          <div className="tags-container" style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '8px',
            marginBottom: '15px',
            overflowX: 'auto',
            paddingBottom: '5px'
          }}>
            {story.tags.map((tag: string, index: number) => (
              <span key={index} className="tag" style={{
                background: 'rgba(0, 229, 255, 0.05)',
                color: 'var(--primary-color)',
                padding: '3px 10px',
                borderRadius: '30px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(0, 229, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Футер карточки */}
      <div className="story-card-footer" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderTop: '1px solid rgba(0, 229, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div className="interactions" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="likes" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginRight: '15px',
            color: 'var(--secondary-color)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="var(--secondary-color)" fillOpacity="0.5" />
            </svg>
            {story.likes || 0}
          </div>
          
          <div className="views" style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'var(--text-color)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
              <path d="M12 6C15.79 6 19.17 8.13 20.82 11.5C19.17 14.87 15.79 17 12 17C8.21 17 4.83 14.87 3.18 11.5C4.83 8.13 8.21 6 12 6ZM12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 9C13.38 9 14.5 10.12 14.5 11.5C14.5 12.88 13.38 14 12 14C10.62 14 9.5 12.88 9.5 11.5C9.5 10.12 10.62 9 12 9ZM12 7C9.52 7 7.5 9.02 7.5 11.5C7.5 13.98 9.52 16 12 16C14.48 16 16.5 13.98 16.5 11.5C16.5 9.02 14.48 7 12 7Z" fill="var(--text-color)" fillOpacity="0.5" />
            </svg>
            {story.views || 0}
          </div>
        </div>
        
        {story.aiRating !== undefined && (
          <div 
            className={`ai-rating ${getRatingClass(story.aiRating)}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor" />
            </svg>
            <span>{story.aiRating.overallScore.toFixed(1)}</span>
          </div>
        )}
        
        <Link 
          to={`/stories/${story.id}`} 
          className="read-more-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 12px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
            color: 'var(--dark-bg)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(0, 229, 255, 0.3)',
            border: 'none'
          }}
        >
          Читать
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '5px' }}>
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default StoryCard; 