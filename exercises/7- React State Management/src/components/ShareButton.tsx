//use this constant array for the role select dropdown in the ShareButton component
import { ROLES } from '../constants/constants';
import { ROLE_TRANSLATION } from '../constants/constants';

import React, { useState } from 'react'
import type { Role } from '../types';
import { useGetPermissions, useGrantPermission, useRevokePermission } from '../hooks/usePermissions';
import Spinner from './Spinner';
import { useAuth } from '../hooks/useAuth';

function ShareButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const { data: userPermissions, isLoading } = useGetPermissions();
  const { mutate: grantPermission } = useGrantPermission();
  const { mutate: revokePermission } = useRevokePermission();
  const { user } = useAuth();

  const AVAILABLE_ROLES = ROLES.slice(1, 3); // excluir owner

  const onSubmit = () => {
    grantPermission({ email, role });
  };

  const handlePermissionRemoval = (userId: string, role: Role) => {
    revokePermission({ userId, role });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    setIsModalOpen(false);
    setEmail('');
    setRole(AVAILABLE_ROLES[0]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail('');
    setRole(AVAILABLE_ROLES[0]);
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-12 h-12 bg-[#e8994a] border-none rounded cursor-pointer flex items-center justify-center hover:bg-[#d68843] transition-colors"
        title="Compartir tablero"
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="10" r="4" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M16 18c-5 0-9 3-9 7v3h18v-3c0-4-4-7-9-7z" stroke="white" strokeWidth="2" fill="none"/>
          <line x1="26" y1="8" x2="26" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="22" y1="12" x2="30" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] relative text-left shadow-lg">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">Compartir tablero</h2>
            
            {isLoading ? (
              <Spinner></Spinner>
            ) : (
              <section>
              {userPermissions && userPermissions.length > 0 ? (
                <ul className="mb-4">
                  {userPermissions.map((permission) => {
                    const disabledForRevoke = permission.role === 'owner' || permission.id === user?.id;
                    return(
                    <li key={permission.id} className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">{permission.email || 'No email provided'}</span>
                      <span className="text-sm text-gray-500">{ROLE_TRANSLATION[permission.role]}</span>
                      <button
                        onClick={() => handlePermissionRemoval(permission.id, permission.role)}
                        className={`text-red-500 hover:text-red-700 ml-2 ${disabledForRevoke ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Revocar permiso"
                        disabled={disabledForRevoke}
                      >
                        ×
                      </button>
                    </li>
                    )}
                  )}
                </ul>
                ) : (
                  <p className="text-gray-600">No hay usuarios con permisos para este tablero.</p>
                )}
              </section>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8994a] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Otorgar permisos de:
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8994a] focus:border-transparent"
                >
                  {AVAILABLE_ROLES.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {ROLE_TRANSLATION[roleOption]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e8994a] text-white rounded hover:bg-[#d68843] transition-colors"
                >
                  Compartir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ShareButton