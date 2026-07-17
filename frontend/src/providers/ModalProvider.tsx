import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalConfig {
  id: string;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

interface ModalContextValue {
  openModal: (title: string, content: React.ReactNode) => Promise<void>;
  closeModal: () => void;
  activeModal: ModalConfig | null;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);

  const openModal = useCallback((title: string, content: React.ReactNode): Promise<void> => {
    return new Promise((resolve) => {
      const id = `modal-${Date.now()}`;
      setActiveModal({ id, title, content, onClose: () => { setActiveModal(null); resolve(); } });
    });
  }, []);

  const closeModal = useCallback(() => {
    activeModal?.onClose();
  }, [activeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, activeModal }}>
      {children}
      {activeModal && (
        <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }} role="dialog" aria-modal="true" aria-label={activeModal.title}>
          <div className="dialog">
            <h3 className="dialog-title">{activeModal.title}</h3>
            <div className="dialog-content">{activeModal.content}</div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
