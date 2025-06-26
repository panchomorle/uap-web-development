import { Filter, Task } from "../../types";
import { TaskRepository } from "./task.repository";

export class TaskService {
    constructor(private taskRepository: TaskRepository) {}

    async getAllTasks(boardId: string, filter: string, page: number, limit: number):
    Promise<{ tasks: Task[], total: number }> 
    {
        // Validate inputs
        if (!boardId || typeof boardId !== 'string') {
            throw new Error('Invalid board ID');
        }
        if (page < 1 || limit < 1) {
            throw new Error('Page and limit must be greater than 0');
        }
        
        let tasks: Task[] = [];
        switch (filter) {
            case 'all':
                tasks = await this.taskRepository.getAllTasks(boardId);
                break;
            case 'done':
                tasks = await this.taskRepository.getAllDoneTasks(boardId);
                break;
            case 'undone':
                tasks = await this.taskRepository.getAllUndoneTasks(boardId);
                break;
            default:
                throw new Error(`Unknown filter: ${filter}`);
        }
        // Implement pagination
        const total = tasks.length;
        if (total === 0) {
            return { tasks: [], total: 0 };
        }
        if (page > Math.ceil(total / limit)) {
            throw new Error('Page number exceeds total pages');
        }
        const start = (page - 1) * limit;
        const end = start + limit;
        return { tasks: tasks.slice(start, end), total: total };
    }

    async getTaskById(id: string): Promise<Task | undefined> {
        return this.taskRepository.getTaskById(id);
    }

    async createTask(boardId: string, description: string): Promise<void> {
        await this.taskRepository.createTask({
            id: crypto.randomUUID(),
            board_id: boardId,
            description: description,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    async updateTaskDescription(_task: Task, newDescription: string): Promise<void> {
        // esta validación se movió al controller:
        // const task = await this.taskRepository.getTaskById(taskId);
        // if (!task) {
        //     throw new Error('Task not found');
        // }
        const task = { ..._task }; // Clonar el objeto para evitar mutaciones directas
        task.description = newDescription;
        task.updated_at = new Date().toISOString();
        await this.taskRepository.updateTask(task);
    }

    async toggleTaskCompletion(_task: Task): Promise<{ completed: boolean }> {
        // const task = await this.taskRepository.getTaskById(taskId);
        // if (!task) {
        //     throw new Error('Task not found');
        // }
        const task = { ..._task };
        task.completed = !task.completed;
        task.updated_at = new Date().toISOString();
        await this.taskRepository.updateTask(task);
        return { completed: task.completed };
    }

    async deleteTask(id: string): Promise<void> {
        await this.taskRepository.deleteTask(id);
    }

    async clearCompletedTasks(boardId: string): Promise<void> {
        
        const completedTasks = await this.taskRepository.getAllDoneTasks(boardId);
        
        for (const task of completedTasks) {
            await this.taskRepository.deleteTask(task.id);
        }
        
        console.log(`Successfully deleted ${completedTasks.length} completed tasks`);
    }
}