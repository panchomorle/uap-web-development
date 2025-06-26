import { useEffect, useRef, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  // Referencia para rastrear si ya se mostró un error por la misma causa
  const lastErrorRef = useRef<string | null>(null);

  // Mostrar error solo una vez por mensaje de error
  useEffect(() => {
    if(fetchError && fetchError.message !== lastErrorRef.current) {
      toast.error(`❌ Error al traer tareas: ${fetchError.message}`);
      lastErrorRef.current = fetchError.message;
    }
  }, [fetchError, toast]);
  
  // Filtrar tareas por término de búsqueda
  const filteredTasks = state?.tasks.filter(task => 
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Spinner width={48} height={48} className="fill-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col gap-[15px] max-h-80 mx-auto font-sans overflow-hidden">
      <section 
        className="bg-[#f1ece6] rounded-[20px] mx-2 my-2 shadow-md overflow-y-scroll"
        id="todo-list"
        aria-label="Lista de tareas"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 px-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            type="search" 
            placeholder="Buscar tareas..." 
            aria-label="Buscar tareas"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredTasks.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            {searchTerm 
              ? `No se encontraron tareas que contengan "${searchTerm}"`
              : filter === 'done' 
                ? 'No hay tareas completadas'
                : filter === 'undone'
                  ? 'No hay tareas pendientes'
                  : 'No hay tareas'
            }
          </p>
        ) : (
          filteredTasks.map(task => (
            <TaskComp
              key={filter+task.id} 
              task={task as Task}
              uppercase={descriptionUppercase}
            />
          ))
        )}
      </section>
    </div>
  );
};