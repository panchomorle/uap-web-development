import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, FILTER_TRANSLATION } from '../constants/constants';
import type { Filter, State, Task } from '../types';
import { useToast } from './useToast';
import { usePagination } from './usePagination';
import { useAtom } from 'jotai';
import { currentBoardAtom } from '../stores/boardStore';

const fetchTasksQuery = async ({filter, page, limit, boardId}: {
  filter: Filter, 
  page: number, 
  limit: number, 
  boardId: string
}) => {
    const response = await fetch(`${BASE_URL}/filter?filter=${filter}&page=${page}&limit=${limit}&board=${boardId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    if (!response.ok) {
        console.log( 'TIRANDO Error en la respuesta de fetchTasksQuery:', response);
        throw new Error('Error al cargar tareas');
    }
    const data = await response.json();
        if (!data.success || !data.data) {
        throw new Error(data.error || 'Error al cargar tareas');
    }
    
    return data.data.state as State;
  };

export const useTasks = () => {
    const { filter } = useCurrentFilter();
    const { currentPage, pageLimit } = usePagination();
    
    const [ boardIdParam ] = useAtom(currentBoardAtom);
    
    return useQuery({
        queryKey: ['tasks', filter, currentPage, pageLimit, boardIdParam],
        queryFn: () => fetchTasksQuery({
            filter, 
            page: currentPage, 
            limit: pageLimit, 
            boardId: boardIdParam
        }),
        staleTime: 1000 * 60 * 5, // 5 minutos
        placeholderData: (previousData) => previousData,
        retry: 1, // No reintentar automáticamente
        refetchOnWindowFocus: false, // No refrescar al volver a enfocar la ventana
        refetchOnMount: false, // No refrescar al montar el componente si ya falló
        refetchOnReconnect: false, // No refrescar al recuperar la conexión
    });
};

const createTaskMutation = async (taskText: string, boardId: string) => {
    const response = await fetch(`${BASE_URL}/addTask?board=${boardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ taskInput: taskText })
      });
      const res = await response.json();
      if (!response.ok){
        throw new Error(res.error || 'Error al añadir tarea');
      }
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Error al añadir tarea');
      }
      return res.data
    }

export const useAddTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { filter } = useCurrentFilter();
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
    const { filter } = useCurrentFilter();
    const [ boardId ]  = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async ({ taskId }: { taskId: Task['id']}) => {
            const response = await fetch(`${BASE_URL}/completeTask?board=${boardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ taskId })
            });
            if (!response.ok) {
                throw new Error('Error al completar tarea');
            }
            const data = await response.json();
            if (!data.success || !data.data) {
                throw new Error(data.error || 'Error al completar tarea');
            }
            return data.data;
        },
        onSuccess: (data, { taskId }: { taskId: Task['id'] }) => {
            // Obtener las tareas actuales antes de la actualización
            const currentTasks = queryClient.getQueryData(['tasks', filter]) as Task[] || [];
            const oldTask = currentTasks.find(task => task.id === taskId);
            
            // Invalidar todas las queries de tasks para refrescar todas las vistas
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            
            // Actualización optimista para la vista actual
            queryClient.setQueryData(['tasks', filter], (old: Task[] = []) => {
                // Invertir el estado de completado de la tarea
                const newCompleted = oldTask ? !oldTask.completed : true;
                
                const updatedTasks = old.map((task) =>
                    task.id === taskId ? { ...task, ...data, completed: newCompleted } : task
                );
                
                // Filtrar según la vista actual después de la actualización
                return updatedTasks.filter(task => {
                    if (filter === 'done') return task.completed;
                    if (filter === 'undone') return !task.completed;
                    return true; // 'all'
                });
            });
            
            // Determinar si la tarea se completó o desmarcó basado en su estado anterior
            const newCompleted = oldTask ? !oldTask.completed : true;
            toast.success(`✅ Tarea ${newCompleted ? 'completada' : 'desmarcada como completada'} correctamente`);
        },
        onError: (error) => {
            toast.error(`❌ Error al cambiar estado de tarea: ${error.message}`);
        }
    });
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { filter } = useCurrentFilter();
    const [ boardId ]  = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async ({ taskId, newText }: { taskId: Task['id']; newText: string }) => {
            const response = await fetch(`${BASE_URL}/updateTask?board=${boardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ taskId, newText })
            });
            if (!response.ok) {
                throw new Error('Error al actualizar estado de tarea');
            }
            const data = await response.json();
            if (!data.success || !data.data) {
                throw new Error(data.error || 'Error al actualizar estado de tarea');
            }
            return data.data;
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
    const { filter } = useCurrentFilter();
    const [ boardId ]  = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async (taskId: Task['id']) => {
            const response = await fetch(`${BASE_URL}/deleteTask?board=${boardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ taskId })
            });
            if (!response.ok) {
                throw new Error('Error al eliminar tarea');
            }
            const data = await response.json();
            if (!data.success || !data.data) {
                throw new Error(data.error || 'Error al eliminar tarea');
            }
            return data.data;
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
            const response = await fetch(`${BASE_URL}/clearCompleted?board=${boardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ value: true })
            });
            if (!response.ok) {
                throw new Error('Error al limpiar tareas completadas');
            }
            const data = await response.json();
            if (!data.success || !data.data) {
                throw new Error(data.error || 'Error al limpiar tareas completadas');
            }
            return data.data;
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

// Para el cambio de filtro, simplifica y no hagas petición al servidor
export const useChangeFilter = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { goToPage } = usePagination();

    return useMutation({
        mutationFn: async (newFilter: Filter) => {
            // Solo cambiar el filtro localmente, no necesitas ir al servidor
            return newFilter;
        },
        onSuccess: (newFilter) => {
            // Guardar el filtro actual
            goToPage(1); // Reiniciar a la primera página al cambiar el filtro
            queryClient.setQueryData(['currentFilter'], newFilter);
            toast.success(`✅ Filtro cambiado a "${FILTER_TRANSLATION[newFilter]}"`);
        },
        onError: (error) => {
            toast.error(`❌ Error al cambiar filtro: ${error.message}`);
        }
    });
}

export const useCurrentFilter = () => {
    const queryClient = useQueryClient();
    return { filter: queryClient.getQueryData(['currentFilter']) as Filter || 'all' };
  };