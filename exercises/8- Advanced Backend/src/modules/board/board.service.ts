import { Board } from "../../types";
import { BoardRepository } from "./board.repository";

export class BoardService {
    constructor(private boardRepository: BoardRepository) {}

    async getAllBoards(): Promise<Board[]> {
        return this.boardRepository.getAllBoards();
    }

    async getBoardsForUser(userId: string): Promise<Board[]> {
        return this.boardRepository.getAvailableBoardsByUserId(userId);
    }

    async getBoardById(id: string): Promise<Board | undefined> {
        return this.boardRepository.getBoardById(id);
    }

    async createBoard(name: string, creatorId: string): Promise<void> {
        const id = crypto.randomUUID();
        await this.boardRepository.createBoard(id, name, creatorId);
    }

    async deleteBoard(id: string): Promise<void> {
        await this.boardRepository.deleteBoard(id);
    }
}