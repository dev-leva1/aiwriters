import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('posts');
  const [followers, setFollowers] = useState(Math.floor(Math.random() * 500));
  const [following, setFollowing] = useState(Math.floor(Math.random() * 200));
  const [likesCount, setLikesCount] = useState(0);
  
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
          
          // Подсчитываем общее количество лайков
          const totalLikes = userStories.reduce((sum, story) => sum + (story.likes || 0), 0);
          setLikesCount(totalLikes);
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
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            border: '3px solid rgba(29, 155, 240, 0.2)',
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
        <div className="container" style={{ 
          textAlign: 'center', 
          padding: '5rem 0',
          maxWidth: '500px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Профиль не найден</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Пожалуйста, войдите в систему, чтобы просмотреть свой профиль</p>
          <Link to="/login" className="btn btn-primary" style={{ 
            padding: '0.75rem 2rem',
            fontWeight: '700'
          }}>
            Войти
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Хедер профиля */}
        <div style={{ 
          position: 'relative',
          marginBottom: '72px'
        }}>
          {/* Фоновая обложка */}
          <div style={{ 
            height: '200px', 
            backgroundColor: 'var(--background-elevated)',
            borderRadius: '16px',
            marginBottom: '12px'
          }}></div>
          
          {/* Фото профиля */}
              <div style={{ 
            position: 'absolute',
            bottom: '-60px',
            left: '16px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
            backgroundColor: 'var(--background)',
            border: '4px solid var(--background)',
            overflow: 'hidden'
              }}>
                <img 
                  src={user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
          {/* Кнопка редактирования */}
              {!isEditing ? (
                  <button 
                    className="btn btn-outline"
                    onClick={handleEdit}
                    style={{ 
                position: 'absolute',
                top: '210px',
                right: '16px',
                padding: '8px 16px',
                fontWeight: '700',
                fontSize: '14px'
                    }}
                  >
                    Редактировать профиль
                  </button>
          ) : null}
        </div>
        
        {/* Основная информация профиля */}
        <div style={{ padding: '0 16px' }}>
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
                </div>
          )}
          
          {!isEditing ? (
            <div>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: '800',
                marginBottom: '4px'
              }}>
                {user.username}
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '15px',
                marginBottom: '12px'
              }}>
                @{user.username?.toLowerCase().replace(/\s+/g, '')}
              </p>
              
              {user.bio ? (
                <p style={{ 
                  fontSize: '15px',
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  {user.bio}
                </p>
              ) : (
                <p style={{ 
                  fontSize: '15px',
                  marginBottom: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  Информация о себе не указана
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Дата регистрации: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  {likesCount} лайков
                </div>
              </div>
              
              <div style={{ display: 'flex', marginBottom: '24px' }}>
                <div style={{ marginRight: '20px' }}>
                  <span style={{ fontWeight: '700' }}>{following}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>Подписки</span>
                </div>
                <div>
                  <span style={{ fontWeight: '700' }}>{followers}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>Подписчиков</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label htmlFor="username">
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
                    />
                  </div>
                  
              <div className="form-group">
                <label htmlFor="bio">
                      О себе
                    </label>
                    <textarea
                      id="bio"
                      className="form-control"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={isSaving}
                      placeholder="Расскажите о себе"
                  style={{ minHeight: '120px' }}
                    />
                  </div>
                  
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSaving}
                  style={{ flex: 1 }}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
          
          {/* Tabs */}
          <div style={{ 
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <div 
              onClick={() => setActiveTab('posts')}
              style={{ 
                flex: 1,
                textAlign: 'center', 
                padding: '16px 0',
                fontWeight: activeTab === 'posts' ? '700' : '400',
                color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'posts' ? '4px solid var(--primary-color)' : 'none',
                cursor: 'pointer'
              }}
            >
              Посты
            </div>
            <div 
              onClick={() => setActiveTab('likes')}
              style={{ 
                flex: 1,
                textAlign: 'center', 
                padding: '16px 0',
                fontWeight: activeTab === 'likes' ? '700' : '400',
                color: activeTab === 'likes' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'likes' ? '4px solid var(--primary-color)' : 'none',
                cursor: 'pointer'
              }}
            >
              Лайки
            </div>
            <div 
              onClick={() => setActiveTab('media')}
              style={{ 
                flex: 1,
                textAlign: 'center', 
                padding: '16px 0',
                fontWeight: activeTab === 'media' ? '700' : '400',
                color: activeTab === 'media' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'media' ? '4px solid var(--primary-color)' : 'none',
                cursor: 'pointer'
              }}
            >
              Медиа
            </div>
            </div>
            
          {/* Контент активного таба */}
          {activeTab === 'posts' && (
            <>
              {storiesLoading ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    border: '3px solid rgba(29, 155, 240, 0.2)',
                    borderTopColor: 'var(--primary-color)',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Загрузка постов...</p>
                </div>
              ) : stories.length > 0 ? (
                <div>
                  {stories.map(story => (
                    <div key={story.id} style={{ 
                      padding: '16px',
                      marginBottom: '16px',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        marginBottom: '12px' 
                      }}>
                        <div className="avatar" style={{ width: '48px', height: '48px', marginRight: '12px' }}>
                          <img src={user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', marginRight: '4px' }}>{user.username}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>@{user.username.toLowerCase().replace(/\s+/g, '')}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 4px' }}>·</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(story.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                            <Link to={`/stories/${story.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {story.title}
                            </Link>
                          </h3>
                          <div style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                            {story.content.substring(0, 120)}...
                          </div>
                          {story.genre && (
                            <div style={{ 
                              display: 'inline-block',
                              background: 'var(--primary-light)', 
                              padding: '2px 10px', 
                              borderRadius: '9999px',
                              fontSize: '14px',
                              color: 'var(--primary-color)',
                              marginBottom: '12px'
                            }}>
                              {story.genre}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                {story.comments?.length || 0}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                  <path d="M17 2l4 4-4 4"></path>
                                  <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                                  <path d="M7 22l-4-4 4-4"></path>
                                  <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                {story.reposts || 0}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                                {story.likes || 0}
                              </div>
                            </div>
                            {story.aiRating && (
                              <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                                color: story.aiRating.overallScore >= 3.5 ? 'var(--primary-color)' : 'var(--text-secondary)'
                          }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                                <span>
                                  {story.aiRating.overallScore.toFixed(1)}
                          </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/create-story" style={{ 
                    display: 'block',
                    textAlign: 'center',
                    padding: '16px',
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                    fontWeight: '600',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    Написать новую историю
                  </Link>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px 0',
                  color: 'var(--text-secondary)'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: '0.5' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Нет опубликованных историй</h3>
                  <p style={{ marginBottom: '24px' }}>Ваши опубликованные истории будут отображаться здесь</p>
                  <Link to="/create-story" className="btn btn-primary" style={{ 
                    padding: '12px 24px',
                    fontWeight: '700'
                  }}>
                    Написать историю
                  </Link>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'likes' && (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0',
              color: 'var(--text-secondary)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: '0.5' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Понравившиеся посты</h3>
              <p>Здесь будут отображаться истории, которые вам понравились</p>
            </div>
          )}
          
          {activeTab === 'media' && (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0',
              color: 'var(--text-secondary)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: '0.5' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Медиа</h3>
              <p>Здесь будут отображаться ваши посты с изображениями</p>
            </div>
          )}
        </div>
        
        {/* Блок рекомендаций */}
        <div style={{ 
          marginTop: '32px',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            fontWeight: '800',
            fontSize: '20px'
          }}>
            Кого читать
          </div>
          {[
            { name: 'Александр Пушкин', username: 'pushkin', followers: 12583 },
            { name: 'Федор Достоевский', username: 'dostoevsky', followers: 8742 },
            { name: 'Лев Толстой', username: 'tolstoy', followers: 9651 }
          ].map((profile, index) => (
            <div key={index} style={{ 
              padding: '16px',
              borderBottom: index < 2 ? '1px solid var(--border-color)' : 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div className="avatar" style={{ width: '48px', height: '48px', marginRight: '12px' }}>
                <img src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${profile.username}`} alt={profile.name} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700' }}>{profile.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>@{profile.username}</div>
              </div>
              <button className="btn btn-outline" style={{ 
                padding: '8px 16px',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                Читать
              </button>
            </div>
          ))}
          <div style={{ padding: '16px' }}>
            <Link to="/" style={{ 
              color: 'var(--primary-color)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Показать больше
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 