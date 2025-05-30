import { useAtom } from 'jotai';
import { getModalStateAtom, confirmModalAtom, closeModalAtom } from '../stores/modalStore';

interface Props {
    modalId: string;
    title: string;
    color: 'success' | 'primary' | 'danger';
}

const Modal = ({ modalId, title, color }: Props) => {
  const [getModalState ] = useAtom(getModalStateAtom);
  const [, confirmModal] = useAtom(confirmModalAtom);
  const [, closeModal] = useAtom(closeModalAtom);
const modalState = getModalState(modalId);
  // Only render if the modal is open
  if (!modalState || !modalState.isOpen) return null;

  const colorStyles = {
    success: 'bg-green-500 hover:bg-green-600',
    primary: 'bg-blue-500 hover:bg-blue-600',
    danger: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{modalState.text}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => confirmModal(modalId)}
            className={`p-2 text-white rounded ${colorStyles[color] || colorStyles.primary}`}
          >
            Aceptar
          </button>
          <button
            onClick={() => closeModal(modalId)}
            className="p-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;