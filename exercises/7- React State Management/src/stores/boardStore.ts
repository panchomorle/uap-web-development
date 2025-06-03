import { atom } from "jotai";

type BoardId= string;

export const currentBoardAtom = atom<BoardId>("default")