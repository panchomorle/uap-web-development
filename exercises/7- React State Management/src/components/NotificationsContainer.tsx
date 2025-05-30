import React from 'react';
import { useAtomValue } from 'jotai';
import { notificationsAtom } from '../stores/notificationStore';
import NotificationItem from './NotificationItem';

const NotificationsContainer: React.FC = () => {
  const notifications = useAtomValue(notificationsAtom);
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}
    </div>
  );
};

export default NotificationsContainer;