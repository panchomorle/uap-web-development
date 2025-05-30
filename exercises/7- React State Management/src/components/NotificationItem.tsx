// components/NotificationItem.tsx
import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { removeNotificationAtom } from '../stores/notificationStore';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const [, removeNotification] = useAtom(removeNotificationAtom);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Animación de entrada
  useEffect(() => {
    // Pequeño delay para la animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsLeaving(true);
    // Esperar a que termine la animación antes de remover
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };
  
  // Determinar estilos según el tipo
  const getNotificationStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    
    switch (notification.type) {
      case 'success':
        return {
          container: `${baseStyles} bg-green-100 border-l-4 border-green-500 text-green-800`,
          icon: (
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          container: `${baseStyles} bg-red-100 border-l-4 border-red-500 text-red-800`,
          icon: (
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          container: `${baseStyles} bg-blue-100 border-l-4 border-blue-500 text-blue-800`,
          icon: (
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };
  
  const styles = getNotificationStyles();
  
  // Clases para animaciones
  const animationClasses = isLeaving 
    ? "opacity-0 translate-x-full scale-95" 
    : isVisible 
      ? "opacity-100 translate-x-0 scale-100" 
      : "opacity-0 translate-x-full scale-95";
  
  return (
    <div 
      className={`${styles.container} ${animationClasses} p-4 mb-2 rounded-lg shadow-md max-w-sm`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-2">
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <button 
          type="button" 
          className="ml-2 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-200 focus:outline-none transition-colors"
          aria-label="Cerrar notificación"
          onClick={handleClose}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;