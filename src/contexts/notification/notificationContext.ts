// src/contexts/notification/notificationContext.ts
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'loading';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss duration in ms, null for manual dismiss
  persistent?: boolean; // Shows until manually dismissed
  global?: boolean; // Full screen overlay notification
  actions?: NotificationAction[];
  data?: any; // Custom data that can be manipulated
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  onClick: (notification: Notification) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationState {
  notifications: Notification[];
  globalNotification: Notification | null;
  isVisible: boolean;
}

export interface NotificationContextType {
  // Notification management
  notifications: Notification[];
  globalNotification: Notification | null;
  isVisible: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Global notification (full screen)
  showGlobalNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  hideGlobalNotification: () => void;
  
  // Utility methods
  updateNotificationData: (id: string, data: any) => void;
  getNotificationById: (id: string) => Notification | undefined;
}
