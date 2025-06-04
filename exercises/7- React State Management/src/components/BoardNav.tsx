import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router';
import { useBoards, useAddBoard } from '../hooks/useBoards';
import Spinner from './Spinner';

function BoardNav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const { data: boards, error: fetchError, isLoading } = useBoards();
    const { mutate: addBoard, isPending: isAddingBoard } = useAddBoard();
    
    useEffect(() => {
        if (fetchError) {
            console.error("Error fetching boards:", fetchError);
        }
    }, [fetchError]);

    // Función para cerrar el menú al hacer clic en un enlace
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };
    
    // Controlar el cierre del menú al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('sidebar-menu');
            const menuButton = document.getElementById('menu-button');
            
            if (isMenuOpen && sidebar && menuButton && 
                !sidebar.contains(event.target as Node) && 
                !menuButton.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);
    
    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center h-16">
                <Spinner width={24} height={24} className="fill-blue-500" />
            </div>
        );
    }

    return (
        <header className="bg-gradient-to-r from-amber-300 to-gray-200 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Botón del menú hamburguesa */}
                    <button 
                        id="menu-button"
                        className="p-2 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Menú principal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    {/* Título del sitio */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold">
                            <span className="text-[#6b6b6b]">ToDo</span>
                            <span className="text-[#e8994a]">List</span>
                        </h1>
                    </div>
                    
                    {/* Espacio para posibles botones adicionales a la derecha */}
                    <div className="w-6"></div>
                </div>
            </div>
            
            {/* Menú lateral (Sidebar) */}
            <div 
                id="sidebar-menu"
                className={`fixed inset-y-0 left-0 z-50 w-96 bg-gray-800 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg`}
            >
                <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Tableros</h2>
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-gray-400 hover:text-white"
                            aria-label="Cerrar menú"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {boards && boards?.length > 0 ? (
                            boards.map((board) => (
                                <Link 
                                    key={board.id} 
                                    to="/board/$boardId"
                                    params={{ boardId: board.id }}
                                    className="block py-2 px-4 rounded text-gray-200 hover:bg-blue-700 hover:text-white transition duration-200 [&.active]:bg-blue-600 [&.active]:font-bold"
                                    onClick={handleLinkClick}
                                >
                                    {board.name}
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-400">No hay tableros disponibles</p>
                        )}
                        
                        {/* Formulario para añadir un nuevo tablero */}
                        <div className="mt-6 border-t border-gray-700 pt-4">
                            <h3 className="text-lg font-medium text-white mb-2">Añadir tablero</h3>
                            <div className="flex flex-auto space-x-2">
                                <input
                                    type="text"
                                    value={newBoardName}
                                    onChange={(e) => setNewBoardName(e.target.value)}
                                    placeholder="Nombre del tablero"
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => {
                                        if (newBoardName.trim()) {
                                            addBoard(newBoardName);
                                            setNewBoardName('');
                                        }
                                    }}
                                    disabled={isAddingBoard || !newBoardName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                {isAddingBoard ? (
                                    <span className="flex items-center justify-center">
                                        <Spinner width={16} height={16} className='fill-white'/>
                                    </span>
                                ) : (
                                    <span>Añadir</span>
                                )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Enlace a la página de configuraciones */}
                        <div className="mt-6 border-t border-gray-700 pt-4">
                            <Link 
                                to="/settings"
                                className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md transition duration-200"
                                onClick={handleLinkClick}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configuraciones
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Overlay para oscurecer el fondo cuando el menú está abierto */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </header>
    )
}

export default BoardNav