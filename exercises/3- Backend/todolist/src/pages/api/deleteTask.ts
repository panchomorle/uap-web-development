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
        
        // Verificar si la tarea existe
        const taskExists = state.tasks.some(task => task.id === taskId);
        if (!taskExists) {
            return handleError(contentType, redirect, "La tarea especificada no existe", 404);
        }
        
        // Eliminar la tarea
        state.tasks = state.tasks.filter(task => task.id !== taskId);
        return handleResponse(contentType, redirect, { state }, "Tarea eliminada correctamente");
        
    } catch (error) {
        console.error("Error processing request:", error);
        return handleError(contentType, redirect, "Error al procesar la solicitud de eliminación", 500);
    }
}