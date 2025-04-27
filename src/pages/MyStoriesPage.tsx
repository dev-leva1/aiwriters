import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import { getUserStories } from '../services/api';
import { Story } from '../types';

const MyStoriesPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Редирект, если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  // Загрузка историй пользователя
  useEffect(() => {
    if (user) {
      const fetchStories = async () => {
        try {
          const userStories = await getUserStories(user.id);
          setStories(userStories);
        } catch (error) {
          console.error('Ошибка при загрузке историй:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStories();
    }
  }, [user]);
  
  if (isLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            border: '3px solid var(--dark-surface)',
            borderTopColor: 'var(--primary-color)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Загрузка историй...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p>Для просмотра историй необходимо <a href="/login" style={{ color: 'var(--primary-color)' }}>войти в систему</a>.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', margin: '30px auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            color: 'var(--primary-color)', 
            borderLeft: '4px solid var(--secondary-color)',
            paddingLeft: '10px',
            margin: 0
          }}>
            Мои истории
          </h2>
          <button 
            onClick={() => navigate('/create-story')} 
            className="btn btn-primary"
            style={{ 
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
              border: 'none',
              color: 'var(--dark-bg)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
            Создать историю
          </button>
        </div>
        
        {stories.length > 0 ? (
          <div>
            {stories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-surface-2) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 229, 255, 0.1)',
            borderRadius: '8px',
            padding: '3rem 2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              У вас пока нет опубликованных историй
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Напишите свою первую историю и получите оценку от искусственного интеллекта. 
              Наш ИИ проанализирует ваше произведение и даст подробную обратную связь.
            </p>
            <button 
              onClick={() => navigate('/create-story')} 
              className="btn btn-primary"
              style={{ 
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                border: 'none',
                color: 'var(--dark-bg)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
              </svg>
              Написать историю
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStoriesPage; 