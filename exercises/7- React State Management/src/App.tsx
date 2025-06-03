import { useEffect, useRef } from 'react'
import './App.css'

import { TaskList } from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterNav from './components/FilterNav';
import { useTasks, useAddTask, useUpdateTask, useDeleteTask, useToggleTask, useChangeFilter, useClearCompletedTasks, useCurrentFilter } from './hooks/useTasks';
import NotificationsContainer from './components/NotificationsContainer';
import { useToast } from './hooks/useToast';
import PageNav from './components/PageNav';
import Modal from './components/Modal';
import { currentBoardAtom } from './stores/boardStore';
import { useAtom } from 'jotai';


function App() {
  const { filter } = useCurrentFilter();
  const [ board ] = useAtom(currentBoardAtom); // Obtener el tablero actual desde el hook de filtro
  const { data: state, error: fetchError, isLoading } = useTasks(); // Cargar todas las tareas inicialmente
  const { mutate: addTask } = useAddTask(); // Hook para añadir tareas
  const { mutate: updateTask } = useUpdateTask(); // Hook para actualizar tareas
  const { mutate: deleteTask } = useDeleteTask(); // Hook para eliminar tareas
  const { mutate: clearCompleted } = useClearCompletedTasks(); // Hook para eliminar tareas completadas
  const { mutate: toggleTaskStatus } = useToggleTask(); // Hook para cambiar el estado de las tareas
  const { mutate: changeFilter } = useChangeFilter(); // Hook para cambiar el filtro de tareas
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
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[15px] max-w-[600px] mx-auto font-sans">
      <NotificationsContainer />
      
      <header className="text-center bg-[#f2efe8]">
        <h1 className="text-[42px] font-bold py-[15px]">
          {board || 'Lista de Tareas'}
        </h1>
        
        <FilterNav filter={filter} onFilterChange={changeFilter} />
      </header>
      
      <TaskForm 
        onAddTask={addTask} 
        onUpdateTask={(taskId, newText) => updateTask({ taskId, newText })} 
      />
      
      <TaskList 
        tasks={state?.tasks || []} 
        filter={filter}
        onToggleComplete={(taskId) => toggleTaskStatus({ taskId })} 
        onDeleteTask={(taskId) => deleteTask(taskId)} 
      />
      
      <div className="flex justify-end p-2">
        <button 
          className="bg-transparent border-none text-[#e8994a] cursor-pointer text-base" 
          onClick={() => clearCompleted()}
          aria-label="Limpiar tareas completadas"
        >
          Limpiar completadas
        </button>
      </div>

      <PageNav></PageNav>

      <Modal modalId='deleteTask' title='Confirmar eliminación' color='danger' />
    </div>
  );
}

export default App;
