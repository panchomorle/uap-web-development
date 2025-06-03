import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../constants/constants';
import type { Board, State } from '../types';
import { useToast } from './useToast';
import { usePagination } from './usePagination';
import { useAtom } from 'jotai';
import { currentBoardAtom } from '../stores/boardStore';
import { useCurrentFilter } from './useTasks';

const fetchBoardsQuery = async () => {
    const response = await fetch(`${BASE_URL}/getBoards`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    if (!response.ok) {
        console.log('Error en la respuesta de fetchBoardsQuery:', response);
        throw new Error('Error al cargar tableros');
    }
    const data = await response.json();
    if (!data.success || !data.data) {
        throw new Error(data.error || 'Error al cargar tableros');
    }
    
    return data.data.boards as Board[];
};

export const useBoards = () => {
    const { filter } = useCurrentFilter();
    const { currentPage, pageLimit } = usePagination();
    
    // Asegurar que boardId sea siempre string y no se convierta automáticamente
    const [ boardIdParam ] = useAtom(currentBoardAtom);
    console.log(boardIdParam, 'Board ID en useBoards');
    
    return useQuery({
        queryKey: ['boards', filter, currentPage, pageLimit],
        queryFn: () => fetchBoardsQuery(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        placeholderData: (previousData) => previousData,
        retry: 1, // No reintentar automáticamente
        refetchOnWindowFocus: false, // No refrescar al volver a enfocar la ventana
        refetchOnMount: false, // No refrescar al montar el componente si ya falló
        refetchOnReconnect: false, // No refrescar al recuperar la conexión
    });
};

const createBoardMutation = async (boardName: string) => {
    const response = await fetch(`${BASE_URL}/addBoard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ boardName: boardName })
      });
      const res = await response.json();
      if (!response.ok){
        throw new Error(res.error || 'Error al añadir tablero');
      }
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Error al añadir tablero');
      }
      return res.data
    }

export const useAddBoard = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: async (boardName: string) => createBoardMutation(boardName),
        onSuccess: (data) => {
            // Actualizar la lista de tableros
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            
            toast.success('✅ Tablero añadido correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al agregar tablero: ${error.message}`);
        }
    });
};