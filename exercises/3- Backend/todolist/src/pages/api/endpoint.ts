import { state } from '../../state';
import type { APIRoute } from "astro";

const parseFormData = async (request: Request): Promise<Actions> => {
	const formData = await request.formData();
	const done = formData.get("done")?.toString();
	const undone = formData.get("undone")?.toString();
	const all = formData.get("all")?.toString();
	const addTask = formData.get("addTask")?.toString();
	const taskText = formData.get("taskInput")?.toString();
	const completeTask = formData.get("completeTask")?.toString();
	const deleteTask = formData.get("deleteTask")?.toString();
	const clearCompleted = formData.get("clearCompleted")?.toString();
	return { done, undone, all, addTask, taskText, completeTask, deleteTask, clearCompleted };
};

const parseJson = async (request: Request): Promise<Actions> => {
	try {
		const data = await request.json();
		console.log("Received JSON data:", data);
		return data;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		// Devolver un objeto vacío que cumpla con la estructura Actions
		return {
			done: undefined,
			undone: undefined,
			all: undefined,
			addTask: undefined,
			taskText: undefined,
			completeTask: undefined,
			deleteTask: undefined,
			clearCompleted: undefined
		};
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
		let actions: Actions;

		// Verificar si el tipo de contenido contiene application/json
		if (contentType.includes("application/json")) {
			actions = await parseJson(request);
		} 
		// Si es un formulario o cualquier otro tipo de contenido
		else {
			try {
				actions = await parseFormData(request);
			} catch (formError) {
				console.error("Error parsing form data:", formError);
				return new Response("Invalid form data", { status: 400 });
			}
		}

		const { done, undone, all, addTask, taskText, completeTask, deleteTask, clearCompleted } = actions;

		if (done) {
			state.filter = "done";
		} else if (undone) {
			state.filter = "undone";
		} else if (all) {
			state.filter = "all";
		}
	//--------------------
	// manejo de acciones
		if (addTask) {
			if (taskText) {
				if (typeof taskText === 'string') {
					state.tasks.push({ id: Date.now(), text: taskText, completed: false });
				}
			}
		} else if (completeTask) {
			const taskId = Number(completeTask);
			const task = state.tasks.find(task => task.id === taskId);
			if (task) {
				task.completed = !task.completed;
			}
		} else if (deleteTask) {
			const taskId = Number(deleteTask);
			state.tasks = state.tasks.filter(task => task.id !== taskId);
		} else if (clearCompleted) {
			state.tasks = state.tasks.filter(task => !task.completed);
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