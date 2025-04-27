import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CreateStoryPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Пожалуйста, заполните название и содержание истории');
      return;
    }
    
    if (!user) {
      setError('Вы должны быть авторизованы для публикации историй');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const newStory = await createStory({
        title,
        content,
        authorId: user.id,
        genre: genre || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });
      
      navigate(`/stories/${newStory.id}`);
    } catch (error) {
      console.error('Failed to create story:', error);
      setError('Произошла ошибка при создании истории. Пожалуйста, попробуйте еще раз.');
      setIsSubmitting(false);
    }
  };

  // Жанры для выбора
  const genres = [
    'Фантастика',
    'Фэнтези',
    'Детектив',
    'Триллер',
    'Ужасы',
    'Романтика',
    'Приключения',
    'Исторический',
    'Научно-популярный',
    'Юмор',
    'Драма',
    'Другое'
  ];

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '20px' }}>
        <div className="card" style={{ 
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-surface-2) 100%)'
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid var(--primary-color)',
            background: 'var(--dark-surface-2)',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              color: 'var(--primary-color)', 
              textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
              borderLeft: '4px solid var(--secondary-color)',
              paddingLeft: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '10px' }}
              >
                <path 
                  d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM13 17H7V15H13V17ZM17 9H7V7H17V9Z" 
                  fill="var(--primary-color)" 
                />
              </svg>
              Создать новую историю
            </h2>
          </div>
          <div className="card-body" style={{ padding: '2rem' }}>
            {error && (
              <div className="error-message" style={{ 
                padding: '15px', 
                background: 'rgba(244, 67, 54, 0.1)', 
                border: 'none',
                borderLeft: '4px solid var(--danger-color)', 
                color: 'var(--danger-color)', 
                borderRadius: '4px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '10px' }}
                >
                  <path 
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" 
                    fill="var(--danger-color)" 
                  />
                </svg>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title" style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary-color)', 
                  marginBottom: '8px',
                  display: 'block'
                }}>Название</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название истории"
                  required
                  style={{ 
                    background: 'var(--dark-surface-2)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 15px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="genre" style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary-color)', 
                  marginBottom: '8px',
                  display: 'block'
                }}>Жанр</label>
                <select
                  id="genre"
                  className="form-control"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{ 
                    background: 'var(--dark-surface-2)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 15px',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%2300e5ff'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center'
                  }}
                >
                  <option value="">Выберите жанр</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags" style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary-color)', 
                  marginBottom: '8px',
                  display: 'block'
                }}>Теги (через запятую)</label>
                <input
                  type="text"
                  id="tags"
                  className="form-control"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="любовь, приключения, магия"
                  style={{ 
                    background: 'var(--dark-surface-2)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 15px'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content" style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary-color)', 
                  marginBottom: '8px',
                  display: 'block'
                }}>Содержание</label>
                <textarea
                  id="content"
                  className="form-control"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Начните писать свою историю здесь..."
                  required
                  style={{ 
                    minHeight: '350px',
                    background: 'var(--dark-surface-2)',
                    border: '1px solid var(--border-color)',
                    padding: '15px',
                    lineHeight: '1.6',
                    boxShadow: 'inset 0 1px 5px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
              
              <div style={{ 
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '15px'
              }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ 
                    padding: '12px 25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="var(--dark-bg)" />
                        <path d="M12 11L12 7" stroke="var(--dark-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <animateTransform 
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 12 12"
                            to="360 12 12"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                      Публикация...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="var(--dark-bg)" />
                      </svg>
                      Опубликовать
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                  style={{ 
                    padding: '12px 25px',
                    borderRadius: '30px',
                    border: '2px solid var(--primary-color)',
                    background: 'transparent',
                    color: 'var(--primary-color)',
                    fontWeight: 'bold'
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryPage; 