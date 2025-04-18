import { state } from '../../state';
import type { APIRoute } from "astro";
import { 
  validateTaskText, 
  handleResponse, 
  handleError 
} from '../../utils/apiUtils';

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
    } else {
      try {
        taskText = await parseFormData(request);
      } catch (formError) {
        console.error("Error parsing form data:", formError);
        return handleError(contentType, redirect, "Datos de formulario inválidos", 400);
      }
    }
    
    // Validar el texto de la tarea usando la utilidad
    const validationError = validateTaskText(taskText);
    if (validationError) {
      return handleError(contentType, redirect, validationError, 400);
    }
    
    // Agregar la tarea al estado
    state.tasks.push({ id: Date.now(), text: taskText as string, completed: false });
    
    // Usar la utilidad para manejar la respuesta según el tipo de contenido
    return handleResponse(contentType, redirect, { state }, "Tarea agregada correctamente");
    
  } catch (error) {
    console.error("Error processing request:", error);
    return handleError(contentType, redirect, "Error al procesar la solicitud", 500);
  }
}