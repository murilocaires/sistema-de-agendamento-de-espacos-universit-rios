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
      
      await loadAllData(); // Recarregar todos os dados
      
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

  // Abrir modal de detalhes
  const openDetailsModal = (reservation) => {
    setDetailsReservation(reservation);
    setShowDetailsModal(true);
  };

  // Formatar data
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
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
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg mb-1">
              {reservation.title}
            </h3>
            {project && (
              <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
                <FolderOpen size={14} />
                <span className="font-medium">{project.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User size={14} />
            <span>{reservation.user_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <DoorClosed size={14} />
            <span>{reservation.room_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock size={14} />
            <span>{formatDateTime(reservation.start_time)}</span>
          </div>
          {reservation.description && (
            <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {reservation.description}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {viewType === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(reservation.id)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Aprovar
                  </>
                )}
              </button>
              <button
                onClick={() => openRejectModal(reservation)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                <X size={16} />
                Rejeitar
              </button>
            </>
          )}
          <button
            onClick={() => openDetailsModal(reservation)}
            className={`${viewType === 'pending' ? '' : 'flex-1'} bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm`}
          >
            <Info size={16} />
            Detalhes
          </button>
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
    <ProfessorLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <CheckSquare className="text-green-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Aprovar Reservas dos Alunos
              </h1>
              <p className="text-sm text-gray-700">
                Revise e aprove as reservas dos seus projetos
              </p>
            </div>
          </div>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {/* Aviso sobre o fluxo de aprovação */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Fluxo de Aprovação em Duas Etapas
              </h3>
              <p className="text-sm text-blue-800">
                Ao aprovar uma reserva aqui, ela será enviada para <strong>aprovação final do administrador</strong>. 
                Somente após a aprovação do admin a reserva estará <strong>confirmada</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de visualização */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setViewType('pending')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewType === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pendentes
            {reservations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                {reservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewType('approved')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewType === 'approved'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Aprovadas por Mim
            {professorApprovedReservations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {professorApprovedReservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewType('rejected')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewType === 'rejected'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Rejeitadas
            {rejectedReservations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                {rejectedReservations.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtro por projeto */}
        {projects.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Projeto
            </label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Lista de reservas */}
        {currentReservations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-600">
              {viewType === 'pending' && 'Não há reservas pendentes de aprovação no momento.'}
              {viewType === 'approved' && 'Você ainda não aprovou nenhuma reserva.'}
              {viewType === 'rejected' && 'Não há reservas rejeitadas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReservations.map(renderReservationCard)}
          </div>
        )}

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <AlertCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-white/80 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
          <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20' : 'top-4'
          }`}>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <CheckCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto text-white/80 hover:text-white transition-colors"
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
  );
};

export default AprovarReservas;

