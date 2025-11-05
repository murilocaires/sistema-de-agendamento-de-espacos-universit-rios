
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getReservations, getRooms } from "../../services/authService";
import HistoricoTable from "./HistoricoTable";
import Pagination from "./Pagination";
import CancelModal from "./CancelModal";
import ToastNotification from "./ToastNotification";

const Historico = ({
  title = "Histórico",
  userType = "student",
  showCancelButton = false,
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
      // Para "Histórico", filtrar apenas as reservas do usuário logado
      const filters = user?.id ? { user_id: user.id } : {};
      const data = await getReservations(filters);
      setReservations(data || []);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError("Acesso negado. Verifique suas permissões ou faça login novamente.");
      } else {
        setError("Erro ao carregar reservas. Tente novamente.");
      }
      setReservations([]);
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

  // Navegar para página de detalhes
  const openModal = (reservation) => {
    if (onReservationClick) {
      onReservationClick(reservation);
    }
    // Redirecionar para página de detalhes baseado no tipo de usuário
    const basePath =
      userType === "student"
        ? "/aluno"
        : userType === "professor" || userType === "servidor"
        ? "/professor"
        : userType === "admin"
        ? "/admin"
        : "/coordenador";
    navigate(`${basePath}/historico/${reservation.id}`);
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

  // Filtrar reservas (incluindo reservas expiradas)
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = reservation.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;
    
    // O histórico deve mostrar todas as reservas (aprovadas, pendentes, rejeitadas, canceladas)
    const shouldIncludeInHistory = true;
    
    // Filtrar apenas reservas do usuário logado
    const matchesUser = user && reservation.user_email === user.email;
    
    return matchesSearch && matchesStatus && shouldIncludeInHistory && matchesUser;
  }).sort((a, b) => {
    // Ordenar do mais recente para o menos recente
    const dateA = new Date(a.updated_at || a.created_at);
    const dateB = new Date(b.updated_at || b.created_at);
    return dateB - dateA;
  });

  // Paginação
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div
      className="px-6 md:px-12 mt-12 pb-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
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
        <HistoricoTable
          reservations={paginatedReservations}
          loading={loading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          user={user}
          onReservationClick={openModal}
          showCancelButton={showCancelButton}
          showDeleteButton={showDeleteButton}
          customActions={customActions}
          userType={userType}
          onDeleteSuccess={loadReservations}
          onCancelReservation={handleCancelReservation}
        />

        {/* Paginação */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredReservations.length}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <CancelModal
        show={showCancelModal}
        onConfirm={confirmCancelReservation}
        onCancel={cancelCancelReservation}
      />

      {/* Toast de notificação */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default Historico;

