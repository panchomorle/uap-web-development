import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
      interface Request {
        //con esto creamos un objeto 'user' en la interfaz de Request utilizada por express
        user: { email: string; id: string };
      }
    }
  }

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.signedCookies?.token;
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const user = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, email: string };
        if (!user) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
    
        req.user = user; // Asignamos el usuario al objeto user de la request
        next(); //continuar con la siguiente función middleware o ruta
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
        return;
    }
}

export const authMiddlewareForHeaders = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, email: string };
        if (!user) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
    
        req.user = user; // Asignamos el usuario al objeto user de la request
        next(); //continuar con la siguiente función middleware o ruta
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
        return;
    }
}