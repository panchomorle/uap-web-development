import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { PermissionController } from "../modules/permission/permission.controller";
import { permissionService } from "../shared/services";

const router = Router();
router.use(authMiddleware);

const permissionController = new PermissionController(permissionService);

router.post("/", permissionController.grantPermission);
router.delete("/", permissionController.revokePermission);

router.get("/:boardId", permissionController.getAllUsersWithPermissions);
export { router as permissionRoutes }