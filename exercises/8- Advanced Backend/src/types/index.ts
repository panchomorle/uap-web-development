export type Board = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export type Task = { 
    id: string;
    board_id: string;
    description: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
};

export type DbTask = {
    id: string;
    board_id: string;
    description: string;
    completed: number; // SQLite usa 0/1 para boolean
    created_at: string;
    updated_at: string;
};

export type Filter = 'all' | 'done' | 'undone';
// export type State = {
//     boards: { [key: string]: Board },
//     filter: string
// };
export interface User {
    id: string;
    email: string;
    password: string;
}

export type Role = 'owner' | 'editor' | 'viewer';

export interface Permission {
    id: string;
    user_id: string;
    board_id: string;
    role: Role;
    created_at: string;
    updated_at: string;
}