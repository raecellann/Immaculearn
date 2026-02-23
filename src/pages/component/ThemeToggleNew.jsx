import React from 'react';
import { useSpaceTheme } from '../../contexts/theme/useSpaceTheme';

const Switch = () => {
  const { isDarkMode, toggleTheme } = useSpaceTheme();

  const containerStyle = {
    padding: '8px',
  };

  const toggleStyle = {
    backgroundColor: isDarkMode ? '#f3f4f6' : '#ffffff',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 50px 20px rgba(0, 0, 0, 0.1)',
    lineHeight: '1',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
    margin: '0 8px 8px 8px',
    position: 'relative',
  };

  const iconStyle = {
    gridColumn: '1 / 1',
    gridRow: '1 / 1',
    transition: 'transform 500ms',
    lineHeight: '0.1',
  };

  const moonStyle = {
    ...iconStyle,
    transitionDelay: '200ms',
    color: isDarkMode ? '#fbbf24' : '#6b7280',
    transform: isDarkMode ? 'scale(0)' : 'scale(1)',
  };

  const sunStyle = {
    ...iconStyle,
    color: isDarkMode ? '#f59e0b' : '#fbbf24',
    transform: isDarkMode ? 'scale(1)' : 'scale(0)',
  };

  return (
    <div style={containerStyle}>
      <label htmlFor="switch" style={toggleStyle}>
        <input 
          type="checkbox" 
          style={{ display: 'none' }}
          id="switch" 
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <div className="icon icon--moon" style={moonStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={32} height={32}>
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="icon icon--sun" style={sunStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={32} height={32}>
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </div>
      </label>
    </div>
  );
};

export default Switch;
