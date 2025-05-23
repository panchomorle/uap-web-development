import React, { useState } from 'react';

type TaskFormProps = {
  onAddTask: (task: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [taskInput, setTaskInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trimmedInput = taskInput.trim();
    
    // Validaciones
    if (!trimmedInput) {
      // Podemos manejar el error aquí o dejar que lo maneje el componente padre
      // Para este ejemplo, simplemente no enviamos la tarea
      return;
    }
    
    if (trimmedInput.length > 200) {
      // De igual forma, podemos manejar el error aquí
      return;
    }
    
    // Enviar la tarea al componente padre
    onAddTask(trimmedInput);
    
    // Limpiar el input
    setTaskInput('');
  };
  
  return (
    <form 
      className="flex mx-5 my-5 shadow-md rounded-[20px] overflow-hidden"
      aria-label="Formulario para agregar tarea"
      onSubmit={handleSubmit}
    >
      <label htmlFor="todo-input" className="sr-only">Nueva tarea</label>
      <input 
        type="text" 
        id="todo-input" 
        name="taskInput" 
        placeholder="¿Qué quieres hacer?" 
        className="flex-1 py-[15px] px-[5px] border-none bg-[#f1ece6] text-base rounded-none outline-hidden placeholder-[#aaa]"
        required
        maxLength={200}
        aria-required="true"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
      />
      <button 
        type="submit" 
        className="py-[15px] px-[30px] bg-[#7ab4c6] text-white border-none font-bold cursor-pointer" 
      >
        AGREGAR
      </button>
    </form>
  );
};

export default TaskForm;