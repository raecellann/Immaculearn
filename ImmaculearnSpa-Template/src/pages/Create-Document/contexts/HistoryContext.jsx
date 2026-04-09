import React, { createContext, useContext, useState, useCallback } from 'react';

const HistoryContext = createContext();

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Add a new history entry
  const addToHistory = useCallback((content, metadata = {}) => {
    const timestamp = new Date();
    const entry = {
      id: Date.now() + Math.random(),
      content,
      timestamp,
      ...metadata
    };

    setHistory(prev => {
      // Remove any entries after current index (when undoing and then making new changes)
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new entry
      newHistory.push(entry);
      // Limit history to 50 entries to prevent memory issues
      if (newHistory.length > 50) {
        return newHistory.slice(-50);
      }
      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  // Revert to a specific history entry
  const revertToHistory = useCallback((historyId) => {
    const entryIndex = history.findIndex(item => item.id === historyId);
    if (entryIndex !== -1) {
      setCurrentIndex(entryIndex);
      return history[entryIndex];
    }
    return null;
  }, [history]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Get current history entry
  const getCurrentEntry = useCallback(() => {
    return currentIndex >= 0 && currentIndex < history.length 
      ? history[currentIndex] 
      : null;
  }, [currentIndex, history]);

  // Check if can undo/redo
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const value = {
    history,
    currentIndex,
    addToHistory,
    revertToHistory,
    undo,
    redo,
    clearHistory,
    getCurrentEntry,
    canUndo,
    canRedo
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryProvider;
