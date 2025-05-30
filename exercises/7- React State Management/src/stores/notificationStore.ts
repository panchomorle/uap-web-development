import { atom } from 'jotai';
import type { Notification } from '../types';

// Átomo para almacenar la lista de notificaciones activas
export const notificationsAtom = atom<Notification[]>([]);

// Átomo derivado para obtener si hay notificaciones
export const hasNotificationsAtom = atom((get) => get(notificationsAtom).length > 0);

// Action para agregar una notificación
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // ID único
      duration: notification.duration || 5000, // Default 5 segundos
    };
    
    const currentNotifications = get(notificationsAtom);
    set(notificationsAtom, [...currentNotifications, newNotification]);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      set(removeNotificationAtom, newNotification.id);
    }, newNotification.duration);
  }
);

// Action para remover una notificación específica
export const removeNotificationAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const currentNotifications = get(notificationsAtom);
    set(notificationsAtom, currentNotifications.filter(n => n.id !== notificationId));
  }
);

// Action para limpiar todas las notificaciones
export const clearAllNotificationsAtom = atom(
  null,
  (get, set) => {
    set(notificationsAtom, []);
  }
);

// Hook personalizado para usar las notificaciones más fácilmente
export const useNotifications = () => {
  return {
    // Para usar en componentes que necesiten mostrar notificaciones
    notifications: notificationsAtom,
    hasNotifications: hasNotificationsAtom,
    // Para usar en componentes que necesiten crear/eliminar notificaciones
    addNotification: addNotificationAtom,
    removeNotification: removeNotificationAtom,
    clearAll: clearAllNotificationsAtom,
  };
};