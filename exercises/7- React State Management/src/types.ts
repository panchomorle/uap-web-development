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
  }

export type NotificationStatus = 'success' | 'error' | 'info';
  
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