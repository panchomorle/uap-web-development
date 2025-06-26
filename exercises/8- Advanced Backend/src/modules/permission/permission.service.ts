import { PermissionsRepository } from "./permission.respository";
import { Role, User } from "../../types";

export class PermissionsService {
  constructor(private permissionsRepo: PermissionsRepository) {}
  async getAllUsersWithPermissions(boardId: string): Promise<{ user: User; role: Role }[]> {
    return this.permissionsRepo.getAllUsersWithPermissions(boardId);
  }

  async canAccessBoard(userId: string, boardId: string): Promise<boolean> {
    const permission = await this.permissionsRepo.getUserPermissionForBoard(userId, boardId);
    return !!permission;
  }

  async canEditBoard(userId: string, boardId: string): Promise<boolean> {
    const role = await this.permissionsRepo.getUserPermissionForBoard(userId, boardId);
    return role === 'owner' || role === 'editor';
  }

  async canDeleteBoard(userId: string, boardId: string): Promise<boolean> {
    const role = await this.permissionsRepo.getUserPermissionForBoard(userId, boardId);
    return role === 'owner';
  }

  async getUserRole(userId: string, boardId: string): Promise<string | null> {
    const role = await this.permissionsRepo.getUserPermissionForBoard(userId, boardId);
    return role || null;
  }

  async grantPermission(email: string, boardId: string, role: Role): Promise<void> {
    const user = await this.permissionsRepo.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found with the provided email');
    }
    const existingRole = await this.permissionsRepo.getUserPermissionForBoard(user.id, boardId);
    if (existingRole && role === existingRole) {
      throw new Error('Permission already exists for this user on this board');
    }
    await this.permissionsRepo.grantPermission(user.id, boardId, role);
  }

  async revokePermission(userId: string, boardId: string, role: Role): Promise<void> {
    const existingRole = await this.permissionsRepo.getUserPermissionForBoard(userId, boardId);
    if (!existingRole || existingRole !== role) {
      throw new Error('No permission found for this user on this board');
    }
    await this.permissionsRepo.revokePermission(userId, boardId);
  }
}