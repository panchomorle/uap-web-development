import React from 'react';
import { usePagination } from '../hooks/usePagination';
import { useTasks } from '../hooks/useTasks';

// Subcomponente para botones de navegación
const PageButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled = false, children }) => (
  <button
    className={`px-3 py-1 mx-1 rounded ${
      disabled 
        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-500 text-white hover:bg-blue-600'
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Subcomponente para números de página
const PageNumber: React.FC<{
  page: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ page, isActive, onClick }) => (
  <button
    className={`w-8 h-8 mx-1 rounded-full ${
      isActive 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-200 hover:bg-gray-300'
    }`}
    onClick={onClick}
  >
    {page}
  </button>
);

// Subcomponente para selector de límite de página
const PageLimitSelector: React.FC<{
  currentLimit: number;
  onLimitChange: (limit: number) => void;
}> = ({ currentLimit, onLimitChange }) => (
  <div className="flex items-center ml-4">
    <span className="mr-2 text-sm">Mostrar:</span>
    <select
      className="px-2 py-1 border rounded"
      value={currentLimit}
      onChange={(e) => onLimitChange(Number(e.target.value))}
    >
      {[5, 10, 20, 50, 100].map((limit) => (
        <option key={limit} value={limit}>
          {limit}
        </option>
      ))}
    </select>
  </div>
);

// Componente principal de navegación de páginas
interface PageNavProps {
  totalPages?: number;
  className?: string;
}

const PageNav: React.FC<PageNavProps> = ({ className = '' }) => {
  const {
    currentPage,
    pageLimit,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    changePageLimit
  } = usePagination();
  const { data: state } = useTasks(currentPage);
  const totalTasks = state?.total || 1; // Asegurarse de que totalPages tenga un valor válido
  const totalPages = Math.ceil(totalTasks / pageLimit); 

  // Función para generar números de página con elipsis para muchas páginas
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if ( totalPages <= maxVisiblePages) {
      // Mostrar todos los números si hay pocas páginas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PageNumber
            key={i}
            page={i}
            isActive={currentPage === i}
            onClick={() => goToPage(i)}
          />
        );
      }
    } else {
      // Lógica para páginas con elipsis
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Primera página
      if (startPage > 1) {
        pageNumbers.push(
          <PageNumber key={1} page={1} isActive={currentPage === 1} onClick={() => goToPage(1)} />
        );
        if (startPage > 2) {
          pageNumbers.push(<span key="start-ellipsis" className="mx-1">...</span>);
        }
      }

      // Páginas intermedias
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <PageNumber
            key={i}
            page={i}
            isActive={currentPage === i}
            onClick={() => goToPage(i)}
          />
        );
      }

      // Última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(<span key="end-ellipsis" className="mx-1">...</span>);
        }
        pageNumbers.push(
          <PageNumber
            key={totalPages}
            page={totalPages}
            isActive={currentPage === totalPages}
            onClick={() => goToPage(totalPages)}
          />
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className={`flex flex-wrap items-center justify-center p-4 ${className}`}>
      <div className="flex items-center">
        <PageButton 
          onClick={goToPreviousPage} 
          disabled={currentPage <= 1}
        >
          Anterior
        </PageButton>
        
        <div className="flex items-center mx-2">
          {renderPageNumbers()}
        </div>
        
        <PageButton 
          onClick={() => goToNextPage(totalPages)} 
          disabled={currentPage >= totalPages}
        >
          Siguiente
        </PageButton>
      </div>
      
      <PageLimitSelector 
        currentLimit={pageLimit} 
        onLimitChange={changePageLimit} 
      />
    </div>
  );
};

export default PageNav;
