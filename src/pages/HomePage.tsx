import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../types';
import { getStories } from '../services/api';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';

const HomePage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getStories();
        // Сортировка по рейтингу и дате
        const sortedStories = [...data].sort((a, b) => {
          // Если у обоих есть рейтинг, сортируем по нему
          if (a.aiRating && b.aiRating) {
            return b.aiRating.overallScore - a.aiRating.overallScore;
          }
          // Если только у одного есть рейтинг, он идет первым
          if (a.aiRating) return -1;
          if (b.aiRating) return 1;
          // Если ни у одного нет рейтинга, сортируем по дате
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setStories(sortedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="hero-section">
          <h1>AI Writers</h1>
          <p>
            Платформа, где искусственный интеллект оценивает ваше творчество. Пишите рассказы, получайте критическую оценку от ИИ и совершенствуйте свой талант.
          </p>
          <Link to="/create-story" className="hero-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Начать писать
          </Link>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-color)' 
        }}>
          <h2 style={{ 
            margin: 0,
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--text-primary)' 
          }}>
            Высокооцененные работы
          </h2>
          
          <span style={{ 
            marginLeft: 'auto',
            color: 'var(--primary-color)',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            Показать все
          </span>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '3px solid rgba(29, 155, 240, 0.2)',
              borderTopColor: 'var(--primary-color)',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div>
            {stories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '24px', 
                textAlign: 'center', 
                border: '1px solid var(--border-color)', 
                borderRadius: '16px',
                backgroundColor: 'var(--background-light)'
              }}>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>Пока нет опубликованных историй.</p>
                <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Станьте первым автором на платформе!</p>
                <Link to="/create-story" className="btn btn-primary">
                  Создать историю
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 