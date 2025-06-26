import { Request, Response } from "express";
import { TaskService } from "./task.service";
import { PermissionsService } from "../permission/permission.service";

export class TaskController{
    constructor(
        private readonly taskService: TaskService,
        private readonly permissionService: PermissionsService
    ) {}

    getAllTasks = async (req: Request, res: Response): Promise<void> => {
        const { boardId, filter = 'all', page = "1", limit = "10" } = req.query;
        try {
            const userId = req.user?.id;
            const hasPermission = await this.permissionService.canAccessBoard(userId as string, boardId as string);
            if (!hasPermission) {
                res.status(403).json({ error: 'You do not have permission to access the tasks in this board' });
                return;
            }
            const { tasks, total } = await this.taskService.getAllTasks(
                boardId as string,
                filter as string,
                parseInt(page as string),
                parseInt(limit as string)
            );
            if (total === undefined) {
                res.status(404).json({ error: 'Board not found' });
                return;
            }
            const role = await this.permissionService.getUserRole(userId as string, boardId as string);
            res.json({
                tasks: tasks,
                total: total,
                page: parseInt(page as string),
                role: role
            });
        } catch (e) {
            res.status(500).json({ error: 'Error fetching tasks: ' + (e as Error).message });
        }
    }
    
    getTaskById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
        const task = await this.taskService.getTaskById(id);
        if (!task || !task.board_id) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const hasPermission = await this.permissionService.canAccessBoard(userId as string, task.board_id);
        if (!hasPermission) {
            res.status(403).json({ error: 'Forbidden: You do not have permission to access this task' });
            return;
        }
        res.status(200).json(task);
        } catch (error) {
        res.status(500).json({ error: 'Error fetching task' });
        }
    }
    
    createTask = async (req: Request, res: Response): Promise<void> => {
        const { board_id, description } = req.body;
        if (!board_id || !description) {
            res.status(400).json({ error: 'Board ID and description are required' });
            return;
        }
        const userId = req.user?.id;
        try {
            const hasPermission = await this.permissionService.canEditBoard(userId as string, board_id);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to create tasks in this board' });
                return;
            }
            await this.taskService.createTask(board_id, description);
            res.status(201).json({ message: 'Task created successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error creating task' });
        }
    }
    
    updateTaskDescription = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { description } = req.body;
        if (!description) {
            res.status(400).json({ error: 'Description is required' });
            return;
        }
        const userId = req.user?.id;
        try {
            const task = await this.taskService.getTaskById(id);
            if (!task || !task.board_id) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            const hasPermission = await this.permissionService.canEditBoard(userId as string, task.board_id);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to edit this task' });
                return;
            }
            await this.taskService.updateTaskDescription(task, description);
            res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error updating task' });
        }
    }
    
    toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'Task ID is required' });
            return;
        }
        const userId = req.user?.id;
        try {
            const task = await this.taskService.getTaskById(id);
            if (!task || !task.board_id) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            const hasPermission = await this.permissionService.canEditBoard(userId as string, task.board_id);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to toggle task completion' });
                return;
            }
            const { completed } = await this.taskService.toggleTaskCompletion(task);
            res.status(200).json({ completed: completed, message: 'Task completion toggled successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error toggling task completion' });
        }
    }

    deleteTask = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'Task ID is required' });
            return;
        }
        const userId = req.user?.id;
        try {
            const task = await this.taskService.getTaskById(id);
            if (!task || !task.board_id) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            const hasPermission = await this.permissionService.canEditBoard(userId as string, task.board_id);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to delete tasks in this board' });
                return;
            }
            await this.taskService.deleteTask(id);
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting task' });
        }
    }

    clearCompletedTasks = async (req: Request, res: Response): Promise<void> => {
        const { boardId } = req.query;
        if (!boardId) {
            res.status(400).json({ error: 'Board ID is required' });
            return;
        }
        const userId = req.user?.id;

        try {
            const hasPermission = await this.permissionService.canEditBoard(userId as string, boardId as string);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to clear completed tasks in this board' });
                return;
            }
            await this.taskService.clearCompletedTasks(boardId as string);
            res.status(200).json({ message: 'Completed tasks cleared successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error clearing completed tasks' });
        }
    }
}