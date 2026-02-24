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
      return 'bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors';
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors';
    default:
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors';
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

  // Get current progress from notification data
  const currentProgress = globalNotification.data?.progress || 0;
  const uploadStatus = globalNotification.data?.status || 'uploading';
  const fileName = globalNotification.data?.fileName || '';

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm md:max-w-md lg:max-w-lg z-50">
      {/* Notification Content */}
      <div className="transform transition-all" data-notification-id={globalNotification.id}>
        <div className={`bg-white rounded-lg shadow-2xl border-2 ${getBackgroundClass(globalNotification.type)}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <NotificationIcon type={globalNotification.type} size="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {globalNotification.title}
                </h3>
                {fileName && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{fileName}</p>
                )}
              </div>
            </div>
            <button
              onClick={hideGlobalNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-1 sm:ml-2"
              disabled={globalNotification.persistent && uploadStatus !== 'completed' && uploadStatus !== 'error'}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-4">
            {globalNotification.message && (
              <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 notification-message line-clamp-2">
                {globalNotification.message}
              </p>
            )}

            {/* Progress Bar for Uploads */}
            {globalNotification.type === 'loading' && currentProgress > 0 && (
              <div className="mb-2 sm:mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="text-xs">Upload Progress</span>
                  <span className="text-xs">{currentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                {uploadStatus === 'processing' && (
                  <p className="text-xs text-gray-500 mt-1">Processing file...</p>
                )}
                {uploadStatus === 'retrying' && (
                  <p className="text-xs text-orange-600 mt-1">Retrying upload...</p>
                )}
              </div>
            )}

            {/* Error Details */}
            {globalNotification.type === 'error' && globalNotification.data?.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 sm:p-3 mb-2 sm:mb-3">
                <h4 className="text-xs font-medium text-red-700 mb-1">Error Details:</h4>
                <p className="text-xs text-red-600">{globalNotification.data.error}</p>
                {globalNotification.data.retryCount > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Retry attempt: {globalNotification.data.retryCount}/3
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {globalNotification.actions && globalNotification.actions.length > 0 && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
                {globalNotification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action)}
                    className={`${getButtonClass(action.variant)} text-xs px-2 py-1.5 sm:px-3 sm:py-1.5 w-full sm:w-auto`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress indicator for loading notifications */}
          {globalNotification.type === 'loading' && !currentProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
