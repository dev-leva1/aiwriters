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
      <Link to="/" className="navbar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
        AI Writers
      </Link>
      
      <div className="navbar-nav">
        <div className="nav-item">
          <Link to="/" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </Link>
        </div>
        
        {isAuthenticated ? (
          <>
            <div className="nav-item">
              <Link to="/create-story" className="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </Link>
            </div>
            
            <div className="nav-item dropdown">
              <div 
                onClick={toggleDropdown} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer' 
                }}
              >
                <div className="avatar">
                  <img src={user?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=default'} alt="Аватар" />
                </div>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Мой профиль
                  </Link>
                  <Link to="/my-stories" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Мои истории
                  </Link>
                  <div className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
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
                  padding: '0.5rem 1.2rem',
                  fontWeight: '700',
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