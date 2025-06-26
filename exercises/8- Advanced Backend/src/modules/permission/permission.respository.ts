import { database } from '../../db/connection';
import { Permission, Role, User } from '../../types';

export class PermissionsRepository {

    async getAllUsersWithPermissions(boardId: string): Promise<{ user: User; role: Role }[]> {
      return database.all<{ user: User; role: Role }>(
        `SELECT u.id, u.email, p.role AS role
         FROM permissions p
         JOIN users u ON p.user_id = u.id
         WHERE p.board_id = ?
         
         UNION
         
         SELECT u.id, u.email, 'owner' AS role
         FROM boards b
         JOIN users u ON b.created_by = u.id
         WHERE b.id = ?`,
        [boardId, boardId]
      );
    }

    async getUserPermissionForBoard(userId: string, boardId: string): Promise<Role | undefined> {
      // Primero verificar si es owner del board
      const ownerCheck = await database.get<{created_by: string}>(
        'SELECT created_by FROM boards WHERE id = ?',
        [boardId]
      );
      
      if (ownerCheck && ownerCheck.created_by === userId) {
        // Si es owner, crear un objeto temporal Permission con role 'owner'
        return 'owner';
      }
      
      // Si no es owner, buscar en la tabla permissions
      const permission = await database.get<Permission>(
        'SELECT role FROM permissions WHERE user_id = ? AND board_id = ?',
        [userId, boardId]
      );
      return permission ? permission.role : undefined;
    }
  
    async getUserBoardsWithRole(userId: string, role?: string): Promise<Permission[]> {
      const sql = role 
        ? 'SELECT * FROM permissions WHERE user_id = ? AND role = ?'
        : 'SELECT * FROM permissions WHERE user_id = ?';
      const params = role ? [userId, role] : [userId];
      
      return database.all<Permission>(sql, params);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
      return database.get<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
    }

    async grantPermission(userId: string, boardId: string, role: string): Promise<void> {
      const id = crypto.randomUUID();
      await database.run(
        'INSERT INTO permissions (id, user_id, board_id, role) VALUES (?, ?, ?, ?)',
        [id, userId, boardId, role]
      );
    }
  
    async revokePermission(userId: string, boardId: string): Promise<void> {
      await database.run(
        'DELETE FROM permissions WHERE user_id = ? AND board_id = ?',
        [userId, boardId]
      );
    }
  }