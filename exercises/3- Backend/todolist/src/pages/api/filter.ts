import { state } from '../../state';
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url, request }) => {
  // Obtener el parámetro filter de la URL
  const filter = url.searchParams.get('filter') || 'all';
  
  // Validar que el filtro sea válido
  if (!['all', 'done', 'undone'].includes(filter)) {
    return new Response(JSON.stringify({
      error: "Filtro no válido"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Actualizar el estado del filtro
  state.filter = filter;
  
  // Verificar si la solicitud es una petición AJAX
  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
  
  if (isAjax) {
    // Para peticiones AJAX, devolver JSON con las tareas filtradas
    return new Response(JSON.stringify({
      filter: state.filter,
      tasks: state.tasks.filter(task => {
        if (filter === 'done') return task.completed;
        if (filter === 'undone') return !task.completed;
        return true; // 'all'
      })
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } else {
    // Para navegación normal, redirigir a la página principal
    return new Response(null, {
      status: 302,
      headers: { "Location": "/" }
    });
  }
};