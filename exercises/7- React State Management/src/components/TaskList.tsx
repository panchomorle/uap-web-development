import React from 'react';
import type { Task } from '../types';
import { TaskComp } from './Task';

type TaskListProps = {
  tasks: Task[];
  filter: string;
  onToggleComplete: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

export const TaskList = ({ tasks, filter, onToggleComplete, onDeleteTask }: TaskListProps) => {
  // Si no hay tareas que mostrar según el filtro actual
  if (tasks.length === 0) {
    let emptyMessage = 'No hay tareas';
    
    if (filter === 'done') {
      emptyMessage = 'No hay tareas completadas';
    } else if (filter === 'undone') {
      emptyMessage = 'No hay tareas pendientes';
    }
    
    return (
      <section 
        className="bg-[#f1ece6] rounded-[20px] mx-5 my-5 shadow-md overflow-hidden"
        id="todo-list"
        aria-label="Lista de tareas"
      >
        <p className="p-4 text-center text-gray-500">{emptyMessage}</p>
      </section>
    );
  }
  
  return (
    <div className="w-full flex flex-col gap-[15px] max-h-80 mx-auto font-sans overflow-hidden">
      <section 
        className="bg-[#f1ece6] rounded-[20px] mx-2 my-2 shadow-md overflow-y-scroll"
        id="todo-list"
        aria-label="Lista de tareas"
      >
        {tasks.map(task => (
          <TaskComp
            key={filter+task.id} 
            task={task as Task} 
            onToggleComplete={onToggleComplete} 
            onDeleteTask={onDeleteTask}
          />
        ))}
      </section>
    </div>
  );
};