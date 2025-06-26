import './App.css'

import { TaskList } from './components/TaskList';
import TaskForm from './components/TaskForm';
import { useClearCompletedTasks, useTasks } from './hooks/useTasks';
import PageNav from './components/PageNav';
import Modal from './components/Modal';
import { currentBoardAtom } from './stores/boardStore';
import { useAtom } from 'jotai';
import { useBoards } from './hooks/useBoards';
import Spinner from './components/Spinner';
import BoardHeader from './components/BoardHeader';
import ShareButton from './components/ShareButton';
import { ROLE_TRANSLATION } from './constants/constants';
import { useMemo } from 'react';


function App() {
  const [ currentBoardId ] = useAtom(currentBoardAtom); // Obtener el tablero actual desde el hook de filtro
  const { data: boards, isLoading: isLoadingBoards } = useBoards(); // Cargar los tableros
  const { mutate: clearCompleted, isPending: isClearingCompleted } = useClearCompletedTasks(); // Hook para eliminar tareas completadas

  const thisBoard = useMemo(() => {
    if (isLoadingBoards || !boards) return null; // Si aún se están cargando los tableros, retornar null
    return boards?.find((b) => b.id === currentBoardId);
  }, [isLoadingBoards, boards, currentBoardId]);

  return (
    <div className="w-full flex flex-col gap-[15px] max-w-[600px] mx-auto font-sans">
      
      <header className="text-center bg-[#f2efe8]">
        <i className='block text-right text-[#999] p-2'>Viendo como {ROLE_TRANSLATION[thisBoard?.role!]}</i>
        <h1 className="text-3xl font-bold py-[15px]">
          {isLoadingBoards ? (
            <span className="flex items-center justify-center">
              <Spinner width={24} height={24} className="fill-blue-500 mr-2" />
              Cargando...
            </span>
          ) : (
            thisBoard?.name || 'Lista de Tareas'
          )}
        </h1>
        
        <BoardHeader>
          <ShareButton/>
        </BoardHeader>
      </header>
      
      <TaskForm/>
      
      <TaskList/>
      
      <div className="flex justify-end p-2">
        <PageNav></PageNav>
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

      <Modal modalId='deleteTask' title='Confirmar eliminación' color='danger' />
    </div>
  );
}

export default App;
