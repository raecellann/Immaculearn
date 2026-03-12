import React, { useState } from 'react';
import { FiClock, FiRotateCcw, FiRotateCw, FiTrash2, FiUser, FiFileText, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useHistory } from '../contexts/HistoryContext';
import { useTheme } from '../contexts/ThemeContext';

const HistoryPanel = ({ isOpen, onClose, onRevert, isSidebar = false }) => {
  const { history, currentIndex, canUndo, canRedo, undo, redo, clearHistory } = useHistory();
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [expandedGroups, setExpandedGroups] = useState({});

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Check if it's this week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // Otherwise return month and year
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Group history by date and then by author
  const groupHistoryByDateAndAuthor = () => {
    const grouped = {};
    
    history.forEach((entry, index) => {
      const dateKey = formatDate(entry.timestamp);
      // Use the author name from entry, provide shorter fallback
      const author = entry.author || entry.userName || 'Anonymous User';
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      
      if (!grouped[dateKey][author]) {
        grouped[dateKey][author] = [];
      }
      
      grouped[dateKey][author].push({
        ...entry,
        index,
        isCurrent: index === currentIndex
      });
    });
    
    return grouped;
  };

  const toggleGroup = (dateKey, author) => {
    const groupKey = `${dateKey}-${author}`;
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const isGroupExpanded = (dateKey, author) => {
    const groupKey = `${dateKey}-${author}`;
    return expandedGroups[groupKey] !== false; // Default to expanded
  };

  const getContentPreview = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  const handleRevert = (historyId) => {
    if (onRevert) {
      onRevert(historyId);
    }
  };

  const handleUndo = () => {
    const entry = undo();
    if (entry && onRevert) {
      onRevert(entry.id);
    }
  };

  const handleRedo = () => {
    const entry = redo();
    if (entry && onRevert) {
      onRevert(entry.id);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  const groupedHistory = groupHistoryByDateAndAuthor();

  if (!isOpen) return null;

  // Sidebar mode - no overlay, just the panel
  if (isSidebar) {
    return (
      <div 
        className="h-full flex flex-col"
        style={{ backgroundColor: currentColors.surface }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentColors.border }}>
          <div className="flex items-center gap-2">
            <FiClock size={20} style={{ color: currentColors.text }} />
            <h2 className="text-lg font-bold" style={{ color: currentColors.text }}>
              Version history
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: currentColors.background,
              color: currentColors.textSecondary
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = currentColors.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentColors.background;
            }}
          >
            ×
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: currentColors.border }}>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{
              backgroundColor: canUndo ? currentColors.primary : currentColors.background,
              color: canUndo ? '#ffffff' : currentColors.textSecondary
            }}
          >
            <FiRotateCcw size={14} />
            Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{
              backgroundColor: canRedo ? currentColors.primary : currentColors.background,
              color: canRedo ? '#ffffff' : currentColors.textSecondary
            }}
          >
            <FiRotateCw size={14} />
            Redo
          </button>
        </div>

        {/* History List - Google Classroom Style */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FiClock size={40} style={{ color: currentColors.textSecondary }} />
              <p className="mt-4 text-sm text-center" style={{ color: currentColors.textSecondary }}>
                No version history yet
              </p>
              <p className="mt-2 text-xs text-center" style={{ color: currentColors.textSecondary }}>
                Start editing to see version history
              </p>
            </div>
          ) : (
            <div className="p-3">
              {Object.entries(groupedHistory).map(([dateKey, authors]) => (
                <div key={dateKey} className="mb-4">
                  {/* Date Header */}
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: currentColors.textSecondary }}>
                      {dateKey}
                    </h3>
                  </div>
                  
                  {/* Author Groups */}
                  {Object.entries(authors).map(([author, entries]) => {
                    const isExpanded = isGroupExpanded(dateKey, author);
                    const hasCurrentVersion = entries.some(entry => entry.isCurrent);
                    
                    return (
                      <div key={`${dateKey}-${author}`} className="mb-2">
                        {/* Author Header - Clickable to Expand/Collapse */}
                        <div
                          className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                          style={{
                            backgroundColor: currentColors.background,
                            border: `1px solid ${currentColors.border}`
                          }}
                          onClick={() => toggleGroup(dateKey, author)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {isExpanded ? (
                                <FiChevronDown size={14} style={{ color: currentColors.textSecondary }} />
                              ) : (
                                <FiChevronRight size={14} style={{ color: currentColors.textSecondary }} />
                              )}
                              <FiUser size={14} style={{ color: currentColors.textSecondary }} />
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: currentColors.text }}>
                                {author}
                              </div>
                              <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                                {entries.length} edit{entries.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          {hasCurrentVersion && (
                            <span 
                              className="px-2 py-0.5 text-xs rounded-full"
                              style={{ 
                                backgroundColor: currentColors.primary,
                                color: '#ffffff'
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>

                        {/* Expanded Entries - Dropdown Content */}
                        {isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {entries.map((entry) => (
                              <div
                                key={entry.id}
                                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                  entry.isCurrent ? 'border-blue-500' : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: entry.isCurrent ? currentColors.background : currentColors.surface,
                                  borderColor: entry.isCurrent ? currentColors.primary : currentColors.border
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRevert(entry.id);
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-1">
                                      <FiFileText size={10} style={{ color: currentColors.textSecondary }} />
                                      <span className="text-xs font-medium" style={{ color: currentColors.text }}>
                                        Version {entry.index + 1}
                                      </span>
                                      {entry.isCurrent && (
                                        <span 
                                          className="px-1.5 py-0.5 text-xs rounded-full"
                                          style={{ 
                                            backgroundColor: currentColors.primary,
                                            color: '#ffffff'
                                          }}
                                        >
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1 mb-1">
                                      <FiClock size={10} style={{ color: currentColors.textSecondary }} />
                                      <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                        {formatTime(entry.timestamp)}
                                      </span>
                                    </div>
                                    
                                    <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      {getContentPreview(entry.content)}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevert(entry.id);
                                    }}
                                    className="p-1 rounded transition-colors flex-shrink-0"
                                    style={{
                                      backgroundColor: currentColors.background,
                                      color: currentColors.textSecondary
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = currentColors.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = currentColors.background;
                                    }}
                                    title="Revert to this version"
                                  >
                                    <FiRotateCcw size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal mode (original behavior)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: currentColors.surface }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: currentColors.border }}>
          <div className="flex items-center gap-3">
            <FiClock size={24} style={{ color: currentColors.text }} />
            <h2 className="text-xl font-bold" style={{ color: currentColors.text }}>
              Version history
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentColors.background,
                color: currentColors.textSecondary
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentColors.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentColors.background;
              }}
              title="Clear history"
            >
              <FiTrash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentColors.background,
                color: currentColors.textSecondary
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentColors.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentColors.background;
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: currentColors.border }}>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canUndo ? currentColors.primary : currentColors.background,
              color: canUndo ? '#ffffff' : currentColors.textSecondary
            }}
          >
            <FiRotateCcw size={16} />
            Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canRedo ? currentColors.primary : currentColors.background,
              color: canRedo ? '#ffffff' : currentColors.textSecondary
            }}
          >
            <FiRotateCw size={16} />
            Redo
          </button>
        </div>

        {/* History List - Google Classroom Style */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiClock size={48} style={{ color: currentColors.textSecondary }} />
              <p className="mt-4 text-lg" style={{ color: currentColors.textSecondary }}>
                No version history yet
              </p>
              <p className="mt-2 text-sm" style={{ color: currentColors.textSecondary }}>
                Start editing to see version history
              </p>
            </div>
          ) : (
            <div className="p-4">
              {Object.entries(groupedHistory).map(([dateKey, authors]) => (
                <div key={dateKey} className="mb-6">
                  {/* Date Header */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: currentColors.textSecondary }}>
                      {dateKey}
                    </h3>
                  </div>
                  
                  {/* Author Groups */}
                  {Object.entries(authors).map(([author, entries]) => {
                    const isExpanded = isGroupExpanded(dateKey, author);
                    const hasCurrentVersion = entries.some(entry => entry.isCurrent);
                    
                    return (
                      <div key={`${dateKey}-${author}`} className="mb-3">
                        {/* Author Header - Clickable to Expand/Collapse */}
                        <div
                          className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                          style={{
                            backgroundColor: currentColors.background,
                            border: `1px solid ${currentColors.border}`
                          }}
                          onClick={() => toggleGroup(dateKey, author)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <FiChevronDown size={16} style={{ color: currentColors.textSecondary }} />
                              ) : (
                                <FiChevronRight size={16} style={{ color: currentColors.textSecondary }} />
                              )}
                              <FiUser size={16} style={{ color: currentColors.textSecondary }} />
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: currentColors.text }}>
                                {author}
                              </div>
                              <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                                {entries.length} edit{entries.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          {hasCurrentVersion && (
                            <span 
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ 
                                backgroundColor: currentColors.primary,
                                color: '#ffffff'
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>

                        {/* Expanded Entries - Dropdown Content */}
                        {isExpanded && (
                          <div className="ml-8 mt-2 space-y-2">
                            {entries.map((entry) => (
                              <div
                                key={entry.id}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  entry.isCurrent ? 'border-blue-500' : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: entry.isCurrent ? currentColors.background : currentColors.surface,
                                  borderColor: entry.isCurrent ? currentColors.primary : currentColors.border
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRevert(entry.id);
                                }}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FiFileText size={12} style={{ color: currentColors.textSecondary }} />
                                      <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                                        Version {entry.index + 1}
                                      </span>
                                      {entry.isCurrent && (
                                        <span 
                                          className="px-2 py-1 text-xs rounded-full"
                                          style={{ 
                                            backgroundColor: currentColors.primary,
                                            color: '#ffffff'
                                          }}
                                        >
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                      <FiClock size={12} style={{ color: currentColors.textSecondary }} />
                                      <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                        {formatTime(entry.timestamp)}
                                      </span>
                                      {entry.description && (
                                        <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                          • {entry.description}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="text-sm" style={{ color: currentColors.textSecondary }}>
                                      {getContentPreview(entry.content)}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevert(entry.id);
                                    }}
                                    className="p-2 rounded-lg transition-colors flex-shrink-0"
                                    style={{
                                      backgroundColor: currentColors.background,
                                      color: currentColors.textSecondary
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = currentColors.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = currentColors.background;
                                    }}
                                    title="Revert to this version"
                                  >
                                    <FiRotateCcw size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
