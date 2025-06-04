import { useEffect, useRef } from 'react';
import type { Task } from '../types';
import { TaskComp } from './Task';
import { useAtom } from 'jotai';
import { taskDescriptionUppercaseAtom } from '../stores/settingsStore';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import { currentFilterAtom } from '../stores/filterStore';
import Spinner from './Spinner';

export const TaskList = () => {
  const [filter] = useAtom(currentFilterAtom);
  const { data: state, error: fetchError, isLoading } = useTasks(); // Cargar todas las tareas inicialmente
  const [descriptionUppercase] = useAtom(taskDescriptionUppercaseAtom);
  const toast = useToast();
  // Referencia para rastrear si ya se mostró un error por la misma causa
  const lastErrorRef = useRef<string | null>(null);

  // Mostrar error solo una vez por mensaje de error
  useEffect(() => {
    if(fetchError && fetchError.message !== lastErrorRef.current) {
      console.log("Error al traer tareas: ", fetchError);
      toast.error(`❌ Error al traer tareas: ${fetchError.message}`);
      lastErrorRef.current = fetchError.message;
    }
  }, [fetchError, toast]);
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Spinner width={48} height={48} className="fill-blue-500" />
      </div>
    );
  }
  
  // Si no hay tareas que mostrar según el filtro actual
  if (state?.tasks.length === 0) {
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
        {state?.tasks.map(task => (
          <TaskComp
            key={filter+task.id} 
            task={task as Task}
            uppercase={descriptionUppercase}
          />
        ))}
      </section>
    </div>
  );
};