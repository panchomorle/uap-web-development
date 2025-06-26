import { database } from "../../db/connection";
import { DbTask, Task } from "../../types";

export class TaskRepository {

    private mapTaskRowToTask(row: DbTask): Task {
        return {
            id: row.id,
            board_id: row.board_id,
            description: row.description,
            completed: Boolean(row.completed),
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }
    async getAllTasks(boardId: string): Promise<Task[]> {
        const tasks = await database.all<DbTask>('SELECT * FROM tasks WHERE board_id = ?', [boardId]);
        return tasks.map(this.mapTaskRowToTask);
    }

    async getAllDoneTasks(boardId: string): Promise<Task[]> {
        const tasks = await database.all<DbTask>('SELECT * FROM tasks WHERE board_id = ? AND completed = 1', [boardId]);
        return tasks.map(this.mapTaskRowToTask);
    }

    async getAllUndoneTasks(boardId: string): Promise<Task[]> {
        const tasks = await database.all<DbTask>('SELECT * FROM tasks WHERE board_id = ? AND completed = 0', [boardId]);
        return tasks.map(this.mapTaskRowToTask);
    }
    
    async getTaskById(id: string): Promise<Task | undefined> {
        const row = await database.get<DbTask>('SELECT * FROM tasks WHERE id = ?', [id]);
        return row ? this.mapTaskRowToTask(row) : undefined;
    }
    
    async createTask(task: Task): Promise<void> {
        await database.run(
        'INSERT INTO tasks (id, board_id, description, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [task.id, task.board_id, task.description, task.completed ? 1 : 0, task.created_at, task.updated_at]
        );
    }
    
    async updateTask(task: Task): Promise<void> {
        await database.run(
        'UPDATE tasks SET description = ?, completed = ?, updated_at = ? WHERE id = ?',
        [task.description, task.completed ? 1 : 0, task.updated_at, task.id]
        );
    }
    
    async deleteTask(id: string): Promise<void> {
        await database.run('DELETE FROM tasks WHERE id = ?', [id]);
    }
}