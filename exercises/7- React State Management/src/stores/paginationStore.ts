import { atom } from 'jotai';

// Solo mantener los átomos de estado fundamentales
export const pageAtom = atom(1); // Página actual
export const pageLimitAtom = atom(5); // Cantidad de tareas por página