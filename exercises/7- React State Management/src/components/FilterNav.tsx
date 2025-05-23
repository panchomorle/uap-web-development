import React from 'react';
import type { Filter } from '../types';


type FilterNavProps = {
    filter: Filter;
    onFilterChange: (filter: Filter) => void;
}

const FilterNav = ({ filter, onFilterChange }: FilterNavProps) => {
  // Función para aplicar clases condicionales a los filtros
  const getFilterClass = (filterName: Filter) => {
    const baseClass = "flex-1 py-[15px] bg-transparent no-underline border-none text-lg text-[#999] cursor-pointer relative text-center hover:text-[#333]";
    return filterName === filter 
      ? `${baseClass} after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-[90%] after:h-[2px] after:bg-[#e8994a]` 
      : baseClass;
  };
  
  const handleFilterClick = (e: React.MouseEvent<HTMLAnchorElement>, filterName: Filter) => {
    e.preventDefault();
    onFilterChange(filterName);
  };
  
  return (
    <nav aria-label="Filtros de tareas" className="flex relative h-[50px]">
      <a 
        href="/?filter=done" 
        className={getFilterClass('done')} 
        data-filter="done"
        onClick={(e) => handleFilterClick(e, 'done')}
      >
        Completadas
      </a>
      <a 
        href="/?filter=undone" 
        className={getFilterClass('undone')} 
        data-filter="undone"
        onClick={(e) => handleFilterClick(e, 'undone')}
      >
        Pendientes
      </a>
      <a 
        href="/?filter=all" 
        className={getFilterClass('all')} 
        data-filter="all"
        onClick={(e) => handleFilterClick(e, 'all')}
      >
        Todas
      </a>
      <button 
        className="w-[50px] h-full bg-[#a87979] text-white border-none text-2xl cursor-pointer flex items-center justify-center" 
        aria-label="Agregar tarea"
        onClick={() => document.getElementById('todo-input')?.focus()}
      >
        +
      </button>
    </nav>
  );
};

export default FilterNav;