import { createFileRoute } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { taskRefetchIntervalAtom, taskDescriptionUppercaseAtom } from '../stores/settingsStore'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  const [refetchInterval, setRefetchInterval] = useAtom(taskRefetchIntervalAtom);
  const [descriptionUppercase, setDescriptionUppercase] = useAtom(taskDescriptionUppercaseAtom);
  
  // Estados locales para manejar los valores de los campos antes de guardarlos
  const [localRefetchInterval, setLocalRefetchInterval] = useState(refetchInterval);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Efecto para mostrar el mensaje de éxito por 3 segundos
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);
  
  const handleSaveSettings = () => {
    // Validar que el intervalo sea un número positivo
    const parsedInterval = Number(localRefetchInterval);
    if (isNaN(parsedInterval) || parsedInterval <= 0) {
      alert("El intervalo debe ser un número positivo");
      return;
    }
    
    // Guardar configuraciones
    setRefetchInterval(parsedInterval);
    setShowSuccessMessage(true);
  };
  
  return (
    <div className="w-full max-w-[600px] mx-auto p-6">
      <header className="text-center mb-8 bg-[#f2efe8] py-6 rounded-lg">
        <h1 className="text-3xl font-bold text-[#333]">Configuraciones</h1>
        <p className="text-gray-600 mt-2">Personaliza tu experiencia en la aplicación</p>
      </header>
      
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          ¡Configuraciones guardadas correctamente!
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#333] mb-4 border-b pb-2">Ajustes generales</h2>
        
        {/* Intervalo de Refetch */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="refetchInterval">
            Intervalo de actualización de tareas
          </label>
          <div className="flex items-center">
            <input
              id="refetchInterval"
              type="number"
              min="1"
              value={localRefetchInterval}
              onChange={(e) => setLocalRefetchInterval(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8994a]"
            />
            <span className="ml-3 text-gray-600">segundos</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tiempo entre actualizaciones automáticas de las tareas (por defecto: 10 segundos)
          </p>
        </div>
        
        {/* Descripción en mayúsculas */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={descriptionUppercase}
                onChange={(e) => setDescriptionUppercase(e.target.checked)}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${descriptionUppercase ? 'bg-[#e8994a]' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${descriptionUppercase ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">Descripción en mayúsculas</div>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-16">
            Mostrar todas las descripciones de tareas en mayúsculas
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-[#e8994a] text-white rounded-md hover:bg-[#d78a45] transition duration-300"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
