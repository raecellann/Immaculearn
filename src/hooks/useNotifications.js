// src/hooks/useNotifications.js
import { useNotification } from '../contexts/notification/notificationContextProvider';

// Convenience hook for common notification patterns
export function useNotifications() {
  const notificationContext = useNotification();

  const showSuccess = (title, message, options = {}) => {
    return notificationContext.addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
      ...options,
    });
  };

  const showError = (title, message, options = {}) => {
    return notificationContext.addNotification({
      type: 'error',
      title,
      message,
      duration: 5000,
      ...options,
    });
  };

  const showWarning = (title, message, options = {}) => {
    return notificationContext.addNotification({
      type: 'warning',
      title,
      message,
      duration: 4000,
      ...options,
    });
  };

  const showInfo = (title, message, options = {}) => {
    return notificationContext.addNotification({
      type: 'info',
      title,
      message,
      duration: 3000,
      ...options,
    });
  };

  const showLoading = (title, message, options = {}) => {
    return notificationContext.addNotification({
      type: 'loading',
      title,
      message,
      persistent: true,
      ...options,
    });
  };

  // Global notification methods
  const showGlobalSuccess = (title, message, options = {}) => {
    return notificationContext.showGlobalNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  const showGlobalError = (title, message, options = {}) => {
    return notificationContext.showGlobalNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  };

  const showGlobalWarning = (title, message, options = {}) => {
    return notificationContext.showGlobalNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };

  const showGlobalInfo = (title, message, options = {}) => {
    return notificationContext.showGlobalNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  const showGlobalLoading = (title, message, options = {}) => {
    return notificationContext.showGlobalNotification({
      type: 'loading',
      title,
      message,
      persistent: true,
      ...options,
    });
  };

  // Route change notification
  const notifyRouteChange = (from, to, message) => {
    return showInfo('Route Changed', `Navigated from ${from} to ${to}${message ? ': ' + message : ''}`, {
      duration: 2000,
    });
  };

  // Data manipulation notification
  const showDataOperation = (operation, data, options = {}) => {
    return notificationContext.addNotification({
      type: 'info',
      title: `Data ${operation}`,
      message: `Successfully ${operation.toLowerCase()} data`,
      data,
      duration: 3000,
      ...options,
    });
  };

  return {
    ...notificationContext,
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    // Global notification methods
    showGlobalSuccess,
    showGlobalError,
    showGlobalWarning,
    showGlobalInfo,
    showGlobalLoading,
    // Specialized methods
    notifyRouteChange,
    showDataOperation,
  };
}
