import { state } from '../../state';
import type { APIRoute } from "astro";

type TaskId = number;

const parseFormData = async (request: Request): Promise<TaskId> => {
    const formData = await request.formData();
    const taskId = Number(formData.get("taskInput"));
    return taskId;
};

const parseJson = async (request: Request): Promise<TaskId> => {
    try {
        const data = await request.json();
        console.log("Received JSON data:", data);
        return Number(data.taskId);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        // Devolver un objeto vacío que cumpla con la estructura Actions
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
        let taskId: TaskId;

        if (contentType.includes("application/json")) {
            taskId = await parseJson(request);
        } 
        // Si es un formulario o cualquier otro tipo de contenido
        else {
            try {
                taskId = await parseFormData(request);
            } catch (formError) {
                console.error("Error parsing form data:", formError);
                return new Response("Invalid form data", { status: 400 });
            }
        }
        if (taskId) {
			state.tasks = state.tasks.filter(task => task.id !== taskId);
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response("Error processing request", { status: 500 });
    }
    // Determinar tipo de respuesta basado en el tipo de contenido de la solicitud
    if (contentType.includes("application/json")) {
        return new Response(JSON.stringify({ state }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return redirect("/");
    }
}