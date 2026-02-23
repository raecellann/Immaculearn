import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpaceThemeContextType, ThemeColors } from './SpaceThemeContext';

const SpaceThemeContext = createContext<SpaceThemeContextType | undefined>(undefined);

export const useSpaceTheme = () => {
  const context = useContext(SpaceThemeContext);
  if (!context) {
    throw new Error('useSpaceTheme must be used within a SpaceThemeProvider');
  }
  return context;
};

interface SpaceThemeProviderProps {
  children: React.ReactNode;
}

export const SpaceThemeProvider: React.FC<SpaceThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode as requested
    return true;
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme: SpaceThemeContextType = {
    isDarkMode,
    toggleTheme,
    colors: {
      dark: {
        background: '#1e242e',
        surface: '#2d3748',
        border: '#4a5568',
        text: '#e2e8f0',
        textSecondary: '#a0aec0',
        accent: '#3b82f6',
        hover: '#374151',
      },
      light: {
        background: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        text: '#1a202c',
        textSecondary: '#4a5568',
        accent: '#3b82f6',
        hover: '#f1f5f9',
      }
    }
  };

  return (
    <SpaceThemeContext.Provider value={theme}>
      {children}
    </SpaceThemeContext.Provider>
  );
};