import { state } from '../../state';
import type { APIRoute } from "astro";
import { handleResponse, handleError } from '../../utils/apiUtils';

export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({ state }), {
      headers: { "Content-Type": "application/json" },
    });
};

export const POST: APIRoute = async ({ request, redirect }) => {
    const contentType = request.headers.get("content-type") || "";
    try {
        // Filtrar las tareas no completadas
        const previousCount = state.tasks.length;
        state.tasks = state.tasks.filter(task => !task.completed);
        const removedCount = previousCount - state.tasks.length;
        
        const message = removedCount > 0 
            ? `Se eliminaron ${removedCount} tareas completadas` 
            : "No había tareas completadas para eliminar";
        
        return handleResponse(contentType, redirect, { state }, message);
    } catch (error) {
        console.error("Error processing request:", error);
        return handleError(contentType, redirect, "Error al eliminar tareas completadas", 500);
    }
}