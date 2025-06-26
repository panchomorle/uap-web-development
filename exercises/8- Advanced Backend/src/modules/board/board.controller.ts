import { Request, Response } from "express";
import { BoardService } from "./board.service";
import { PermissionsService } from "../permission/permission.service";

export class BoardController {
    constructor(
        private readonly boardService: BoardService,
        private readonly permissionService: PermissionsService
    ) {}

    getAllBoards = async (req: Request, res: Response): Promise<void> => {
        if(!req.user || !req.user.id) {
            res.status(401).send('Unauthorized: User not authenticated');
            return;
        }
        try {
            const boards = await this.boardService.getBoardsForUser(req.user.id);
            res.json({ boards });
        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    };

    getBoardById = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id; // Asumiendo que el usuario está autenticado y su ID está en req.user
        if (!userId) {
            res.status(401).send('Unauthorized: User ID is required');
            return;
        }
        try {
            const hasPermission = await this.permissionService.canAccessBoard(userId, req.params.id);
            if (!hasPermission) {
                res.status(403).send('Forbidden: You do not have permission to access this board');
                return;
            }
            const board = await this.boardService.getBoardById(req.params.id);
            if (board) {
                res.json(board);
            } else {
                res.status(404).send('Board not found');
            }
        } catch (error) {
            console.error('Error fetching board:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    createBoard = async (req: Request, res: Response): Promise<void> => {
        if (!req.body.name) {
            res.status(400).send('Board name is required');
            return;
        }
        const name = req.body.name.trim();
        if (typeof req.body.name !== 'string' || req.body.name === '') {
            res.status(400).send('Invalid board name');
            return;
        }
        const creatorId = req.user.id; // Asumiendo que el usuario está autenticado y su ID está en req.user
            if (!creatorId) {
                res.status(401).send('Unauthorized: User ID is required');
                return;
            }
        try {
            await this.boardService.createBoard(name, creatorId);
            res.status(201).send('Board created');
        } catch (error) {
            console.error('Error creating board:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    deleteBoard = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).send('Unauthorized: User ID is required');
            return;
        }
        const boardId = req.params.id;
        if (!boardId) {
            res.status(400).send('Board ID is required');
            return;
        }
        try {
            const hasPermission = await this.permissionService.canDeleteBoard(userId, boardId);
            if (!hasPermission) {
                res.status(403).send('Forbidden: You do not have permission to delete this board');
                return;
            }
            await this.boardService.deleteBoard(boardId);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting board:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}