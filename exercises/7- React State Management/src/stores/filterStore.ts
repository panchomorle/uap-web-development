import { atom } from "jotai";
import type { Filter } from "../types";

// Átomo para el filtro actual
export const currentFilterAtom = atom<Filter>("all");