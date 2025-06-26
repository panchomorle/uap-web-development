import { Router } from 'express';
import { TaskService } from '../modules/task/task.service';
import { TaskRepository } from '../modules/task/task.repository';
import { TaskController } from '../modules/task/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { permissionService } from '../shared/services';

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService, permissionService);

const router = Router();
router.use(authMiddleware);

router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);
router.delete("/completed", taskController.clearCompletedTasks);
// El orden de las rutas es importante, ya que Express evalúa las rutas en el orden en que se definen.
// Por eso acá abajo dejo las rutas genéricas al final, para que no choquen con las específicas.
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTaskDescription);
router.patch("/:id/complete", taskController.toggleTaskCompletion);
router.delete("/:id", taskController.deleteTask);


export { router as taskRoutes };