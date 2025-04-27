import React, { useEffect, useState } from 'react';
import { getStories } from '../services/api';
import { Story } from '../types';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getStories();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Фильтрация и сортировка историй
  const filteredAndSortedStories = React.useMemo(() => {
    // Сначала фильтруем
    let result = stories.filter(story => {
      const searchTerms = filter.toLowerCase().trim().split(' ');
      
      // Проверяем соответствие хотя бы одному термину поиска
      return searchTerms.some(term => {
        if (!term) return true;
        return (
          story.title.toLowerCase().includes(term) ||
          story.content.toLowerCase().includes(term) ||
          (story.genre && story.genre.toLowerCase().includes(term)) ||
          (story.tags && story.tags.some(tag => tag.toLowerCase().includes(term)))
        );
      });
    });
    
    // Затем сортируем
    return result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'rating') {
        const ratingA = a.aiRating?.overallScore || 0;
        const ratingB = b.aiRating?.overallScore || 0;
        return ratingB - ratingA;
      } else if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return 0;
    });
  }, [stories, filter, sortBy]);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>Все истории</h1>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ marginBottom: '10px', minWidth: '200px', flex: 1, marginRight: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Поиск по названию, содержанию или тегам"
            />
          </div>
          
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <label htmlFor="sortBy" style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>Сортировать по:</label>
            <select
              id="sortBy"
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Дате (сначала новые)</option>
              <option value="rating">Рейтингу ИИ</option>
              <option value="likes">Количеству лайков</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <p>Загрузка историй...</p>
        ) : (
          <div>
            {filteredAndSortedStories.length > 0 ? (
              filteredAndSortedStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))
            ) : (
              <p>Историй не найдено.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage; 