import type { State } from '../types';

// Tipo estándar para respuestas API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Función para crear respuestas de éxito estandarizadas
export function createSuccessResponse<T>(data: T, message = 'Operación exitosa'): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

// Función para crear respuestas de error estandarizadas
export function createErrorResponse(error: string, message = 'Ha ocurrido un error'): ApiResponse {
  return {
    success: false,
    error,
    message
  };
}

// Validación para el texto de tarea
export function validateTaskText(text: unknown): string | null {
  if (typeof text !== 'string') {
    return 'El texto de la tarea debe ser una cadena';
  }
  
  if (text.trim().length === 0) {
    return 'El texto de la tarea no puede estar vacío';
  }
  
  if (text.length > 200) {
    return 'El texto de la tarea no puede exceder los 200 caracteres';
  }
  
  return null; // Sin errores
}

// Validación para ID de tarea
export function validateTaskId(id: unknown): string | null {
  const parsedId = Number(id);
  
  if (isNaN(parsedId)) {
    return 'El ID de la tarea debe ser un número';
  }
  
  if (parsedId <= 0) {
    return 'El ID de la tarea debe ser un número positivo';
  }
  
  return null; // Sin errores
}

// Función para manejar respuestas según tipo de contenido
export function handleResponse(
  contentType: string, 
  redirect: (path: string) => Response, 
  data: any, 
  message: string = 'Operación exitosa'
): Response {
  if (contentType.includes('application/json')) {
    const response = createSuccessResponse(data, message);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return redirect('/');
  }
}

// Función para manejar errores según tipo de contenido
export function handleError(
  contentType: string,
  redirect: (path: string) => Response,
  error: string,
  status: number = 400
): Response {
  if (contentType.includes('application/json')) {
    const response = createErrorResponse(error);
    return new Response(JSON.stringify(response), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // Para formularios tradicionales, redirigir con parámetro de error
    return redirect(`/?error=${encodeURIComponent(error)}`);
  }
}