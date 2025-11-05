import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { formatBrazilDateTime } from "../../utils/dateUtils";
import StatusBadge from "./StatusBadge";

const ReservationTable = ({
  reservations,
  onReservationClick,
  onCancelReservation,
  showCancelButton = true,
}) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Atualizado em
              </th>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Título
              </th>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Sala
              </th>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Responsável
              </th>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left tracking-wider"
                style={{
                  color: "#858B99",
                  fontSize: "14px",
                  lineHeight: "140%",
                  fontWeight: "normal",
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#FFFFFF" }}>
            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  height: "64px",
                  borderBottom: "1px solid #E3E5E8",
                }}
                className="hover:opacity-80"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatBrazilDateTime(reservation.updated_at || reservation.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className="text-sm font-bold text-gray-900"
                    style={{
                      width: "200px",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {reservation.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {reservation.room_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reservation.room_location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {reservation.professor_name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.professor_name || "Professor"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  <div className="flex items-center justify-start gap-4">
                    <button
                      onClick={() => onReservationClick(reservation)}
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

                    {showCancelButton && (
                      <button
                        onClick={() => onCancelReservation(reservation.id)}
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
                        <Trash2 size={14} style={{ color: "#D03E3E" }} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
            onClick={() => onReservationClick(reservation)}
          >
            {/* Header: Título e Status */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex-1 pr-2">
                {reservation.title}
              </h3>
              <StatusBadge status={reservation.status} />
            </div>

            {/* Informações principais */}
            <div className="space-y-1.5 mb-2">
              {/* Responsável */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 min-w-[50px]">Responsável:</span>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-white">
                      {reservation.professor_name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {reservation.professor_name || "Professor"}
                  </span>
                </div>
              </div>

              {/* Data */}
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 min-w-[50px]">Atualizado:</span>
                <span className="text-xs text-gray-900">
                  {formatBrazilDateTime(reservation.updated_at || reservation.created_at)}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReservationClick(reservation);
                }}
                className="flex items-center justify-center focus:outline-none"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#E3E5E8",
                  borderRadius: "5px",
                  padding: "6px",
                }}
                title="Ver detalhes"
              >
                <Eye size={14} style={{ color: "#1E2024" }} />
              </button>

              {showCancelButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelReservation(reservation.id);
                  }}
                  className="flex items-center justify-center focus:outline-none"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: "#FFE4E1",
                    borderRadius: "5px",
                    padding: "6px",
                  }}
                  title="Cancelar reserva"
                >
                  <Trash2 size={14} style={{ color: "#D03E3E" }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReservationTable;

