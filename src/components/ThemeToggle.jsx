import React from 'react';
import { useSpaceTheme } from '../contexts/theme/useSpaceTheme';

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={{
        backgroundColor: currentColors.accent,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = isDarkMode 
          ? '0 4px 12px rgba(0,0,0,0.4)' 
          : '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = isDarkMode 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 4px rgba(0,0,0,0.1)';
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <>
          <span style={{ fontSize: '18px' }}>☀️</span>
          <span>Light</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '18px' }}>🌙</span>
          <span>Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
