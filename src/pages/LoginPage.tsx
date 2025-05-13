import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Пожалуйста, заполните все поля');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // Ошибка уже обрабатывается в контексте аутентификации
      console.error('Ошибка при входе:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      minHeight: '100vh'
    }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '400px', margin: '40px auto' }}>
        <div style={{ 
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '24px 16px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              Вход в AI Writers
            </h2>
          </div>
          
          <div style={{ padding: '0 32px 32px' }}>
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" style={{ color: 'var(--text-secondary)' }}>
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
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--input-border)'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" style={{ color: 'var(--text-secondary)' }}>
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Введите ваш пароль"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--input-border)'
                  }}
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  marginTop: '8px',
                  backgroundColor: 'var(--accent-color)'
                }}
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)' }}>
                Еще нет аккаунта?{' '}
                <Link to="/register" style={{ 
                  color: 'var(--accent-color)',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 