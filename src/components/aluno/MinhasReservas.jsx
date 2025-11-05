import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getReservations, getRooms, updateReservation } from "../../services/authService";
import { Calendar } from "lucide-react";
import { hasFutureOccurrences } from "./reservationUtils";
import ReservationTable from "./ReservationTable";
import Pagination from "./Pagination";
import CancelModal from "./CancelModal";
import ToastNotification from "./ToastNotification";

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const hasLoadedRef = useRef(null); // Armazenar userId ao invés de boolean
  const isLoadingRef = useRef(false);

  // Carregar reservas (função auxiliar para uso em outros lugares)
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      const filters = user?.id ? { user_id: user.id } : {};
      const data = await getReservations(filters);
      console.log('🔍 [MinhasReservas] Total de reservas recebidas:', data?.length);
      console.log('🔍 [MinhasReservas] Reservas pendentes:', data?.filter(r => r.status === 'pending').length);
      console.log('🔍 [MinhasReservas] Reservas aprovadas:', data?.filter(r => r.status === 'approved').length);
      console.log('🔍 [MinhasReservas] Reservas rejeitadas:', data?.filter(r => r.status === 'rejected').length);
      console.log('🔍 [MinhasReservas] Dados completos:', data);
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
  }, [user?.id]);

  // Carregar salas (função auxiliar para uso em outros lugares)
  const loadRooms = useCallback(async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    }
  }, []);

  // Carregar dados iniciais - com proteção robusta contra React.StrictMode
  useEffect(() => {
    // Aguardar user estar disponível
    if (!user?.id) return;
    
    const userId = user.id;
    
    // Verificar se já carregou para este usuário específico
    if (hasLoadedRef.current === userId) {
      console.log('🔍 [MinhasReservas] Já carregado para usuário:', userId);
      return;
    }
    
    // Verificar se já está carregando (proteção contra race conditions)
    if (isLoadingRef.current) {
      console.log('🔍 [MinhasReservas] Já está carregando, aguardando...');
      return;
    }
    
    // Marcar como carregando antes de iniciar
    isLoadingRef.current = true;
    hasLoadedRef.current = userId;
    
    console.log('🔍 [MinhasReservas] Iniciando carregamento para usuário:', userId);

    const loadData = async () => {
      try {
        setLoading(true);
        const filters = { user_id: userId };
        const [reservationsData, roomsData] = await Promise.all([
          getReservations(filters),
          getRooms()
        ]);
        
        setReservations(reservationsData || []);
        setRooms(roomsData || []);
        setError(""); // Limpar erros anteriores
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          setError("Acesso negado. Verifique suas permissões ou faça login novamente.");
        } else {
          setError("Erro ao carregar reservas. Tente novamente.");
        }
        setReservations([]);
        setRooms([]);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadData();
    
    // Cleanup: resetar quando o userId mudar (mas não no unmount)
    return () => {
      // Só resetar se o userId mudou, não no unmount
      if (hasLoadedRef.current !== userId) {
        hasLoadedRef.current = null;
      }
    };
  }, [user?.id]); // Apenas user?.id como dependência

  // Navegar para página de detalhes
  const openModal = (reservation) => {
    if (onReservationClick) {
      onReservationClick(reservation);
    }
    const basePath =
      userType === "student"
        ? "/aluno"
        : userType === "professor" || userType === "servidor"
        ? "/servidor"
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
      if (!reservationToCancel) {
        setToast({
          show: true,
          message: "ID da reserva não encontrado.",
          type: "error",
        });
        return;
      }

      // Desativar a reserva (is_active = false) em vez de mudar status
      await updateReservation(reservationToCancel, {
        is_active: false
      });

      setToast({
        show: true,
        message: "Reserva cancelada com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);

      loadReservations();

      setShowCancelModal(false);
      setReservationToCancel(null);
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      setToast({
        show: true,
        message: error.message || "Erro ao cancelar reserva. Tente novamente.",
        type: "error",
      });
    }
  };

  // Cancelar ação de cancelamento
  const cancelCancelReservation = () => {
    setShowCancelModal(false);
    setReservationToCancel(null);
  };

  // Filtrar reservas futuras (incluindo todas as ocorrências recorrentes)
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = reservation.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    // Incluir todas as reservas futuras, exceto rejeitadas, canceladas e desativadas
    const isValidStatus = 
      reservation.status !== "rejected" && 
      reservation.status !== "cancelled" &&
      reservation.is_active !== false;
    
    // Verificar se a reserva tem ocorrências futuras (incluindo hoje)
    const hasFuture = hasFutureOccurrences(reservation);

    // Filtrar apenas reservas do usuário logado
    const matchesUser = user && reservation.user_email === user.email;

    return (
      matchesSearch && matchesStatus && isValidStatus && hasFuture && matchesUser
    );
  }).sort((a, b) => {
    // Ordenar por data de início (mais próxima primeiro)
    const getStartDate = (reservation) => {
      if (reservation.start_time) {
        return new Date(reservation.start_time);
      }
      if (reservation.date) {
        return new Date(reservation.date);
      }
      return new Date(reservation.created_at);
    };
    
    const dateA = getStartDate(a);
    const dateB = getStartDate(b);
    return dateA - dateB; // Mais próxima primeiro
  });

  // Paginação
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="px-4 md:px-12 mt-4 md:mt-12 pb-6" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1
          className="font-bold text-lg md:text-2xl"
          style={{
            fontFamily: "Lato, sans-serif",
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
            <ReservationTable
              reservations={paginatedReservations}
              onReservationClick={openModal}
              onCancelReservation={handleCancelReservation}
              showCancelButton={showCancelButton}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              itemsPerPage={itemsPerPage}
              totalItems={filteredReservations.length}
            />
          </>
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <CancelModal
        isOpen={showCancelModal}
        onConfirm={confirmCancelReservation}
        onCancel={cancelCancelReservation}
      />

      {/* Toast de notificação */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default MinhasReservas;

