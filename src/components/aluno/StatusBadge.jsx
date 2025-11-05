import React from "react";
import { CheckCircle, Clock, X, Edit } from "lucide-react";

/**
 * Obter cor de fundo do status
 */
export const getStatusBackground = (status) => {
  const backgrounds = {
    pending: "#E0F2FE",
    approved: "#D1FAE5",
    professor_approved: "#DBEAFE",
    rejected: "#FFE4E1",
    cancelled: "#FFE4E1",
    changed: "#FFB366",
  };
  return backgrounds[status] || "#F3F4F6";
};

/**
 * Obter cor do texto do status
 */
export const getStatusTextColor = (status) => {
  const textColors = {
    pending: "#355EC5",
    approved: "#059669",
    professor_approved: "#1d4ed8",
    rejected: "#D03E3E",
    cancelled: "#D03E3E",
    changed: "#FF8C00",
  };
  return textColors[status] || "#6B7280";
};

/**
 * Obter texto do status
 */
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

/**
 * Obter ícone do status
 */
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

/**
 * Componente de badge de status
 */
const StatusBadge = ({ status }) => {
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

