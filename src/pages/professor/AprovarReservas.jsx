import React, { useState, useEffect } from "react";
import ProfessorLayout from "../../layouts/ProfessorLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  getPendingReservations,
  approveReservation,
  getReservations,
  getRooms,
  getProjects
} from "../../services/authService";
import { 
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Users as UsersIcon,
  DoorClosed,
  Calendar,
  User,
  Check,
  X,
  Info,
  RefreshCw,
  AlertTriangle,
  Filter,
  FolderOpen
} from "lucide-react";
import ReservationDetailsModal from "../../components/professor/ReservationDetailsModal";
import RejectReservationModal from "../../components/admin/RejectReservationModal";
import { formatBrazilDateTime } from "../../utils/dateUtils";

const AprovarReservas = () => {
  const { user } = useAuth();

  // Estados
  const [reservations, setReservations] = useState([]);
  const [professorApprovedReservations, setProfessorApprovedReservations] = useState([]);
  const [rejectedReservations, setRejectedReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [viewType, setViewType] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [filterProject, setFilterProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingIds, setProcessingIds] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal de rejeição
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Modal de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsReservation, setDetailsReservation] = useState(null);

  // Carregar todos os dados
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Carregar projetos do professor primeiro
      const projectsData = await getProjects({ professor_id: user?.id });
      setProjects(projectsData || []);
      
      const projectIds = projectsData.map(p => p.id);
      
      // Carregar todas as reservas
      const [allPendingData, allProfessorApprovedData, allRejectedData, roomsData] = await Promise.all([
        getPendingReservations(),
        getReservations({ status: 'professor_approved' }),
        getReservations({ status: 'rejected' }),
        getRooms()
      ]);
      
      // Filtrar apenas reservas dos projetos do professor
      const filterByProjects = (reservationsList) => {
        return reservationsList.filter(r => 
          r.project_id && projectIds.includes(r.project_id)
        );
      };
      
      // Para professor: filtrar apenas as realmente pendentes (não incluir professor_approved)
      const reallyPendingReservations = allPendingData.filter(r => r.status === 'pending');
      
      setReservations(filterByProjects(reallyPendingReservations));
      setProfessorApprovedReservations(filterByProjects(allProfessorApprovedData));
      setRejectedReservations(filterByProjects(allRejectedData));
      setRooms(roomsData.filter(room => room.is_active));
      
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
      setReservations([]);
      setProfessorApprovedReservations([]);
      setRejectedReservations([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar apenas as reservas (mais leve)
  const refreshReservations = async () => {
    try {
      setError("");
      setIsRefreshing(true);
      
      // Obter IDs dos projetos atuais
      const projectIds = projects.map(p => p.id);
      
      if (projectIds.length === 0) {
        setIsRefreshing(false);
        return;
      }
      
      // Carregar apenas as reservas
      const [allPendingData, allProfessorApprovedData, allRejectedData] = await Promise.all([
        getPendingReservations(),
        getReservations({ status: 'professor_approved' }),
        getReservations({ status: 'rejected' })
      ]);
      
      // Filtrar apenas reservas dos projetos do professor
      const filterByProjects = (reservationsList) => {
        return reservationsList.filter(r => 
          r.project_id && projectIds.includes(r.project_id)
        );
      };
      
      // Para professor: filtrar apenas as realmente pendentes (não incluir professor_approved)
      const reallyPendingReservations = allPendingData.filter(r => r.status === 'pending');
      
      setReservations(filterByProjects(reallyPendingReservations));
      setProfessorApprovedReservations(filterByProjects(allProfessorApprovedData));
      setRejectedReservations(filterByProjects(allRejectedData));
      
      // Aguardar um pouco para completar a animação
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
      
    } catch (err) {
      setError("Erro ao atualizar reservas: " + err.message);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Aprovar reserva
  const handleApprove = async (reservationId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(reservationId));
      setError("");
      setSuccessMessage("");

      const result = await approveReservation(reservationId, 'approve');
      
      setSuccessMessage(result.message || "Reserva aprovada! Enviada para aprovação final do admin.");
      await loadAllData(); // Recarregar todos os dados
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError("Erro ao aprovar reserva: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  // Abrir modal de rejeição
  const openRejectModal = (reservation) => {
    setSelectedReservation(reservation);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Rejeitar reserva
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Motivo da rejeição é obrigatório");
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(selectedReservation.id));
      setError("");
      setSuccessMessage("");

      const result = await approveReservation(selectedReservation.id, 'reject', rejectionReason);
      
      setSuccessMessage(result.message || "Reserva rejeitada com sucesso!");
      setShowRejectModal(false);
      setSelectedReservation(null);
      setRejectionReason("");
      
      await refreshReservations(); // Atualizar apenas as reservas
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Erro ao rejeitar reserva: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedReservation.id);
        return newSet;
      });
    }
  };

  // Reprovar reserva (para reservas já aprovadas pelo professor)
  const handleReprove = async (reservationId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(reservationId));
      setError("");
      setSuccessMessage("");

      // Abrir modal de rejeição para esta reserva
      const reservation = professorApprovedReservations.find(r => r.id === reservationId);
      if (reservation) {
        setSelectedReservation(reservation);
        setRejectionReason("");
        setShowRejectModal(true);
      }
    } catch (err) {
      setError("Erro ao reprovar reserva: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  // Abrir modal de detalhes
  const openDetailsModal = (reservation) => {
    setDetailsReservation(reservation);
    setShowDetailsModal(true);
  };

  // Formatar data e hora (para compatibilidade com modais)
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar intervalo de data e hora de forma otimizada
  const formatDateTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Formatar data
    const startDate = start.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const endDate = end.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Formatar hora (sem segundos)
    const startTimeStr = start.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTimeStr = end.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Se for no mesmo dia, mostrar apenas uma vez a data
    if (startDate === endDate) {
      return `${startDate}, ${startTimeStr} - ${endTimeStr}`;
    }
    
    // Se for em dias diferentes, mostrar ambas as datas
    return `${startDate}, ${startTimeStr} - ${endDate}, ${endTimeStr}`;
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // Obter texto da prioridade
  const getPriorityText = (priority) => {
    const texts = {
      1: "Normal",
      2: "Alta",
      3: "Urgente"
    };
    return texts[priority] || "Normal";
  };

  // Filtrar reservas por projeto
  const getFilteredReservations = (reservationList) => {
    if (filterProject === 'all') {
      return reservationList;
    }
    return reservationList.filter(r => r.project_id === parseInt(filterProject));
  };

  // Obter lista de reservas baseado na visualização
  const getCurrentReservations = () => {
    switch (viewType) {
      case 'pending':
        return getFilteredReservations(reservations);
      case 'approved':
        return getFilteredReservations(professorApprovedReservations);
      case 'rejected':
        return getFilteredReservations(rejectedReservations);
      default:
        return [];
    }
  };

  const currentReservations = getCurrentReservations();

  // Renderizar card de reserva
  const renderReservationCard = (reservation) => {
    const isProcessing = processingIds.has(reservation.id);
    const project = projects.find(p => p.id === reservation.project_id);

    return (
      <div
        key={reservation.id}
        className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-1 break-words">
              {reservation.title}
            </h3>
            {project && (
              <div className="flex items-center gap-2 text-xs md:text-sm text-purple-600 mb-2">
                <FolderOpen size={12} className="md:w-3.5 md:h-3.5" />
                <span className="font-medium truncate">{project.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
            <User size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="break-words">{reservation.user_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
            <DoorClosed size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="break-words">{reservation.room_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
            <Clock size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="break-words">{formatDateTimeRange(reservation.start_time, reservation.end_time)}</span>
          </div>
          {reservation.created_at && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
              <Calendar size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
              <span className="break-words">Criado em: {formatBrazilDateTime(reservation.created_at)}</span>
            </div>
          )}
          {reservation.description && (
            <div className="text-xs md:text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded break-words">
              {reservation.description}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {viewType === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(reservation.id)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} className="md:w-4 md:h-4" />
                    <span>Aprovar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => openRejectModal(reservation)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                <X size={14} className="md:w-4 md:h-4" />
                <span>Rejeitar</span>
              </button>
            </>
          )}
          <button
            onClick={() => openDetailsModal(reservation)}
            className={`${viewType === 'pending' ? 'flex-1' : 'flex-1 sm:flex-none'} bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-xs md:text-sm`}
          >
            <Info size={14} className="md:w-4 md:h-4" />
            <span>Detalhes</span>
          </button>
          
          {viewType === 'approved' && (
            <button
              onClick={() => handleReprove(reservation.id)}
              disabled={isProcessing}
              className="bg-red-600 text-white px-2 md:px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1 text-xs md:text-sm"
            >
              <X size={12} className="md:w-3.5 md:h-3.5" />
              <span>Reprovar</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ProfessorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProfessorLayout>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin-once {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-once {
          animation: spin-once 0.5s ease-in-out;
        }
      `}</style>
      <ProfessorLayout>
        <div className="p-4 md:p-6">
          {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <CheckSquare className="text-green-600 w-5 h-5 md:w-7 md:h-7" size={28} />
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                    Aprovar Reservas dos Alunos
                  </h1>
                  <div className="relative group">
                    <Info className="text-blue-600 cursor-help w-4 h-4 md:w-5 md:h-5" size={20} />
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block w-56 md:w-64 z-50">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 shadow-lg">
                        <h3 className="text-xs md:text-sm font-medium text-blue-900 mb-1">
                          Fluxo de Aprovação em Duas Etapas
                        </h3>
                        <p className="text-xs md:text-sm text-blue-800">
                          Ao aprovar uma reserva aqui, ela será enviada para <strong>aprovação final da secretaria</strong>. 
                          Somente após a aprovação da secretaria a reserva estará <strong>confirmada</strong>.
                        </p>
                      </div>
                      {/* Seta do tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-blue-200"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-700">
                  Revise e aprove as reservas dos seus projetos
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={refreshReservations}
            disabled={loading || isRefreshing}
            className="w-full sm:w-auto bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? "animate-spin-once" : ""}
            />
            <span className="whitespace-nowrap">Atualizar</span>
          </button>
        </div>

        {/* Tabs de visualização e Filtro por projeto */}
        <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 border-b border-gray-200 pb-2">
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            <button
              onClick={() => setViewType('pending')}
              className={` md:px-4 py-2 text-sm md:text-base font-medium transition-colors relative whitespace-nowrap ${
                viewType === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pendentes
              {reservations.length > 0 && (
                <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {reservations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewType('approved')}
              className={`px-0 md:px-4 py-2 text-sm md:text-base font-medium transition-colors relative whitespace-nowrap ${
                viewType === 'approved'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Aprovadas por Mim
              {professorApprovedReservations.length > 0 && (
                <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {professorApprovedReservations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewType('rejected')}
              className={`px-0 md:px-4 py-2 text-sm md:text-base font-medium transition-colors relative whitespace-nowrap ${
                viewType === 'rejected'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Rejeitadas
              {rejectedReservations.length > 0 && (
                <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  {rejectedReservations.length}
                </span>
              )}
            </button>
          </div>

          {/* Filtro por projeto */}
          {projects.length > 1 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                Filtrar por Projeto:
              </label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-sm"
              >
                <option value="all">Todos os Projetos</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Lista de reservas */}
        {currentReservations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 text-center">
            <AlertTriangle className="mx-auto mb-4 text-gray-400 w-10 h-10 md:w-12 md:h-12" size={48} />
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              {viewType === 'pending' && 'Não há reservas pendentes de aprovação no momento.'}
              {viewType === 'approved' && 'Você ainda não aprovou nenhuma reserva.'}
              {viewType === 'rejected' && 'Não há reservas rejeitadas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {currentReservations.map(renderReservationCard)}
          </div>
        )}

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
              <AlertCircle className="text-white flex-shrink-0" size={18} />
              <span className="text-xs md:text-sm font-medium break-words flex-1">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
          <div className={`fixed left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20 md:top-20' : 'top-4'
          }`}>
            <div className="bg-green-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
              <CheckCircle className="text-white flex-shrink-0" size={18} />
              <span className="text-xs md:text-sm font-medium break-words flex-1">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal de Rejeição */}
        <RejectReservationModal
          open={showRejectModal}
          reservation={selectedReservation}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          formatDateTime={formatDateTime}
          processing={selectedReservation ? processingIds.has(selectedReservation.id) : false}
        />

        {/* Modal de Detalhes */}
        <ReservationDetailsModal
          isOpen={showDetailsModal}
          reservation={detailsReservation}
          onClose={() => setShowDetailsModal(false)}
        />
        </div>
      </ProfessorLayout>
    </>
  );
};

export default AprovarReservas;

