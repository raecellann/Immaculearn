// src/examples/NotificationExample.jsx
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationExample() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showGlobalSuccess,
    showGlobalError,
    showGlobalWarning,
    showGlobalInfo,
    showGlobalLoading,
    showDataOperation,
    notifyRouteChange,
  } = useNotifications();

  const handleBasicNotifications = () => {
    showSuccess('Success!', 'Operation completed successfully');
    showError('Error!', 'Something went wrong');
    showWarning('Warning!', 'Please review your input');
    showInfo('Info', 'Here is some useful information');
  };

  const handleGlobalNotifications = () => {
    showGlobalInfo('Global Info', 'This is a full-screen notification', {
      actions: [
        {
          label: 'OK',
          onClick: () => console.log('OK clicked'),
          variant: 'primary',
        },
        {
          label: 'Cancel',
          onClick: () => console.log('Cancel clicked'),
          variant: 'secondary',
        },
      ],
    });
  };

  const handleDataManipulation = () => {
    const notificationId = showLoading('Processing Data', 'Please wait...');
    
    // Simulate data processing
    setTimeout(() => {
      showDataOperation('Updated', {
        records: 150,
        timestamp: new Date().toISOString(),
        status: 'completed',
      });
    }, 2000);
  };

  const handleRouteChangeNotification = () => {
    notifyRouteChange('/old-route', '/new-route', 'User navigated to settings');
  };

  const handleComplexNotification = () => {
    showGlobalLoading('File Upload', 'Uploading your files...', {
      data: {
        files: ['document.pdf', 'image.jpg'],
        progress: 0,
        totalSize: '2.5 MB',
      },
      actions: [
        {
          label: 'Cancel Upload',
          onClick: (notification) => {
            console.log('Upload cancelled:', notification);
          },
          variant: 'danger',
        },
      ],
    });

    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        showGlobalSuccess('Upload Complete', 'All files uploaded successfully');
      }
    }, 500);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Notification System Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleBasicNotifications}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Show Basic Notifications
        </button>

        <button
          onClick={handleGlobalNotifications}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
        >
          Show Global Notification
        </button>

        <button
          onClick={handleDataManipulation}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
        >
          Data Operation Example
        </button>

        <button
          onClick={handleRouteChangeNotification}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Route Change Example
        </button>

        <button
          onClick={handleComplexNotification}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors md:col-span-2"
        >
          Complex Data Manipulation
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Features demonstrated:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Toast notifications with auto-dismiss</li>
          <li>• Full-screen global notifications</li>
          <li>• Data manipulation and display</li>
          <li>• Custom actions and buttons</li>
          <li>• Loading states with progress</li>
          <li>• Route change notifications</li>
          <li>• Persistent vs temporary notifications</li>
        </ul>
      </div>
    </div>
  );
}
