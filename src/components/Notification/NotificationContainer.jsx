// src/components/Notification/NotificationContainer.jsx
import React from 'react';
import { useNotification } from '../../contexts/notification/notificationContextProvider';
import GlobalNotification from './GlobalNotification';
import NotificationToast from './NotificationToast';

export default function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <>
      {/* Global Notification (Bottom Right Corner) */}
      <GlobalNotification />
      
      {/* Toast Notifications (Top Right) */}
      <div className="fixed top-4 right-4 z-40 space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast notification={notification} />
          </div>
        ))}
      </div>
    </>
  );
}
