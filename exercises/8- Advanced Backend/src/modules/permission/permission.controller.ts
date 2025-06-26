import { Request, Response } from "express";
import { PermissionsService } from "./permission.service";

export class PermissionController {
  constructor(private permissionService: PermissionsService) {}

    grantPermission = async (req: Request, res: Response): Promise<void> => {
        const { email, boardId, role } = req.body;
        const userId = req.user?.id;
        try {
            const hasPermission = await this.permissionService.canEditBoard(userId, boardId);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to grant permissions on this board' });
                return
            }
            await this.permissionService.grantPermission(email, boardId, role);
            res.status(201).json({ message: 'Permission granted successfully' });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message});
        }
    }

    revokePermission = async (req: Request, res: Response): Promise<void> => {
        const { userId: targetId, boardId, role } = req.body;
        const userId = req.user?.id;
        try {
            const hasPermission = await this.permissionService.canEditBoard(userId, boardId);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to revoke permissions on this board' });
                return
            }
            await this.permissionService.revokePermission(targetId, boardId, role);
            res.status(200).json({ message: 'Permission revoked successfully' });
        } catch (error) {
            res.status(400).json({ error: error });
        }
    }

    getAllUsersWithPermissions = async (req: Request, res: Response): Promise<void> => {
        const { boardId } = req.params;
        const userId = req.user?.id;
        try {
            const hasPermission = await this.permissionService.canAccessBoard(userId, boardId);
            if (!hasPermission) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to view permissions for this board' });
                return
            }
            const usersWithPermissions = await this.permissionService.getAllUsersWithPermissions(boardId);
            res.status(200).json(usersWithPermissions);
        } catch (error) {
            res.status(400).json({ error: error });
        }
    }
}