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
            Начать писать
          </Link>
        </div>

        <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)', borderLeft: '4px solid var(--secondary-color)', paddingLeft: '15px' }}>
          Высокооцененные работы
        </h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              border: '3px solid var(--dark-surface)',
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
              stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))
            ) : (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Пока нет опубликованных историй.</p>
                  <p>Станьте первым автором на платформе!</p>
                  <Link to="/create-story" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Создать историю
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 