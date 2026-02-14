// src/components/Notification/GlobalNotification.jsx
import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useNotification } from '../../contexts/notification/notificationContextProvider';

const NotificationIcon = ({ type, size = 'w-6 h-6' }) => {
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
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-orange-50 border-orange-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    case 'loading':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getButtonClass = (variant = 'primary') => {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors';
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors';
    default:
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors';
  }
};

export default function GlobalNotification() {
  const { globalNotification, isVisible, hideGlobalNotification, updateNotificationData } = useNotification();

  if (!isVisible || !globalNotification) {
    return null;
  }

  const handleAction = (action) => {
    action.onClick(globalNotification);
    if (action.autoClose !== false) {
      hideGlobalNotification();
    }
  };

  const handleDataUpdate = (newData) => {
    updateNotificationData(globalNotification.id, newData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={hideGlobalNotification}
      />
      
      {/* Notification Content */}
      <div className="relative max-w-lg w-full mx-4 transform transition-all">
        <div className={`bg-white rounded-lg shadow-2xl border-2 ${getBackgroundClass(globalNotification.type)}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <NotificationIcon type={globalNotification.type} />
              <h3 className="text-lg font-semibold text-gray-900">
                {globalNotification.title}
              </h3>
            </div>
            <button
              onClick={hideGlobalNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {globalNotification.message && (
              <p className="text-gray-700 mb-4">
                {globalNotification.message}
              </p>
            )}

            {/* Custom Data Display/Manipulation Area */}
            {globalNotification.data && (
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Data:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {JSON.stringify(globalNotification.data, null, 2)}
                </pre>
                
                {/* Data manipulation example */}
                {globalNotification.type === 'loading' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleDataUpdate({ 
                        ...globalNotification.data, 
                        status: 'updated',
                        timestamp: new Date().toISOString()
                      })}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                    >
                      Update Data
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {globalNotification.actions && globalNotification.actions.length > 0 && (
              <div className="flex space-x-3 justify-end">
                {globalNotification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action)}
                    className={getButtonClass(action.variant)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress indicator for loading notifications */}
          {globalNotification.type === 'loading' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
