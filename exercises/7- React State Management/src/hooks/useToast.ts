import { useAtom } from 'jotai';
import { addNotificationAtom, clearAllNotificationsAtom } from '../stores/notificationStore';

export const useToast = () => {
  const [, addNotification] = useAtom(addNotificationAtom);
  const [, clearAll] = useAtom(clearAllNotificationsAtom);
  
  const toast = {
    success: (message: string, duration?: number) => {
      addNotification({ message, type: 'success', duration });
    },
    
    error: (message: string, duration?: number) => {
      addNotification({ message, type: 'error', duration });
    },
    
    info: (message: string, duration?: number) => {
      addNotification({ message, type: 'info', duration });
    },
    
    // Limpiar todas las notificaciones
    clear: () => {
      clearAll();
    }
  };
  
  return toast;
};