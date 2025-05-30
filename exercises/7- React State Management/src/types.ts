// Interfaz para las tareas
export interface Task {
    id: number;
    text: string;
    completed: boolean;
  }
  
export type Filter = 'all' | 'done' | 'undone';
  // Interfaz para el estado de la aplicación
  export interface State {
    tasks: Task[];
    filter: Filter;
    page: number;
    total: number;
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