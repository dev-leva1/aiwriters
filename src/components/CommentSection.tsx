import React, { useState } from 'react';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { addComment } from '../services/api';

interface CommentSectionProps {
  comments: Comment[];
  storyId: string;
  onCommentAdded: (newComment: Comment) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, storyId, onCommentAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !isAuthenticated || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newComment = await addComment(storyId, {
        content: commentText,
        authorId: user.id,
        storyId,
        isAI: false
      });
      
      onCommentAdded(newComment);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Комментарии ({comments.length})</h3>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <textarea
              className="form-control"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишите свой комментарий..."
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !commentText.trim()}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      ) : (
        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Войдите, чтобы оставить комментарий</p>
      )}
      
      <div>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`card ${comment.isAI ? 'ai-comment' : ''}`}
              style={{ marginBottom: '10px' }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="avatar" style={{ marginRight: '10px' }}>
                    <img 
                      src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${comment.authorId}`}
                      alt="Avatar" 
                    />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{comment.isAI ? 'ИИ Критик' : comment.author?.username || 'Пользователь'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Комментариев пока нет</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 