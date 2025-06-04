// Task.tsx
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { editingTaskIdAtom, startEditingAtom, stopEditingAtom } from '../stores/editingStore';
import type { Task } from '../types';
import { openModalAtom } from '../stores/modalStore';
import { useDeleteTask, useToggleTask } from '../hooks/useTasks';

type TaskProps = {
    task: Task;
    uppercase?: boolean;
  }

export const TaskComp = ({ task, uppercase = false }: TaskProps) => {
  const { mutate: deleteTask } = useDeleteTask(); // Hook para eliminar tareas
  const { mutate: toggleTaskStatus } = useToggleTask(); // Hook para cambiar el estado de las tareas
  const editingTaskId = useAtomValue(editingTaskIdAtom);
  const [, startEditing] = useAtom(startEditingAtom);
  const [, stopEditing] = useAtom(stopEditingAtom);
  const [, openModal ] = useAtom(openModalAtom);
  
  const isThisTaskBeingEdited = editingTaskId === task.id;
  
  const handleToggleComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toggleTaskStatus({taskId: task.id});
  };
  
  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    openModal({
      modalId: 'deleteTask',
      text: `¿Estás seguro de que quieres eliminar la tarea "${task.text}"?`,
      onConfirm: () => {deleteTask(task.id)}
    });
  };
  
  const handleStartEdit = () => {
    if (!task.completed) { // Solo permitir edición si no está completada
      startEditing(task);
    }
  };
  
  const handleCancelEdit = () => {
    stopEditing();
  };
  
  return (
    <article 
      className={`flex items-center p-[15px] border-b border-[#e0dcd6] last:border-b-0 ${
        isThisTaskBeingEdited ? 'bg-blue-50 border-blue-200' : ''
      }`}
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
        />
      </form>
      
      {isThisTaskBeingEdited ? (
        // Modo edición: mostrar indicador visual
        <div className="flex-1 px-[10px] flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            Editando tarea
          </span>
        </div>
      ) : (
        // Modo normal: mostrar texto de la tarea
        <p 
          className={`flex-1 text-base px-[10px] rounded ${
            task.completed ? 'text-[#aaa] line-through' : 'text-[#333]'
          }`}
          title={task.completed ? "Tarea completada" : "Tarea pendiente"}
        >
          {uppercase ? task.text.toUpperCase() : task.text}
        </p>
      )}
      
      {!isThisTaskBeingEdited && (
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={task.completed}
          className="w-5 h-5 bg-transparent border-none cursor-pointer relative opacity-50 hover:opacity-100 mr-1"
          aria-label="Editar tarea"
          title="Editar tarea"
        >
          ✎
        </button>
      )}
      
      {!isThisTaskBeingEdited ? (
        <form onSubmit={handleDelete}>
          <input type="hidden" name="taskId" value={task.id} />
          <button 
            type="submit" 
            value={task.id}
            className="w-5 h-5 bg-transparent border-none cursor-pointer relative opacity-50 hover:opacity-100"
            aria-label="Eliminar tarea"
            title="Eliminar tarea"
          >
            ×
          </button>
        </form>
      ) : (
        <button
            onClick={handleCancelEdit}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
          >
            Cancelar
          </button>
      )}
    </article>
  );
};