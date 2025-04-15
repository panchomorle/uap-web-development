import { state } from '../../state';
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({ state }), {
      headers: { "Content-Type": "application/json" },
    });
};

export const POST: APIRoute = async ({ request, redirect }) => {
    const contentType = request.headers.get("content-type") || "";
    try {
        state.tasks = state.tasks.filter(task => !task.completed);
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