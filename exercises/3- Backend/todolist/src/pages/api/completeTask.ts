import { state } from '../../state';
import type { APIRoute } from "astro";

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
        
        console.log("Task ID to complete:", taskId);
        
        // Verificar si tenemos un ID válido
        if (taskId <= 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'ID de tarea inválido'
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        // Buscar la tarea por su ID
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          // Cambiar el estado de completado
          state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
          
          // Devolver la tarea actualizada
          return new Response(JSON.stringify({
            success: true,
            state: state,
          }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            error: 'Tarea no encontrada'
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (error) {
        console.error("Error procesando la solicitud:", error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Error interno del servidor'
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
};