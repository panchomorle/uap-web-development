import { state } from '../../state';
import type { APIRoute } from "astro";

type TaskText = string | undefined;

const parseFormData = async (request: Request): Promise<TaskText> => {
	const formData = await request.formData();
	const taskText = formData.get("taskInput")?.toString();
	return taskText;
};

const parseJson = async (request: Request): Promise<TaskText> => {
	try {
		const data = await request.json();
		console.log("Received JSON data:", data);
		return data.taskInput;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		// Devolver un objeto vacío que cumpla con la estructura Actions
		return undefined;
	}
};

export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({ state }), {
      headers: { "Content-Type": "application/json" },
    });
};

export const POST: APIRoute = async ({ request, redirect }) => {
    const contentType = request.headers.get("content-type") || "";
    let taskText: TaskText = undefined;
    try {
        // Verificar si el tipo de contenido contiene application/json
        if (contentType.includes("application/json")) {
            taskText = await parseJson(request);
        } 
        // Si es un formulario o cualquier otro tipo de contenido
        else {
            try {
                taskText = await parseFormData(request);
            } catch (formError) {
                console.error("Error parsing form data:", formError);
                return new Response("Invalid form data", { status: 400 });
            }
        }
        if (!taskText) return new Response("Invalid task text", { status: 400 });
        if (typeof taskText === 'string') {
            state.tasks.push({ id: Date.now(), text: taskText, completed: false });
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