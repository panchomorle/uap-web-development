import { state } from '../../state';
import type { APIRoute } from "astro";

interface Actions{
	done: string | undefined;
	undone: string | undefined;
	all: string | undefined;
	addTask: string | undefined;
	taskText: string | FormDataEntryValue | undefined;
	completeTask: string | undefined;
	deleteTask: string | undefined;
	clearCompleted: string | undefined;
}

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
	return await request.json();
  };

export const POST: APIRoute = async ({ request, redirect }) => {
	const contentType = request.headers.get("content-type");
	try {
		const { done, undone, all, addTask, taskText, completeTask, deleteTask, clearCompleted } =
		contentType==="application/x-www-form-urlencoded"
		? await parseFormData(request)
		: await parseJson(request);

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
		console.error("Error processing form data:", error);
	}
	if (contentType === "application/x-www-form-urlencoded") {
		return redirect("/");
	  }
	if (contentType === "application/json") {
	return new Response(JSON.stringify(state), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
	}
	return new Response("Invalid content type", { status: 400 });
}