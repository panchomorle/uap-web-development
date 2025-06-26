import { PermissionsService } from "../modules/permission/permission.service";
import { PermissionsRepository } from "../modules/permission/permission.respository";

const permissionRepository = new PermissionsRepository();
// Instancia singleton de permissionService
export const permissionService = new PermissionsService(permissionRepository);