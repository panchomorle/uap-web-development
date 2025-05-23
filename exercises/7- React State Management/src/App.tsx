import { useEffect, useState } from 'react'
import './App.css'

import { TaskList } from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterNav from './components/FilterNav';
import Notification from './components/Notification';
import type { Filter, Task, NotificationStatus } from './types';

const BASE_URL = "http://localhost:4321/api";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  
  // Obtener el filtro de la URL al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get('filter');
    
    if (urlFilter && ['all', 'done', 'undone'].includes(urlFilter)) {
      setFilter(urlFilter as Filter);
    }
    
    // Verificar mensajes de error o éxito en la URL
    const errorMsg = urlParams.get('error');
    const successMsg = urlParams.get('success');
    
    if (errorMsg) {
      showNotification(errorMsg, 'error');
    } else if (successMsg) {
      showNotification(successMsg, 'success');
    }
    
    // Cargar tareas iniciales
    fetchTasks();
  }, []);
  
  // Función para mostrar notificaciones
  const showNotification = (message: string, type = 'info') => {
    setNotification({ message, type, show: true });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Función para obtener tareas filtradas
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/filter?filter=${filter}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTasks(data.data.state.tasks);
        } else {
          showNotification(data.error || 'Error al cargar tareas', 'error');
        }
      } else {
        showNotification('Error al cargar tareas', 'error');
      }
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      showNotification('Error al cargar tareas', 'error');
    }
  };
  
  // Función para añadir una nueva tarea
  const addTask = async (taskText: string) => {
    if (!taskText.trim()) {
      showNotification('Por favor, introduce una tarea válida', 'error');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/addTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ taskInput: taskText })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification(data.message || 'Tarea añadida con éxito', 'success');
          if (data.data?.state) {
            setTasks(data.data.state.tasks);
          }
        } else {
          showNotification(data.error || 'Error al añadir tarea', 'error');
        }
      } else {
        showNotification('Error al añadir tarea', 'error');
      }
    } catch (error) {
      console.error('Error al añadir tarea:', error);
      showNotification('Error al añadir tarea', 'error');
    }
  };
  
  // Función para cambiar el estado de una tarea
  const toggleTaskStatus = async (taskId: Task['id']) => {
    try {
      const response = await fetch(`${BASE_URL}/completeTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ taskId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification(data.message || 'Estado de tarea actualizado', 'success');
          if (data.data?.state) {
            setTasks(data.data.state.tasks);
          }
        } else {
          showNotification(data.error || 'Error al actualizar estado', 'error');
        }
      } else {
        showNotification('Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showNotification('Error al actualizar estado', 'error');
    }
  };
  
  // Función para eliminar una tarea
  const deleteTask = async (taskId: Task['id']) => {
    try {
      const response = await fetch(`${BASE_URL}/deleteTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ taskId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification(data.message || 'Tarea eliminada con éxito', 'success');
          setTasks(prev => prev.filter(task => task.id !== taskId));
        } else {
          showNotification(data.error || 'Error al eliminar tarea', 'error');
        }
      } else {
        showNotification('Error al eliminar tarea', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      showNotification('Error al eliminar tarea', 'error');
    }
  };
  
  // Función para limpiar tareas completadas
  const clearCompleted = async () => {
    try {
      const response = await fetch(`${BASE_URL}/clearCompleted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ value: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification(data.message || 'Tareas completadas eliminadas', 'success');
          setTasks(prev => prev.filter(task => !task.completed));
        } else {
          showNotification(data.error || 'Error al limpiar tareas', 'error');
        }
      } else {
        showNotification('Error al limpiar tareas', 'error');
      }
    } catch (error) {
      console.error('Error al limpiar tareas:', error);
      showNotification('Error al limpiar tareas', 'error');
    }
  };
  
  // Función para cambiar el filtro
  const changeFilter = async (newFilter: Filter) => {
    try {
      const response = await fetch(`${BASE_URL}/filter?filter=${newFilter}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFilter(newFilter);
          setTasks(data.data.state.tasks);
          
          // Actualizar URL sin recargar página
          const url = new URL(window.location.toString());
          url.searchParams.set('filter', newFilter);
          window.history.pushState({}, '', url);
          
          const filterMessages = {
            done: 'Mostrando tareas completadas',
            undone: 'Mostrando tareas pendientes',
            all: 'Mostrando todas las tareas'
          };
          
          showNotification(filterMessages[newFilter], 'info');
        } else {
          showNotification(data.error || 'Error al filtrar tareas', 'error');
        }
      } else {
        showNotification('Error al filtrar tareas', 'error');
      }
    } catch (error) {
      console.error('Error al filtrar tareas:', error);
      showNotification('Error al filtrar tareas', 'error');
    }
  };
  
  // Filtrar tareas según el filtro activo
  const filteredTasks = tasks.filter(task => {
    if (filter === "done") return task.completed;
    if (filter === "undone") return !task.completed;
    return true; // "all"
  });
  
  return (
    <div className="w-full flex flex-col gap-[15px] max-w-[600px] mx-auto font-sans">
      <Notification 
        message={notification.message}
        type={notification.type as NotificationStatus}
        show={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      
      <header className="text-center bg-[#f2efe8]">
        <h1 className="text-[42px] font-bold py-[15px]">
          <span className="text-[#6b6b6b]">ToDo</span>
          <span className="text-[#e8994a]">List</span>
        </h1>
        
        <FilterNav filter={filter} onFilterChange={changeFilter} />
      </header>
      
      <TaskForm onAddTask={addTask} />
      
      <TaskList 
        tasks={filteredTasks} 
        filter={filter}
        onToggleComplete={toggleTaskStatus} 
        onDeleteTask={deleteTask} 
      />
      
      <div className="flex justify-end py-[10px]">
        <button 
          className="bg-transparent mx-5 my-5 border-none text-[#e8994a] cursor-pointer text-base" 
          onClick={clearCompleted}
          aria-label="Limpiar tareas completadas"
        >
          Limpiar completadas
        </button>
      </div>
    </div>
  );
}

export default App;
