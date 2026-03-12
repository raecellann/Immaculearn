// src/components/Notification/NotificationToast.jsx
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useNotification } from '../../contexts/notification/notificationContextProvider';

const NotificationIcon = ({ type, size = 'w-5 h-5' }) => {
  const iconClass = `${size} ${type === 'loading' ? 'animate-spin' : ''}`;
  
  switch (type) {
    case 'success':
      return <CheckCircle className={iconClass} color="green" />;
    case 'error':
      return <AlertCircle className={iconClass} color="red" />;
    case 'warning':
      return <AlertTriangle className={iconClass} color="orange" />;
    case 'info':
      return <Info className={iconClass} color="blue" />;
    case 'loading':
      return <Loader2 className={iconClass} color="blue" />;
    default:
      return <Info className={iconClass} color="gray" />;
  }
};

const getBackgroundClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'error':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'warning':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'info':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'loading':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

export default function NotificationToast({ notification }) {
  const { removeNotification, updateNotificationData } = useNotification();

  const handleAction = (action) => {
    action.onClick(notification);
    if (action.autoClose !== false) {
      removeNotification(notification.id);
    }
  };

  return (
    <div className={`flex items-start p-4 rounded-lg border shadow-lg max-w-sm w-full ${getBackgroundClass(notification.type)} transform transition-all duration-300 ease-in-out`}>
      {/* Icon */}
      <div className="flex-shrink-0 mr-3">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold truncate">
            {notification.title}
          </h4>
          {!notification.persistent && (
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {notification.message && (
          <p className="text-sm mt-1 opacity-90">
            {notification.message}
          </p>
        )}

        {/* Data display */}
        {notification.data && (
          <div className="mt-2 text-xs opacity-75">
            <details>
              <summary className="cursor-pointer hover:opacity-100">View data</summary>
              <pre className="mt-1 whitespace-pre-wrap">
                {JSON.stringify(notification.data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  action.variant === 'primary' 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : action.variant === 'danger'
                    ? 'bg-red-600 bg-opacity-20 hover:bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
