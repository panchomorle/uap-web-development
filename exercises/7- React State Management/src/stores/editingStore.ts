// stores/editingStore.ts
import { atom } from 'jotai';
import type { Task } from '../types';

// Átomo para almacenar qué tarea está siendo editada (null si ninguna)
export const editingTaskAtom = atom<Task | null>(null);

// Átomo derivado para verificar si hay alguna tarea en edición
export const isEditingAtom = atom((get) => get(editingTaskAtom) !== null);

// Átomo derivado para obtener el ID de la tarea en edición
export const editingTaskIdAtom = atom((get) => get(editingTaskAtom)?.id ?? null);

// Actions para manejar el estado de edición
export const startEditingAtom = atom(
  null,
  (get, set, task: Task) => {
    set(editingTaskAtom, task);
  }
);

export const stopEditingAtom = atom(
  null,
  (get, set) => {
    set(editingTaskAtom, null);
  }
);