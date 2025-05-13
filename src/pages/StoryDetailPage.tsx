import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoryById, likeStory } from '../services/api';
import { Story, Comment, Attachment } from '../types';
import Navbar from '../components/Navbar';
import AIFeedback from '../components/AIFeedback';
import CommentSection from '../components/CommentSection';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      
      try {
        const data = await getStoryById(id);
        if (data) {
          setStory(data);
        } else {
          setError('История не найдена');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Произошла ошибка при загрузке истории');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  // Функция для форматирования контента истории
  const formatContent = (content: string): string => {
    let formattedContent = content;
    
    // Жирный текст
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Курсив
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Заголовки
    formattedContent = formattedContent.replace(/#{3}(.*?)\n/g, '<h3>$1</h3>');
    formattedContent = formattedContent.replace(/#{2}(.*?)\n/g, '<h2>$1</h2>');
    formattedContent = formattedContent.replace(/#{1}(.*?)\n/g, '<h1>$1</h1>');
    
    // Ссылки
    formattedContent = formattedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Код
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code style="background-color: var(--bg-secondary); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>');
    
    // Списки
    formattedContent = formattedContent.replace(/^- (.*?)$/gm, '<li>$1</li>');
    formattedContent = formattedContent.replace(/(<li>.*?<\/li>)\n(<li>)/g, '$1$2');
    formattedContent = formattedContent.replace(/(<li>.*?<\/li>)(?!\n<li>)/g, '<ul>$1</ul>');
    
    // Параграфы
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return `<p>${formattedContent}</p>`;
  };

  const handleLike = async () => {
    if (!story) return;
    
    try {
      const updatedStory = await likeStory(story.id);
      if (updatedStory) {
        setStory(updatedStory);
      }
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    if (story) {
      setStory({
        ...story,
        comments: [...story.comments, newComment]
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="var(--accent-color)" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0">
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Загрузка истории...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <div style={{ 
            padding: '20px', 
            background: 'rgba(244, 33, 46, 0.1)', 
            color: 'var(--danger-color)', 
            borderRadius: '16px', 
            marginBottom: '20px',
            border: '1px solid var(--danger-color)'
          }}>
            <h3>Ошибка</h3>
            <p>{error || 'История не найдена'}</p>
            <Link to="/" style={{ 
              display: 'inline-block',
              marginTop: '15px',
              padding: '10px 20px',
              background: 'var(--accent-color)',
              color: 'white',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем наличие прикрепленных изображений
  const hasAttachments = story.attachments && story.attachments.length > 0;
  
  // Определяем количество вложений
  const attachmentsCount = story.attachments?.length || 0;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Шапка с автором */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '15px 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ 
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginRight: '15px'
          }}>
            <img 
              src={story.author?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=default'} 
              alt={story.author?.username || 'Автор'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
              {story.author?.username || 'Неизвестный автор'}
            </div>
            <div style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>@{story.author?.username?.toLowerCase().replace(/\s+/g, '') || 'user'}</span>
              <span>•</span>
              <span>{new Date(story.createdAt).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
        
        {/* Контент истории */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>{story.title}</h1>
          
          <div 
            className="story-content"
            style={{ 
              color: 'var(--text-primary)',
              fontSize: '18px',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}
            dangerouslySetInnerHTML={{ __html: formatContent(story.content) }}
          />
          
          {/* Вложения */}
          {hasAttachments && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: attachmentsCount === 1 ? '1fr' : attachmentsCount === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
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
          
          {/* Жанр и теги */}
          <div style={{ marginBottom: '20px' }}>
            {story.genre && (
              <div style={{ 
                display: 'inline-block',
                background: 'var(--primary-light)', 
                padding: '5px 15px', 
                borderRadius: '9999px',
                fontSize: '14px',
                color: 'var(--accent-color)',
                marginBottom: '10px',
                marginRight: '10px',
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
                marginTop: '10px'
              }}>
                {story.tags.map((tag, index) => (
                  <span key={index} style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Взаимодействия */}
          <div style={{ 
            display: 'flex', 
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginRight: '20px', 
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'color 0.2s ease'
              }}
              onClick={handleLike}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger-color)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span style={{ marginLeft: '5px' }}>{story.likes}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', color: 'var(--text-secondary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span style={{ marginLeft: '5px' }}>{story.comments.length}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', color: 'var(--text-secondary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 2l4 4-4 4"></path>
                <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                <path d="M7 22l-4-4 4-4"></path>
                <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
              </svg>
              <span style={{ marginLeft: '5px' }}>{story.reposts || 0}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span style={{ marginLeft: '5px' }}>{story.views || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Секция с оценкой ИИ */}
        <AIFeedback aiRating={story.aiRating} />
        
        {/* Секция комментариев */}
        <div style={{ marginTop: '30px' }}>
          <CommentSection 
            comments={story.comments} 
            storyId={story.id} 
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage; 