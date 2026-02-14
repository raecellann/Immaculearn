// src/contexts/notification/notificationContextProvider.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Notification, NotificationContextType, NotificationState } from './notificationContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    globalNotification: null,
    isVisible: false,
  });

  // Generate unique ID for notifications
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
    }));

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  // Show global notification (full screen)
  const showGlobalNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      global: true,
    };

    setState(prev => ({
      ...prev,
      globalNotification: newNotification,
      isVisible: true,
    }));

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        hideGlobalNotification();
      }, notification.duration);
    }

    return id;
  }, []);

  // Hide global notification
  const hideGlobalNotification = useCallback(() => {
    setState(prev => ({
      ...prev,
      globalNotification: null,
      isVisible: false,
    }));
  }, []);

  // Update notification data
  const updateNotificationData = useCallback((id: string, data: any) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, data } : n
      ),
    }));

    // Also update global notification if it matches
    setState(prev => ({
      ...prev,
      globalNotification: prev.globalNotification?.id === id 
        ? { ...prev.globalNotification, data }
        : prev.globalNotification,
    }));
  }, []);

  // Get notification by ID
  const getNotificationById = useCallback((id: string) => {
    return state.notifications.find(n => n.id === id) || 
           (state.globalNotification?.id === id ? state.globalNotification : undefined);
  }, [state.notifications, state.globalNotification]);

  // Handle ESC key to close global notifications
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isVisible) {
        hideGlobalNotification();
      }
    };

    if (state.isVisible) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [state.isVisible, hideGlobalNotification]);

  const value: NotificationContextType = {
    notifications: state.notifications,
    globalNotification: state.globalNotification,
    isVisible: state.isVisible,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showGlobalNotification,
    hideGlobalNotification,
    updateNotificationData,
    getNotificationById,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
