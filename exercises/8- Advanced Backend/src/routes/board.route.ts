import { Router } from "express";
import { BoardRepository } from "../modules/board/board.repository";
import { BoardService } from "../modules/board/board.service";
import { BoardController } from "../modules/board/board.controller";
import { authMiddleware, authMiddlewareForHeaders } from "../middleware/auth.middleware";
import { permissionService } from "../shared/services";

const router = Router();

//middleware de autenticación
router.use(authMiddleware);

const boardRepository = new BoardRepository();
const boardService = new BoardService(boardRepository);

const boardController = new BoardController(boardService, permissionService);

router.get("/", boardController.getAllBoards);
router.get("/:id", boardController.getBoardById);
router.post("/", boardController.createBoard);
router.delete("/:id", boardController.deleteBoard);

export { router as boardRoutes };