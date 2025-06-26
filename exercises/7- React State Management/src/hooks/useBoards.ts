import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../constants/constants';
import type { Board } from '../types';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

const queryKey = ['boards'];

const fetchBoardsQuery = async () => {
    const response = await fetch(`${BASE_URL}/boards`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
      });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Error al cargar tableros: ' + (errorData.error || 'error desconocido'));
    }
    const data = await response.json();
    if (!data) {
        throw new Error(data.error || 'Error al cargar tableros');
    }
    return data.boards as Board[];
};

export const useBoards = () => {
    const { user, isAuthenticated } = useAuth();
    return useQuery<Board[]>({
        queryKey: [queryKey, user?.id],
        queryFn: () => fetchBoardsQuery(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        placeholderData: (previousData) => previousData,
        retry: 1, // No reintentar automáticamente
        refetchOnWindowFocus: false, // No refrescar al volver a enfocar la ventana
        refetchOnMount: false, // No refrescar al montar el componente si ya falló
        refetchOnReconnect: false, // No refrescar al recuperar la conexión
        enabled: isAuthenticated, // Solo ejecutar si el usuario está autenticado
    });
};

const createBoardMutation = async (boardName: string) => {
    const response = await fetch(`${BASE_URL}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ name: boardName })
      });

      if (!response.ok){
        const errorText = await response.text();
        throw new Error(errorText || 'Error al añadir tablero');
      }
      return response;
    }

export const useAddBoard = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: createBoardMutation,
        onSuccess: (data) => {
            // Actualizar la lista de tableros
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            
            toast.success('✅ Tablero añadido correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al agregar tablero: ${error.message}`);
        }
    });
};

export const useDeleteBoard = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (boardId: string) => {
            const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar tablero');
            }
        },
        onSuccess: () => {
            // Actualizar la lista de tableros
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast.success('✅ Tablero eliminado correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al eliminar tablero: ${error.message}`);
        }
    });
}