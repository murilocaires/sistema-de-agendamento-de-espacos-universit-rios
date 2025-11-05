import React from "react";
import {
  Clock,
  CheckCircle,
  X,
  Edit,
} from "lucide-react";

// Obter cor do status (agora para o texto principal do badge)
export const getStatusColor = (status) => {
  const colors = {
    pending: "text-blue-600",
    approved: "text-green-600",
    professor_approved: "text-blue-700",
    rejected: "text-red-600",
    changed: "text-orange-600",
  };
  return colors[status] || "text-gray-600";
};

// Obter cor de fundo do status (20% da cor do texto)
export const getStatusBackground = (status) => {
  const backgrounds = {
    pending: "#E0F2FE", // Azul mais claro para melhor contraste
    approved: "#D1FAE5", // 20% de #059669
    professor_approved: "#DBEAFE", // Azul claro para professor_approved
    rejected: "#FFE4E1", // 20% de #D03E3E (mesma cor do botão cancelar)
    cancelled: "#FFE4E1", // 20% de #D03E3E (mesma cor do rejeitado)
    changed: "#FFB366", // 20% de laranja
  };
  return backgrounds[status] || "#F3F4F6";
};

// Obter cor do texto do status (cor exata do texto)
export const getStatusTextColor = (status) => {
  const textColors = {
    pending: "#355EC5",
    approved: "#059669",
    professor_approved: "#1d4ed8",
    rejected: "#D03E3E",
    cancelled: "#D03E3E", // mesma cor do rejeitado
    changed: "#FF8C00", // laranja
  };
  return textColors[status] || "#6B7280";
};

// Obter texto do status
export const getStatusText = (status) => {
  const texts = {
    pending: "Pendente",
    approved: "Reservado",
    professor_approved: "Aprovado pelo Professor",
    rejected: "Recusado",
    cancelled: "Cancelada",
    changed: "Alterado",
  };
  return texts[status] || status;
};

// Obter ícone do status
export const getStatusIcon = (status) => {
  switch (status) {
    case "approved":
      return <CheckCircle size={14} style={{ color: "#059669" }} />;
    case "professor_approved":
      return <CheckCircle size={14} style={{ color: "#2563eb" }} />;
    case "pending":
      return <Clock size={14} style={{ color: "#355EC5" }} />;
    case "rejected":
      return <X size={14} style={{ color: "#D03E3E" }} />;
    case "cancelled":
      return <X size={14} style={{ color: "#D03E3E" }} />;
    case "changed":
      return <Edit size={14} style={{ color: "#FF8C00" }} />;
    default:
      return <Clock size={14} style={{ color: "#6B7280" }} />;
  }
};

const StatusBadge = ({ status, mobile = false }) => {
  if (mobile) {
    return (
      <div className="flex items-center">
        <div
          className="inline-flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            backgroundColor: getStatusBackground(status),
          }}
        >
          {getStatusIcon(status)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center px-3"
      style={{
        height: "28px",
        borderRadius: "999px",
        backgroundColor: getStatusBackground(status),
      }}
    >
      {getStatusIcon(status)}
      <span
        className="ml-2 text-xs font-semibold"
        style={{
          color: getStatusTextColor(status),
        }}
      >
        {getStatusText(status)}
      </span>
    </div>
  );
};

export default StatusBadge;

