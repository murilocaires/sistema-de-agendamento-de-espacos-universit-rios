import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

const DeleteConfirmModal = ({ show, onConfirm, onCancel }) => {
  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    if (!show) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onCancel]);

  if (!show) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden relative"
        style={{ 
          backgroundColor: "#ffffff",
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center mb-4">
            <Trash2 size={48} style={{ color: "#D03E3E" }} />
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center break-words">
            Deletar Reserva
          </h2>
          <p className="text-gray-700 mb-6 text-center break-words">
            Tem certeza que deseja deletar esta reserva permanentemente? Esta ação não pode
            ser desfeita.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Não, manter
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors"
            >
              Sim, deletar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar diretamente no body usando Portal
  return createPortal(modalContent, document.body);
};

export default DeleteConfirmModal;
