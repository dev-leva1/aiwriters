import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getUserStories } from '../services/api';
import { Story } from '../types';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, updateProfile, error } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Редирект, если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  // Инициализация данных профиля
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
    }
  }, [user]);
  
  // Загрузка историй пользователя
  useEffect(() => {
    if (user) {
      const fetchStories = async () => {
        try {
          const userStories = await getUserStories(user.id);
          setStories(userStories);
        } catch (err) {
          console.error('Ошибка при загрузке историй:', err);
        } finally {
          setStoriesLoading(false);
        }
      };
      
      fetchStories();
    }
  }, [user]);
  
  // Обработка ошибок
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
    }
    setIsEditing(false);
    setErrorMessage('');
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    // Валидация
    if (!username.trim()) {
      setErrorMessage('Имя пользователя не может быть пустым');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updateProfile({
        username,
        bio: bio.trim() ? bio : undefined
      });
      
      setIsEditing(false);
      setErrorMessage('');
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
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
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Загрузка профиля...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p>Пользователь не найден. Пожалуйста, <a href="/login" style={{ color: 'var(--primary-color)' }}>войдите в систему</a>.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', margin: '30px auto' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-surface-2) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 229, 255, 0.1)',
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid var(--primary-color)',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              color: 'var(--primary-color)', 
              margin: 0,
              textShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
            }}>
              Мой профиль
            </h2>
          </div>
          
          <div className="card-body" style={{ padding: '2rem' }}>
            {errorMessage && (
              <div className="error-message" style={{ 
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(244, 67, 54, 0.1)',
                borderLeft: '4px solid var(--danger-color)',
                color: 'var(--danger-color)',
                borderRadius: '4px'
              }}>
                {errorMessage}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--primary-color)',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                marginBottom: '1rem'
              }}>
                <img 
                  src={user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              {!isEditing ? (
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    {user.username}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    maxWidth: '500px',
                    margin: '0 auto 1.5rem'
                  }}>
                    {user.bio || 'Информация о себе не указана'}
                  </p>
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ marginRight: '5px' }}>Email:</span>
                    <span style={{ color: 'var(--primary-color)' }}>{user.email}</span>
                  </p>
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                  }}>
                    <span style={{ marginRight: '5px' }}>Дата регистрации:</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </p>
                  <button 
                    className="btn btn-outline"
                    onClick={handleEdit}
                    style={{ 
                      padding: '0.5rem 1.5rem',
                      border: '2px solid var(--primary-color)',
                      borderRadius: '30px',
                      background: 'transparent',
                      color: 'var(--primary-color)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Редактировать профиль
                  </button>
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '500px' }}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="username" style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'var(--primary-color)',
                      fontWeight: 'bold'
                    }}>
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSaving}
                      placeholder="Введите имя пользователя"
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--dark-surface-2)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.3s ease',
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="bio" style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'var(--primary-color)',
                      fontWeight: 'bold'
                    }}>
                      О себе
                    </label>
                    <textarea
                      id="bio"
                      className="form-control"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={isSaving}
                      placeholder="Расскажите о себе"
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--dark-surface-2)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.3s ease',
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{ 
                        padding: '0.5rem 1.5rem',
                        borderRadius: '30px',
                        background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                        border: 'none',
                        color: 'var(--dark-bg)',
                        fontWeight: 'bold',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1
                      }}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      style={{ 
                        padding: '0.5rem 1.5rem',
                        borderRadius: '30px',
                        background: 'transparent',
                        border: '2px solid var(--primary-color)',
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                color: 'var(--primary-color)', 
                borderLeft: '4px solid var(--secondary-color)',
                paddingLeft: '10px',
                marginBottom: '1.5rem'
              }}>
                Последние истории
              </h3>
              
              {storiesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    border: '3px solid var(--dark-surface)',
                    borderTopColor: 'var(--primary-color)',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Загрузка историй...</p>
                </div>
              ) : stories.length > 0 ? (
                <div>
                  {stories.slice(0, 3).map(story => (
                    <div key={story.id} style={{ 
                      padding: '1rem',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      background: 'var(--dark-surface-2)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        <a href={`/stories/${story.id}`} style={{ 
                          color: 'var(--primary-color)',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease'
                        }}>
                          {story.title}
                        </a>
                      </h4>
                      <p style={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        {new Date(story.createdAt).toLocaleDateString('ru-RU')}
                        {story.genre && (
                          <span style={{ 
                            marginLeft: '10px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '30px',
                            fontSize: '0.8rem',
                            color: 'var(--primary-color)'
                          }}>
                            {story.genre}
                          </span>
                        )}
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {story.content.substring(0, 100)}...
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-secondary)',
                            marginRight: '15px',
                            fontSize: '0.9rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
                              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="var(--secondary-color)" fillOpacity="0.5" />
                            </svg>
                            {story.likes}
                          </span>
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
                              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" fill="var(--text-secondary)" fillOpacity="0.5" />
                            </svg>
                            {story.comments.length}
                          </span>
                        </div>
                        <a href={`/stories/${story.id}`} style={{ 
                          color: 'var(--primary-color)',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          Читать
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '5px' }}>
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="var(--primary-color)" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                  {stories.length > 3 && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                      <a href="/my-stories" style={{ 
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        Смотреть все истории
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '5px' }}>
                          <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="var(--primary-color)" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 0',
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ marginBottom: '1rem' }}>У вас пока нет опубликованных историй.</p>
                  <a href="/create-story" style={{ 
                    display: 'inline-block',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '30px',
                    background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                    color: 'var(--dark-bg)',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}>
                    Написать историю
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 