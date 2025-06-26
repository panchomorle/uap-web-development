import React from 'react';
import type { Filter } from '../types';
import { useFilter } from '../hooks/useFilter';

const BoardHeader = ({children}: {children?: React.ReactNode}) => {
  const { filter, changeFilter } = useFilter();
  // Función para aplicar clases condicionales a los filtros
  const getFilterClass = (filterName: Filter) => {
    const baseClass = "flex-1 py-[15px] bg-transparent no-underline border-none text-lg text-[#999] cursor-pointer relative text-center hover:text-[#333]";
    return filterName === filter 
      ? `${baseClass} after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-[90%] after:h-[2px] after:bg-[#e8994a]` 
      : baseClass;
  };
  
  const handleFilterClick = (e: React.MouseEvent<HTMLAnchorElement>, filterName: Filter) => {
    e.preventDefault();
    changeFilter(filterName);
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
      { children }
    </nav>
  );
};

export default BoardHeader;