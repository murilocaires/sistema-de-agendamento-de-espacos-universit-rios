import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getReservations,
  getRooms,
  deleteReservation,
} from "../services/authService";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  DoorClosed,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  ChevronDown,
  Ban,
} from "lucide-react";

const MinhasReservas = ({
  title = "Minhas Reservas",
  userType = "student",
  showCancelButton = true,
  showDeleteButton = false,
  customActions = null,
  onReservationClick = null,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar dados iniciais
  useEffect(() => {
    loadReservations();
    loadRooms();
  }, []);

  // Carregar reservas
  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getReservations();
      setReservations(data);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      setError("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  // Carregar salas
  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    }
  };

  // Obter cor do status (agora para o texto principal do badge)
  const getStatusColor = (status) => {
    const colors = {
      pending: "text-blue-600",
      approved: "text-green-600",
      rejected: "text-red-600",
      changed: "text-orange-600",
    };
    return colors[status] || "text-gray-600";
  };

  // Obter cor de fundo do status (20% da cor do texto)
  const getStatusBackground = (status) => {
    const backgrounds = {
      pending: "#6BB6FF", // 20% de #355EC5
      approved: "#D1FAE5", // 20% de #059669
      rejected: "#FFE4E1", // 20% de #D03E3E (mesma cor do botão cancelar)
      changed: "#FFB366", // 20% de laranja
    };
    return backgrounds[status] || "#F3F4F6";
  };

  // Obter cor do texto do status (cor exata do texto)
  const getStatusTextColor = (status) => {
    const textColors = {
      pending: "#355EC5",
      approved: "#059669",
      rejected: "#D03E3E",
      changed: "#FF8C00", // laranja
    };
    return textColors[status] || "#6B7280";
  };

  // Obter texto do status
  const getStatusText = (status) => {
    const texts = {
      pending: "Pendente",
      approved: "Reservado",
      rejected: "Recusado",
      changed: "Alterado",
    };
    return texts[status] || status;
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={14} style={{ color: "#059669" }} />;
      case "pending":
        return <Clock size={14} style={{ color: "#355EC5" }} />;
      case "rejected":
        return <X size={14} style={{ color: "#D03E3E" }} />;
      case "changed":
        return <Edit size={14} style={{ color: "#FF8C00" }} />;
      default:
        return <Clock size={14} style={{ color: "#6B7280" }} />;
    }
  };

  // Navegar para página de detalhes
  const openModal = (reservation) => {
    if (onReservationClick) {
      onReservationClick(reservation);
    }
    // Redirecionar para página de detalhes baseado no tipo de usuário
    const basePath =
      userType === "student"
        ? "/aluno"
        : userType === "professor"
        ? "/professor"
        : userType === "admin"
        ? "/admin"
        : "/coordenador";
    navigate(`${basePath}/reservas/${reservation.id}`);
  };

  // Abrir modal de confirmação de cancelamento
  const handleCancelReservation = (reservationId) => {
    setReservationToCancel(reservationId);
    setShowCancelModal(true);
  };

  // Confirmar cancelamento
  const confirmCancelReservation = async () => {
    try {
      // Aqui você pode implementar a chamada para a API de cancelamento
      // Por enquanto, vamos apenas mostrar um toast de sucesso
      setToast({
        show: true,
        message: "Reserva cancelada com sucesso!",
        type: "success",
      });

      // Recarregar as reservas
      loadReservations();

      // Fechar modal
      setShowCancelModal(false);
      setReservationToCancel(null);
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      setToast({
        show: true,
        message: "Erro ao cancelar reserva. Tente novamente.",
        type: "error",
      });
    }
  };

  // Cancelar ação de cancelamento
  const cancelCancelReservation = () => {
    setShowCancelModal(false);
    setReservationToCancel(null);
  };

  // Filtrar reservas ativas (aprovadas e não expiradas)
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = reservation.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    // Verificar se é uma reserva ativa (aprovada e não expirada)
    const isActive = reservation.status === "approved";
    const isNotExpired =
      new Date(reservation.date + " " + reservation.end_time) > new Date();

    // Filtrar apenas reservas do usuário logado
    const matchesUser = user && reservation.user_email === user.email;

    return (
      matchesSearch && matchesStatus && isActive && isNotExpired && matchesUser
    );
  });

  // Paginação
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Renderizar ações customizadas ou padrão
  const renderActions = (reservation) => {
    if (customActions) {
      return customActions(reservation);
    }

    return (
      <div className="flex items-center justify-start gap-4">
        <button
          onClick={() => openModal(reservation)}
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
            onClick={() => handleCancelReservation(reservation.id)}
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
        )}
      </div>
    );
  };

  return (
    <div className="px-12 mt-12 pb-6" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold"
          style={{
            fontFamily: "Lato, sans-serif",
            fontSize: "24px",
            lineHeight: "140%",
            letterSpacing: "0%",
            color: "#2E3DA3",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Tabela */}
      <div
        className="shadow overflow-hidden w-full"
        style={{
          borderRadius: "10px",
          border: "1px solid #E3E5E8",
          backgroundColor: "#FFFFFF",
        }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma reserva encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca."
                : "Você não possui reservas ativas no momento."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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
                  {paginatedReservations.map((reservation, index) => (
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
                          {new Date(
                            reservation.updated_at || reservation.created_at
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                        <div
                          className="inline-flex items-center px-3"
                          style={{
                            height: "28px",
                            borderRadius: "999px",
                            backgroundColor: getStatusBackground(
                              reservation.status
                            ),
                          }}
                        >
                          {getStatusIcon(reservation.status)}
                          <span
                            className="ml-2 text-xs font-semibold"
                            style={{
                              color: getStatusTextColor(reservation.status),
                            }}
                          >
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {renderActions(reservation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div
                className="bg-white px-4 py-3 flex items-center justify-between sm:px-6"
                style={{ borderTop: "1px solid #E3E5E8" }}
              >
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{" "}
                      <span className="font-medium">{startIndex + 1}</span> até{" "}
                      <span className="font-medium">
                        {Math.min(
                          startIndex + itemsPerPage,
                          filteredReservations.length
                        )}
                      </span>{" "}
                      de{" "}
                      <span className="font-medium">
                        {filteredReservations.length}
                      </span>{" "}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-32">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative">
            <div className="flex items-center justify-center mb-4">
              <Ban size={48} style={{ color: "#D03E3E" }} />
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              Cancelar Reserva
            </h2>
            <p className="text-gray-700 mb-6 text-center">
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelCancelReservation}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                Não, manter
              </button>
              <button
                onClick={confirmCancelReservation}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinhasReservas;
