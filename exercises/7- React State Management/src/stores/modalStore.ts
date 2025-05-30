// atoms/modalAtom.js
import { atom } from 'jotai';

interface ModalState {
  [key: string]: { isOpen: boolean; text: string; onConfirm?: () => void};
}

export const modalAtom = atom<ModalState>({});

export const openModalAtom = atom(null, (get, set, { modalId, text = "", onConfirm }) => {
  set(modalAtom, (prev) => ({
    ...prev,
    [modalId]: { isOpen: true, text, onConfirm: onConfirm || (() => {}) },
  }));
});

export const closeModalAtom = atom(null, (get, set, modalId: string) => {
  set(modalAtom, (prev) => ({
    ...prev,
    [modalId]: { ...prev[modalId], isOpen: false },
  }));
});

export const confirmModalAtom = atom(null, (get, set, modalId: string) => {
  const modal = get(modalAtom)[modalId];
    if (modal && modal.onConfirm) {
        modal.onConfirm();
    }
    set(modalAtom, (prev) => ({
        ...prev,
        [modalId]: { ...modal, isOpen: false },
    }));
}
);

export const getModalStateAtom = atom(
  (get) => (modalId: string) => get(modalAtom)[modalId] || { isOpen: false, text: "ejemplo", onConfirm: undefined }
);