// TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { editingTaskAtom, stopEditingAtom, isEditingAtom } from '../stores/editingStore';

type TaskFormProps = {
  onAddTask: (task: string) => void;
  onUpdateTask: (taskId: number, newText: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, onUpdateTask }) => {
  const [taskInput, setTaskInput] = useState('');
  const [editingTask] = useAtom(editingTaskAtom);
  const [, stopEditing] = useAtom(stopEditingAtom);
  const isEditing = useAtomValue(isEditingAtom);
  
  // Efecto para cargar el texto de la tarea cuando se entra en modo edición
  useEffect(() => {
    if (editingTask) {
      setTaskInput(editingTask.text);
    } else {
      setTaskInput('');
    }
  }, [editingTask]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trimmedInput = taskInput.trim();
    
    // Validaciones
    if (!trimmedInput) {
      return;
    }
    
    if (trimmedInput.length > 200) {
      return;
    }
    
    if (isEditing && editingTask) {
      // Modo edición: actualizar tarea existente
      onUpdateTask(editingTask.id, trimmedInput);
      stopEditing();
    } else {
      // Modo normal: agregar nueva tarea
      onAddTask(trimmedInput);
    }
    
    // Limpiar el input
    setTaskInput('');
  };
  
  const handleCancel = () => {
    stopEditing();
    setTaskInput('');
  };
  
  return (
    <div className="mx-2 my-2">
      <form 
        className="flex shadow-md rounded-[20px] overflow-hidden"
        aria-label={isEditing ? "Formulario para editar tarea" : "Formulario para agregar tarea"}
        onSubmit={handleSubmit}
      >
        <label htmlFor="todo-input" className="sr-only">
          {isEditing ? "Editar tarea" : "Nueva tarea"}
        </label>
        <input 
          type="text" 
          id="todo-input" 
          name="taskInput" 
          placeholder={isEditing ? "Edita tu tarea..." : "¿Qué quieres hacer?"} 
          className="flex-1 py-[15px] px-[5px] border-none bg-[#f1ece6] text-base rounded-none outline-hidden placeholder-[#aaa]"
          required
          maxLength={200}
          aria-required="true"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button 
          type="submit" 
          className={`py-[15px] px-[30px] text-white border-none font-bold cursor-pointer ${
            isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#7ab4c6] hover:bg-[#6aa3b5]'
          }`}
        >
          {isEditing ? 'ACTUALIZAR' : 'AGREGAR'}
        </button>
        
        {/* Botón de cancelar solo en modo edición */}
        {isEditing && (
          <button 
            type="button"
            onClick={handleCancel}
            className="py-[15px] px-[20px] bg-gray-500 hover:bg-gray-600 text-white border-none font-bold cursor-pointer"
          >
            CANCELAR
          </button>
        )}
      </form>
    </div>
  );
};

export default TaskForm;