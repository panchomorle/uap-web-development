export type Task = { id: number; text: string; completed: boolean };
export type State = { tasks: Task[], filter: string };