import React from "react";
import { X } from "lucide-react";

const RejectReservationModal = ({
  open,
  reservation,
  rejectionReason,
  setRejectionReason,
  onClose,
  onConfirm,
  formatDateTime,
  processing,
}) => {
  if (!open || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {reservation?.status === 'approved' ? 'Revogar Aprovação' : 'Rejeitar Reserva'}
          </h3>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            {reservation?.status === 'approved' ? 'Você está revogando a aprovação da reserva:' : 'Você está rejeitando a reserva:'}
          </p>
          <p className="font-medium">{reservation.title}</p>
          <p className="text-sm text-gray-700">
            {reservation.room_name} - {formatDateTime(reservation.start_time)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {reservation?.status === 'approved' ? 'Motivo da Revogação *' : 'Motivo da Rejeição *'}
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder={reservation?.status === 'approved' ? 'Explique o motivo da revogação...' : 'Explique o motivo da rejeição...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!rejectionReason.trim() || processing}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {reservation?.status === 'approved' ? 'Revogar' : 'Rejeitar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReservationModal;


