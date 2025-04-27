import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AI Writers</Link>
      
      <div className="navbar-nav">
        <div className="nav-item">
          <Link to="/" className="nav-link">Главная</Link>
        </div>
        
        {isAuthenticated ? (
          <>
            <div className="nav-item">
              <Link to="/create-story" className="nav-link">Написать историю</Link>
            </div>
            
            <div className="nav-item dropdown" style={{ position: 'relative' }}>
              <div 
                onClick={toggleDropdown} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer' 
                }}
              >
                <div className="avatar" style={{ marginRight: '8px' }}>
                  <img src={user?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=default'} alt="Аватар" />
                </div>
                <span style={{ 
                  marginRight: '5px',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}>
                  {user?.username || 'Пользователь'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="var(--text-primary)" />
                </svg>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.15 19.25 6.86 18.05C6.6 17.81 6.5 17.44 6.61 17.11C7.2 15.4 8.97 14 12 14C15.03 14 16.8 15.4 17.39 17.11C17.5 17.44 17.4 17.81 17.14 18.05C15.85 19.25 14.03 20 12 20Z" fill="var(--text-primary)" />
                    </svg>
                    Мой профиль
                  </Link>
                  <Link to="/my-stories" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM13 17H7V15H13V17ZM17 9H7V7H17V9Z" fill="var(--text-primary)" />
                    </svg>
                    Мои истории
                  </Link>
                  <div className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="var(--danger-color)" />
                    </svg>
                    <span style={{ color: 'var(--danger-color)' }}>Выйти</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="nav-item">
              <Link to="/login" className="nav-link">Войти</Link>
            </div>
            <div className="nav-item">
              <Link 
                to="/register" 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.5rem 1rem',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0, 229, 255, 0.2)'
                }}
              >
                Регистрация
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 