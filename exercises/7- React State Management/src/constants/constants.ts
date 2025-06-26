export const BASE_URL = 'http://localhost:3000/api';
export const FILTERS = ['all', 'done', 'undone'] as const;
export const ROLES = ['owner', 'editor', 'viewer'] as const;

export const FILTER_TRANSLATION = {
    all: 'Todas',
    done: 'Completadas',
    undone: 'Pendientes',
    };

export const ROLE_TRANSLATION = {
    owner: 'Propietario',
    editor: 'Editor',
    viewer: 'Solo lectura',
};