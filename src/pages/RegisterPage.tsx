import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Редирект, если пользователь уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Обработка ошибок аутентификации
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      clearError();
    }
  }, [error, clearError]);
  
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Пожалуйста, заполните все поля');
      return;
    }
    
    if (username.length < 3) {
      setErrorMessage('Имя пользователя должно содержать минимум 3 символа');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Пожалуйста, введите корректный email адрес');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await register({ username, email, password });
      navigate('/');
    } catch (err) {
      // Ошибка уже обрабатывается в контексте аутентификации
      console.error('Ошибка при регистрации:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: '500px', margin: '30px auto' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-surface-2) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 229, 255, 0.1)',
        }}>
          <div className="card-header" style={{ 
            textAlign: 'center', 
            borderBottom: '2px solid var(--primary-color)',
            padding: '1.25rem'
          }}>
            <h2 style={{ 
              color: 'var(--primary-color)', 
              margin: 0,
              textShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
            }}>
              Регистрация
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
            
            <form onSubmit={handleSubmit}>
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
                  disabled={isSubmitting}
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
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: 'var(--primary-color)',
                  fontWeight: 'bold'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Введите ваш email"
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
                <label htmlFor="password" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: 'var(--primary-color)',
                  fontWeight: 'bold'
                }}>
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Минимум 6 символов"
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
                <label htmlFor="confirmPassword" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: 'var(--primary-color)',
                  fontWeight: 'bold'
                }}>
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Повторите пароль"
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
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                  border: 'none',
                  borderRadius: '30px',
                  color: 'var(--dark-bg)',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                Уже есть аккаунт?{' '}
                <Link to="/login" style={{ 
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>
                  Войти
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 