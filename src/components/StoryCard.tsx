import React from 'react';
import { Link } from 'react-router-dom';
import { Story, AIRating, Attachment } from '../types';

interface StoryCardProps {
  story: Story & {
    aiGenerated?: boolean;
    views?: number;
    reposts?: number;
  };
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  // Определяет класс для рейтинга в зависимости от значения
  const getRatingClass = (score: AIRating | undefined): string => {
    if (!score) return '';
    const overallScore = score.overallScore;
    if (overallScore >= 4.5) return 'text-success';
    if (overallScore >= 3.5) return 'text-primary';
    if (overallScore >= 2.5) return '';
    if (overallScore >= 1.5) return 'text-warning';
    return 'text-danger';
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
  const truncateContent = (content: string, maxLength = 280) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Форматирование контента для отображения с базовой разметкой
  const formatContent = (content: string): string => {
    let formattedContent = content;
    
    // Заменяем **текст** на <strong>текст</strong> для жирного текста
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Заменяем *текст* на <em>текст</em> для курсива
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Скрываем другие виды форматирования Markdown, чтобы они не отображались в карточке
    formattedContent = formattedContent
      .replace(/#{1,3}\s(.*?)\n/g, '$1')  // Удаляем заголовки
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')  // Ссылки показываем только текст
      .replace(/`([^`]+)`/g, '$1');  // Код показываем как обычный текст

    return truncateContent(formattedContent);
  };

  // Проверяем наличие прикрепленных изображений
  const hasAttachments = story.attachments && story.attachments.length > 0;
  
  // Получаем количество вложений или 0, если их нет
  const attachmentsCount = story.attachments?.length || 0;

  return (
    <div className="story-card" style={{ 
      border: '1px solid var(--border-color)', 
      borderRadius: '16px', 
      padding: '16px', 
      marginBottom: '16px',
      backgroundColor: 'var(--card-bg)'
    }}>
      <div className="story-card-header">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div className="avatar" style={{ width: '48px', height: '48px', marginRight: '12px' }}>
            <img src={story.author?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=default'} alt={story.author?.username || 'Автор'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: '700' }}>{story.author?.username || 'Неизвестный автор'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>@{story.author?.username?.toLowerCase().replace(/\s+/g, '') || 'user'}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {story.aiGenerated && (
              <div style={{
                background: 'var(--primary-light)',
                color: 'var(--accent-color)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                AI
              </div>
            )}
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{formattedDate}</div>
          </div>
        </div>
        
        <Link to={`/stories/${story.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="story-card-title" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: 'var(--text-primary)'
          }}>
            {story.title}
          </h3>
        </Link>
      </div>
      
      <div className="story-card-body">
        <Link to={`/stories/${story.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ 
            color: 'var(--text-primary)',
            marginBottom: '15px',
            lineHeight: '1.5'
          }}
          dangerouslySetInnerHTML={{ __html: formatContent(story.content) }}>
          </div>
        </Link>
        
        {hasAttachments && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: attachmentsCount === 1 ? '1fr' : attachmentsCount === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: '8px',
            marginBottom: '15px',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {story.attachments?.map((attachment: Attachment, index: number) => (
              <div key={index} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden' }}>
                {attachment.type === 'image' ? (
                  <img src={attachment.url} alt="Изображение к истории" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {story.genre && (
          <div style={{ 
            display: 'inline-block',
            background: 'var(--primary-light)', 
            padding: '5px 15px', 
            borderRadius: '9999px',
            fontSize: '14px',
            color: 'var(--accent-color)',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {story.genre}
          </div>
        )}
        
        {story.tags && story.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '15px'
          }}>
            {story.tags.map((tag: string, index: number) => (
              <span key={index} className="tag" style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="story-card-footer" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '15px',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            {story.comments ? story.comments.length : 0}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            {story.likes || 0}
          </div>
          
          {story.views !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              {story.views}
            </div>
          )}
        </div>
        
        {story.aiRating && (
          <div className={`rating ${getRatingClass(story.aiRating)}`}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              padding: '5px 10px',
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-color)" stroke="var(--accent-color)" strokeWidth="2" style={{ marginRight: '5px' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {story.aiRating.overallScore.toFixed(1)}/10
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard; 