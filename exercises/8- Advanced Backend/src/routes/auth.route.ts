import { Router } from "express";
import { AuthRepository } from "../modules/auth/auth.repository";
import { AuthService } from "../modules/auth/auth.service";
import { AuthController } from "../modules/auth/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get('/check-status', authController.checkPublicAuthStatus); // Nueva ruta pública
router.post("/logout", authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

router.put("/update/:id", authMiddleware, authController.updateUser);
router.get("/:id", authMiddleware, authController.getUserById);

export { router as authRoutes };