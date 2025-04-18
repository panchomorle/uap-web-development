import { state } from '../../state';
import type { APIRoute } from "astro";
import { validateTaskId, handleResponse, handleError } from '../../utils/apiUtils';

type TaskId = number;

const parseFormData = async (request: Request): Promise<TaskId> => {
	const formData = await request.formData();
	const taskId = Number(formData.get("taskId"));
	return taskId;
};

const parseJson = async (request: Request): Promise<TaskId> => {
	try {
		const data = await request.json();
		console.log("Received JSON data:", data);
		return Number(data.taskId);
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return -1;
	}
};

export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({ state }), {
      headers: { "Content-Type": "application/json" },
    });
};

export const POST: APIRoute = async ({ request, redirect }) => {
    const contentType = request.headers.get("content-type") || "";
    
    try {
        let taskId: number;
        
        // Determinar cómo procesar los datos según el Content-Type
        if (contentType.includes("application/json")) {
            taskId = await parseJson(request);
        } else {
            // Procesar como form-data o x-www-form-urlencoded
            taskId = await parseFormData(request);
        }
        // Validar el ID de la tarea usando la utilidad
        const validationError = validateTaskId(taskId);
        if (validationError) {
            return handleError(contentType, redirect, validationError, 400);
        }
        
        // Buscar la tarea por su ID
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          // Cambiar el estado de completado
          state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
          const status = state.tasks[taskIndex].completed ? "completada" : "pendiente";
          
          // Usar handleResponse para devolver respuesta estandarizada
          return handleResponse(
            contentType, 
            redirect, 
            { state: state }, 
            `Tarea marcada como ${status}`
          );
        } else {
          return handleError(contentType, redirect, "Tarea no encontrada", 404);
        }
    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        return handleError(contentType, redirect, "Error interno del servidor", 500);
    }
};