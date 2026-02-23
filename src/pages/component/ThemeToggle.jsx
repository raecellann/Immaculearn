import React from 'react';
import { useSpaceTheme } from '../../contexts/theme/useSpaceTheme';
import './ThemeToggle.css';

const Switch = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useSpaceTheme();

  return (
    <button 
      className={`theme-toggle-btn ${className}`}
      onClick={() => toggleTheme()}
      style={{
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
        borderRadius: '20px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.3s ease',
        boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '60px',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = isDarkMode 
          ? '0 4px 8px rgba(0,0,0,0.4)' 
          : '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = isDarkMode 
          ? '0 2px 4px rgba(0,0,0,0.3)' 
          : '0 2px 4px rgba(0,0,0,0.1)';
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon for light mode */}
      <div 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isDarkMode ? '#9ca3af' : '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isDarkMode ? 'translateX(0)' : 'translateX(-12px)',
        }}
      >
        <span style={{ fontSize: '12px', color: isDarkMode ? '#4b5563' : '#f59e0b' }}>
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Moon icon for dark mode */}
      <div 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isDarkMode ? '#60a5fa' : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isDarkMode ? 'translateX(12px)' : 'translateX(0)',
        }}
      >
        <span style={{ fontSize: '12px', color: isDarkMode ? '#dbeafe' : '#9ca3af' }}>
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </div>
    </button>
  );
};

export default Switch;
