import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoryById, likeStory } from '../services/api';
import { Story, Comment } from '../types';
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
        <div className="container" style={{ padding: '20px' }}>
          <p>Загрузка истории...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '20px' }}>
          <div style={{ 
            padding: '20px', 
            background: '#ffecec', 
            color: '#721c24', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            <h3>Ошибка</h3>
            <p>{error || 'История не найдена'}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '20px' }}>
        <div className="card" style={{ marginBottom: '30px' }}>
          <div className="card-header">
            <h1>{story.title}</h1>
            <div className="story-meta">
              <span>Автор: {story.author?.username || 'Неизвестен'}</span>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
            
            {story.genre && (
              <div style={{ marginTop: '10px' }}>
                <span className="badge badge-secondary">{story.genre}</span>
              </div>
            )}
            
            {story.tags && story.tags.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {story.tags.map((tag, index) => (
                  <span key={index} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            )}
          </div>
          
          <div className="card-body">
            <div className="story-content">
              {story.content}
            </div>
          </div>
          
          <div className="card-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div 
                className="likes" 
                onClick={handleLike}
                style={{ cursor: 'pointer' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
                <span style={{ marginLeft: '5px', fontSize: '1.2rem' }}>{story.likes}</span>
              </div>
              
              {story.aiRating && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: story.aiRating.overallScore >= 8 
                    ? 'var(--success-color)' 
                    : story.aiRating.overallScore >= 5 
                      ? 'orange' 
                      : 'var(--danger-color)'
                }}>
                  Оценка ИИ: {story.aiRating.overallScore}/10
                </div>
              )}
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