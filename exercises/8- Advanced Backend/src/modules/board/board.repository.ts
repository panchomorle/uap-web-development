import { database } from "../../db/connection";
import { Board } from "../../types";

export class BoardRepository {

  async getAllBoards(): Promise<Board[]> {
    return database.all<Board>('SELECT * FROM boards');
  }

  async getAvailableBoardsByUserId(userId: string): Promise<Board[]> {
    return database.all<Board>(`
      SELECT DISTINCT b.*, 
        CASE 
          WHEN b.created_by = ? THEN 'owner'
          ELSE p.role
        END as role
      FROM boards b
      LEFT JOIN permissions p ON b.id = p.board_id AND p.user_id = ?
      WHERE (p.user_id = ? AND p.role IS NOT NULL) OR b.created_by = ?
      ORDER BY b.created_at DESC
    `, [userId, userId, userId, userId]);
  }

  async getBoardById(id: string): Promise<Board | undefined> {
    return database.get('SELECT * FROM boards WHERE id = ?', [id]);
  }

  async createBoard(id: string, name: string, creatorId: string): Promise<void> {
    await database.run('INSERT INTO boards (id, name, created_by) VALUES (?, ?, ?)', [id, name, creatorId]);
  }

  async deleteBoard(id: string): Promise<void> {
    await database.run('DELETE FROM boards WHERE id = ?', [id]);
  }
}