import React from "react";
import { Eye, Edit, Ban } from "lucide-react";
import MinhasReservas from "../../components/MinhasReservas";
import AdminLayout from "../../layouts/AdminLayout";

const MinhasReservasAdmin = () => {
  // Ações customizadas para admin
  const customActions = (reservation) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => {
            /* Lógica para visualizar */
          }}
          className="flex items-center justify-center focus:outline-none"
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: "#E3E5E8",
            borderRadius: "5px",
            padding: "7px",
          }}
          title="Ver detalhes"
        >
          <Eye size={14} style={{ color: "#1E2024" }} />
        </button>

        <button
          onClick={() => {
            /* Lógica para editar */
          }}
          className="flex items-center justify-center focus:outline-none"
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: "#E0F2FE",
            borderRadius: "5px",
            padding: "7px",
          }}
          title="Editar reserva"
        >
          <Edit size={14} style={{ color: "#0284C7" }} />
        </button>

        <button
          onClick={() => {
            /* Lógica para cancelar */
          }}
          className="flex items-center justify-center focus:outline-none"
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: "#FFE4E1",
            borderRadius: "5px",
            padding: "7px",
          }}
          title="Cancelar reserva"
        >
          <Ban size={14} style={{ color: "#D03E3E" }} />
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <MinhasReservas
        title="Todas as Reservas"
        userType="admin"
        showCancelButton={false}
        showDeleteButton={false}
        customActions={customActions}
      />
    </AdminLayout>
  );
};

export default MinhasReservasAdmin;
