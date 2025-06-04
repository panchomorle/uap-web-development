import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Átomo para el intervalo de actualización de tareas (en segundos)
// Usa atomWithStorage para persistir el valor en localStorage
export const taskRefetchIntervalAtom = atomWithStorage('taskRefetchInterval', 10);

// Átomo para decidir si las descripciones de tareas deben mostrarse en mayúsculas
export const taskDescriptionUppercaseAtom = atomWithStorage('taskDescriptionUppercase', false);