import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteReservation } from "../../services/authService";
import DeleteConfirmModal from "./DeleteConfirmModal";

const DeleteReservationButton = ({ 
  reservation, 
  canDelete, 
  onDeleteSuccess 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Abrir modal de confirmação de delete
  const handleDeleteReservation = () => {
    setShowDeleteConfirm(true);
  };

  // Confirmar delete
  const confirmDeleteReservation = async () => {
    try {
      if (!reservation?.id) {
        setToast({
          show: true,
          message: "ID da reserva não encontrado.",
          type: "error",
        });
        return;
      }

      await deleteReservation(reservation.id);

      setToast({
        show: true,
        message: "Reserva deletada com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);

      // Chamar callback de sucesso
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Erro ao deletar reserva:", error);
      setToast({
        show: true,
        message: error.message || "Erro ao deletar reserva. Tente novamente.",
        type: "error",
      });
    }
  };

  // Cancelar ação de delete
  const cancelDeleteReservation = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteReservation}
        disabled={!canDelete}
        className="flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          width: "28px",
          height: "28px",
          backgroundColor: canDelete ? "#FFE4E1" : "#F3F4F6",
          borderRadius: "5px",
          padding: "7px",
        }}
        title={
          canDelete
            ? "Deletar reserva"
            : "Não é possível deletar reservas aprovadas/rejeitadas ou com datas já passadas"
        }
      >
        <Trash2 size={14} style={{ color: canDelete ? "#D03E3E" : "#9CA3AF" }} />
      </button>

      {/* Modal de Confirmação de Delete */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        onConfirm={confirmDeleteReservation}
        onCancel={cancelDeleteReservation}
      />

      {/* Toast de notificação */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <span className="mr-2">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}
            </span>
            {toast.message}
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Função utilitária para verificar se pode deletar a reserva
export const canDeleteReservation = (reservation) => {
  // Não pode deletar se foi aprovada ou rejeitada pelo admin ou professor
  if (reservation.status === 'approved' || reservation.status === 'rejected' || reservation.status === 'professor_approved') {
    return false;
  }

  // Se está pendente, pode deletar independente das datas (ainda não foi aprovada)
  if (reservation.status === 'pending') {
    return true;
  }

  // Para outros status (cancelled, changed), verificar datas
  // Verificar se é reserva recorrente
  if (reservation.is_recurring || reservation.recurrence_type) {
    // Para reservas recorrentes, verificar se ainda tem datas futuras
    if (reservation.recurrence_end_date) {
      const recurrenceEndDate = new Date(reservation.recurrence_end_date);
      const now = new Date();
      // Se a data final de recorrência ainda não passou, não pode deletar
      if (recurrenceEndDate >= now) {
        return false;
      }
    }
  } else {
    // Para reservas únicas, verificar se a reserva já começou
    if (reservation.start_time) {
      const startTime = new Date(reservation.start_time);
      const now = new Date();
      if (startTime <= now) {
        return false;
      }
    }
  }

  return true;
};

export default DeleteReservationButton;

