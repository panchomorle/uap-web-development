import './App.css'

import { TaskList } from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterNav from './components/FilterNav';
import { useClearCompletedTasks } from './hooks/useTasks';
import NotificationsContainer from './components/NotificationsContainer';
import PageNav from './components/PageNav';
import Modal from './components/Modal';
import { currentBoardAtom } from './stores/boardStore';
import { useAtom } from 'jotai';
import { useBoards } from './hooks/useBoards';
import Spinner from './components/Spinner';


function App() {
  const [ currentBoardId ] = useAtom(currentBoardAtom); // Obtener el tablero actual desde el hook de filtro
  const { data: boards, isLoading: isLoadingBoards } = useBoards(); // Cargar los tableros
  const { mutate: clearCompleted, isPending: isClearingCompleted } = useClearCompletedTasks(); // Hook para eliminar tareas completadas
  
  return (
    <div className="w-full flex flex-col gap-[15px] max-w-[600px] mx-auto font-sans">
      <NotificationsContainer />
      
      <header className="text-center bg-[#f2efe8]">
        <h1 className="text-[42px] font-bold py-[15px]">
          {isLoadingBoards ? (
            <span className="flex items-center justify-center">
              <Spinner width={24} height={24} className="fill-blue-500 mr-2" />
              Cargando...
            </span>
          ) : (
            boards?.find((b)=> b.id === currentBoardId)?.name || 'Lista de Tareas'
          )}
        </h1>
        
        <FilterNav/>
      </header>
      
      <TaskForm/>
      
      <TaskList/>
      
      <div className="flex justify-end p-2">
        <button 
          className="bg-transparent border-none text-[#e8994a] cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={() => clearCompleted()}
          disabled={isClearingCompleted}
          aria-label="Limpiar tareas completadas"
        >
          {isClearingCompleted ? (
            <span className="flex items-center">
              <Spinner width={16} height={16} className="fill-orange-500 mr-1" />
              Limpiando...
            </span>
          ) : (
            'Limpiar completadas'
          )}
        </button>
      </div>

      <PageNav></PageNav>

      <Modal modalId='deleteTask' title='Confirmar eliminación' color='danger' />
    </div>
  );
}

export default App;
