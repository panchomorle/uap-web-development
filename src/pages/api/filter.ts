import { state } from '../../state';
import type { APIRoute } from "astro";
import { handleResponse, handleError } from '../../utils/apiUtils';

export const GET: APIRoute = async ({ url, request, redirect }) => {
  // Obtener el parámetro filter de la URL
  const filter = url.searchParams.get('filter') || 'all';
  
  // Validar que el filtro sea válido
  if (!['all', 'done', 'undone'].includes(filter)) {
    return handleError(
      request.headers.get('content-type') || '', 
      redirect, 
      "El filtro especificado no es válido", 
      400
    );
  }
  
  // Actualizar el estado del filtro
  state.filter = filter;
  
  // Filtrar las tareas según el filtro seleccionado
  const filteredTasks = state.tasks.filter(task => {
    if (filter === 'done') return task.completed;
    if (filter === 'undone') return !task.completed;
    return true; // 'all'
  });
  
  // Para peticiones AJAX, siempre usar respuesta JSON
  // El problema estaba aquí: cuando un request proviene de fetch() con X-Requested-With
  // siempre debemos responder con JSON, independiente del content-type
  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
  
  if (isAjax) {
    return handleResponse(
      'application/json', // Forzamos application/json para peticiones AJAX
      redirect,
      { 
        state: {
          filter: state.filter,
          tasks: state.tasks 
        }
      }, 
      `Filtro aplicado: ${filter}`
    );
  } else {
    // Para navegación normal, redirigir a la página principal
    return redirect("/");
  }
};