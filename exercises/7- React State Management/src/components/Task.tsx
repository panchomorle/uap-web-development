import React from 'react';
import type { Task } from '../types';

type TaskProps = {
    task: Task;
    onToggleComplete: (taskId: number) => void;
    onDeleteTask: (taskId: number) => void;
}

// Componente para cada tarea individual
export const TaskComp = ({ task, onToggleComplete, onDeleteTask }: TaskProps) => {
  const handleToggleComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onToggleComplete(task.id);
  };
  
const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onDeleteTask(task.id);
};
  
  return (
    <article 
      className="flex items-center p-[15px] border-b border-[#e0dcd6] last:border-b-0" 
      id={String(task.id)}
      aria-label={`Tarea: ${task.text}`}
    >
      <form onSubmit={handleToggleComplete}>
        <input type="hidden" name="taskId" value={task.id} />
        <button 
          type="submit" 
          value={task.id}
          className={`task-circle-button border-2 w-5 h-5 rounded-full ${
            task.completed ? 'border-[#e8994a] bg-[#e8994a]' : 'border-[#888] bg-transparent'
          } cursor-pointer relative ${
            task.completed ? 'after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:-translate-x-1/2 after:-translate-y-1/2' : ''
          }`}
          aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
          aria-pressed={task.completed}
        ></button>
      </form>
      
      <p className={`flex-1 text-base px-[10px] ${task.completed ? 'text-[#aaa] line-through' : 'text-[#333]'}`}>
        {task.text}
      </p>
      
      <form onSubmit={handleDelete}>
        <input type="hidden" name="taskId" value={task.id} />
        <button 
          type="submit" 
          value={task.id}
          className="w-5 h-5 bg-transparent border-none cursor-pointer relative opacity-50"
          aria-label="Eliminar tarea"
        >
          X
        </button>
      </form>
    </article>
  );
};
