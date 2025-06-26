// Interfaz para las tareas
export interface Task {
    id: number;
    description: string;
    completed: boolean;
    created_at: string; // Fecha de creación en formato ISO
    updated_at: string; // Fecha de actualización en formato ISO
  }
  
export type Filter = 'all' | 'done' | 'undone';

export type Role = 'owner' | 'editor' | 'viewer';
  // Interfaz para el estado de la aplicación
  export interface State {
    tasks: Task[];
    page: number;
    total: number;
    role: Role;
  }

export type NotificationStatus = 'success' | 'error' | 'info';
export interface Notification {
  id: string;
  message: string;
  type: NotificationStatus;
  duration?: number; // Duración en ms (opcional)
}

  // Interfaz para las respuestas de la API
  export interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
      state?: State;
      [key: string]: any;
    };
  }

  export interface Board {
    id: string;
    name: string;
    role: Role;
  }

  export interface User{
    id: string;
    name: string;
    email: string;
  }

  // Tipo que representa un usuario con su rol en un tablero específico
  export interface UserWithPermission extends User {
    role: Role;
  }

  export interface FilledBoard extends Board {
    tasks: Task[];
  }
