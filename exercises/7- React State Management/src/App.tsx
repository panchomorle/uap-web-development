import { useEffect } from 'react'
import './App.css'

import { TaskList } from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterNav from './components/FilterNav';
import { useTasks, useAddTask, useUpdateTask, useDeleteTask, useToggleTask, useChangeFilter, useClearCompletedTasks, useCurrentFilter } from './hooks/useTasks';
import NotificationsContainer from './components/NotificationsContainer';
import { useToast } from './hooks/useToast';
import { usePagination } from './hooks/usePagination';
import PageNav from './components/PageNav';
import Modal from './components/Modal';


function App() {
  const { filter } = useCurrentFilter();
  const { currentPage, pageLimit } = usePagination();
  const { data: state, error: fetchError, isLoading } = useTasks(currentPage, pageLimit); // Cargar todas las tareas inicialmente
  const { mutate: addTask } = useAddTask(); // Hook para añadir tareas
  const { mutate: updateTask } = useUpdateTask(); // Hook para actualizar tareas
  const { mutate: deleteTask } = useDeleteTask(); // Hook para eliminar tareas
  const { mutate: clearCompleted } = useClearCompletedTasks(); // Hook para eliminar tareas completadas
  const { mutate: toggleTaskStatus } = useToggleTask(); // Hook para cambiar el estado de las tareas
  const { mutate: changeFilter } = useChangeFilter(); // Hook para cambiar el filtro de tareas
  const toast = useToast();
  // Obtener el filtro de la URL al cargar la página
  useEffect(() => {
    if(fetchError){
      toast.error(`❌ Error al traer tareas: ${fetchError.message}`);
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
          <span className="text-[#6b6b6b]">ToDo</span>
          <span className="text-[#e8994a]">List</span>
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
