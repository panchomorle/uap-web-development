import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../constants/constants';
import type { Filter, State, Task } from '../types';
import { useToast } from './useToast';
import { usePagination } from './usePagination';
import { useAtom } from 'jotai';
import { currentBoardAtom } from '../stores/boardStore';
import { taskRefetchIntervalAtom } from '../stores/settingsStore';
import { useFilter } from './useFilter';

const fetchTasksQuery = async ({boardId, filter, page, limit}: {
  boardId: string
  filter: Filter, 
  page: number, 
  limit: number, 
}) => {
    const response = await fetch(`${BASE_URL}/tasks?boardId=${boardId}&filter=${filter}&page=${page}&limit=${limit}`,
    {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
    if (!response.ok) {
        throw new Error(response.statusText + ' - ' + (await response.json()).error || '');
    }
    const state = await response.json();
    return state as State;
  };

export const useTasks = () => {
    const { filter } = useFilter();
    const { currentPage, pageLimit } = usePagination();
    
    const [boardIdParam] = useAtom(currentBoardAtom);
    const [refetchInterval] = useAtom(taskRefetchIntervalAtom);
    
    return useQuery({
        queryKey: ['tasks', filter, currentPage, pageLimit, boardIdParam],
        queryFn: () => fetchTasksQuery({
            filter, 
            page: currentPage, 
            limit: pageLimit, 
            boardId: boardIdParam
        }),
        staleTime: 1000 * 60 * 5, // 5 minutos
        refetchInterval: refetchInterval * 1000, // Convertir segundos a milisegundos
        placeholderData: (previousData) => previousData,
        retry: 1, // No reintentar automáticamente
        refetchOnWindowFocus: false, // No refrescar al volver a enfocar la ventana
        refetchOnMount: false, // Usar la caché en mount si existe
        refetchOnReconnect: false, // No refrescar al recuperar la conexión
        enabled: true, // Siempre activado
    });
};

const createTaskMutation = async (taskText: string, boardId: string) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ board_id: boardId, description: taskText })
      });
      const res = await response.json();
      if (!response.ok){
        throw new Error(res.error || 'Error al añadir tarea');
      }
      return res.message
    }

export const useAddTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { filter } = useFilter();
    const [ boardId ]  = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async (taskText: string) => createTaskMutation(taskText, boardId),
        onSuccess: (data) => {
            // Actualizar todas las vistas de filtros
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Optimísticamente agregar a la vista actual si corresponde
            const shouldShowInCurrentFilter = 
                filter === 'all' || 
                (filter === 'undone' && !data.completed) ||
                (filter === 'done' && data.completed);
                
            if (shouldShowInCurrentFilter) {
                queryClient.setQueryData(['tasks', filter], (old: Task[] = []) => [
                    ...old,
                    { ...data, isOptimistic: true }
                ]);
            }

            toast.success('✅ Tarea añadida correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al agregar tarea: ${error.message}`);
        }
    });
};

export const useToggleTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    //const { filter } = useFilter();
    
    return useMutation({
        mutationFn: async ({ taskId }: { taskId: Task['id']}) => {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error desconocido');
            }
            const data = await response.json();
            return { completed: data.completed, message: data.message };
        },
        onSuccess: (data) => {
            // Invalidar todas las queries de tasks para refrescar todas las vistas
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Actualización optimista para la vista actual
            // queryClient.setQueryData(['tasks', filter], (old: Task[] = []) => {
            //     // Invertir el estado de completado de la tarea
            //     const newCompleted = oldTask ? !oldTask.completed : true;
                
            //     const updatedTasks = old.map((task) =>
            //         task.id === taskId ? { ...task, ...data, completed: newCompleted } : task
            //     );
                
            //     // Filtrar según la vista actual después de la actualización
            //     return updatedTasks.filter(task => {
            //         if (filter === 'done') return task.completed;
            //         if (filter === 'undone') return !task.completed;
            //         return true; // 'all'
            //     });
            // });
            toast.success(`✅ Tarea ${data.completed ? 'completada' : 'desmarcada como completada'} correctamente`);
        },
        onError: (error) => {
            toast.error(`❌ Error al cambiar estado de tarea: ${error.message}`);
        }
    });
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { filter } = useFilter();
    
    return useMutation({
        mutationFn: async ({ taskId, newText }: { taskId: Task['id']; newText: string }) => {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ description: newText })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error desconocido');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error || 'Error al actualizar tarea');
            }
            return data.message;
        },
        onSuccess: (data, { taskId }) => {
            // Invalidar todas las queries
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Actualización optimista
            queryClient.setQueryData(['tasks', filter], (old: Task[] = []) =>
                old.map((task) =>
                    task.id === taskId ? { ...task, ...data } : task
                )
            );
            toast.success('✅ Tarea actualizada correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al actualizar tarea: ${error.message}`);
        }
    });
}

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { filter } = useFilter();
    
    return useMutation({
        mutationFn: async (taskId: Task['id']) => {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error desconocido');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error || 'Error al eliminar tarea');
            }
            return data.message;
        },
        onSuccess: (_, taskId) => {
            // Invalidar todas las queries
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Actualización optimista
            queryClient.setQueryData(['tasks', filter], (old: Task[] = []) =>
                old.filter((task) => task.id !== taskId)
            );
            toast.success('✅ Tarea eliminada correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al eliminar tarea: ${error.message}`);
        }
    });
};

export const useClearCompletedTasks = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [ boardId ]  = useAtom(currentBoardAtom);

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BASE_URL}/tasks/completed?boardId=${boardId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error desconocido');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error || 'Error al limpiar tareas completadas');
            }
            return data.message;
        },
        onSuccess: () => {
            // Invalidar todas las queries para refrescar todas las vistas
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('✅ Tareas completadas eliminadas correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al limpiar tareas completadas: ${error.message}`);
        }
    });
};