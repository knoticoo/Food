import React from 'react';
import { X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { state, removeNotification } = useNotification();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          style={{
            animation: 'notificationSlideIn 0.3s ease-out',
          }}
        >
          <div className="notification-header">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <span className="notification-title">{notification.title}</span>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
          <div className="notification-message">{notification.message}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;