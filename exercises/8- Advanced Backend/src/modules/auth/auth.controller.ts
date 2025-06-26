import { Request, Response } from "express";
import { CreateUserDto } from "./auth.dto";
import { AuthService, LoginServiceResponse } from "./auth.service";

export class AuthController {
    constructor(private authService: AuthService) {}
    
    register = async (req: Request, res: Response): Promise<void> => {
        const userData: CreateUserDto = req.body;
        try {
            const user = await this.authService.register(userData);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        const token = req.signedCookies?.token;
        if (token) {
            res.status(409).json({ error: "User already logged in" });
            return;
        }
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        try {
            const {userWithoutPassword: user, token} : LoginServiceResponse = await this.authService.login({ email, password });
            if (!user) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
            if (!token) {
                res.status(500).json({ error: "Error generating token" });
                return;
            }
            // Guardar el token en una cookie segura
            res.cookie("token", token, {
                secure: process.env.NODE_ENV === 'production', // Solo usar secure en producción
                signed: true,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            })
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        res.clearCookie("token"); // Eliminar la cookie del token
        res.status(200).json({ message: "Logged out successfully" });
    }
    
    updateUser = async (req: Request, res: Response): Promise<void> => {
        const userId = req.params.id;
        const { password: newPassword }: Partial<CreateUserDto> = req.body;
        if (!newPassword) {
            res.status(400).json({ error: "New password is required" });
            return;
        }
        try {
            const updatedUser = await this.authService.updateUserPassword(userId, newPassword);
            if (!updatedUser) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
    getUserById = async (req: Request, res: Response): Promise<void> => {
        const userId = req.params.id;
        try {
            const user = await this.authService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
    getCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // El middleware authMiddleware ya verificó el token y asignó req.user
            const user = await this.authService.getUserById(req.user.id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    // Nuevo método que no requiere middleware - verifica directamente
    checkPublicAuthStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.signedCookies?.token;
            
            if (!token) {
                res.json({ isAuthenticated: false, user: null });
                return;
            }

            // Verificar el token manualmente
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            
            // Obtener información del usuario
            const user = await this.authService.getUserById(decoded.id);
            
            if (!user) {
                res.json({ isAuthenticated: false, user: null });
                return;
            }

            res.json({ 
                isAuthenticated: true, 
                user: { id: user.id, email: user.email }
            });
        } catch (error) {
            // Token inválido o expirado
            res.json({ isAuthenticated: false, user: null });
        }
    }
}