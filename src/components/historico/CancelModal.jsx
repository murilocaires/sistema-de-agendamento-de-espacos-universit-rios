import React from "react";
import { Trash2 } from "lucide-react";

const CancelModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center md:items-start md:pt-32">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        <div className="flex items-center justify-center mb-4">
          <Trash2 size={48} style={{ color: "#D03E3E" }} />
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
          Deletar Reserva
        </h2>
        <p className="text-gray-700 mb-6 text-center">
          Tem certeza que deseja deletar esta reserva permanentemente? Esta ação não pode
          ser desfeita.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            Não, manter
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            Sim, deletar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;

