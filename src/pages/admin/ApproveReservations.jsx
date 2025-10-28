import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
getPendingReservations,
approveReservation,
getReservations,
getRooms
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
ChevronDown,
ChevronUp
} from "lucide-react";
import ReservationDetailsModal from "../../components/admin/ReservationDetailsModal";
import RejectReservationModal from "../../components/admin/RejectReservationModal";
import ReservationsLayout from "../../components/admin/ReservationsLayout";
import NewReservation from "./NewReservation";

const ApproveReservations = () => {
const { user } = useAuth();
const userType = user?.role || "admin";
const menuItems = getUserMenu(userType);
const userTypeDisplay = getUserTypeDisplay(userType);

// Estados
const [reservations, setReservations] = useState([]);
const [approvedReservations, setApprovedReservations] = useState([]);
const [rejectedReservations, setRejectedReservations] = useState([]);
const [rooms, setRooms] = useState([]);
const [selectedRoom, setSelectedRoom] = useState("");
const [weeklyReservations, setWeeklyReservations] = useState([]);
const [viewType, setViewType] = useState('pending'); // 'pending', 'approved', 'rejected'
const [isMinimized, setIsMinimized] = useState(false);
const [filterType, setFilterType] = useState('all');
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [processingIds, setProcessingIds] = useState(new Set());
  const [showInlineNew, setShowInlineNew] = useState(false);

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
    
    const [pendingData, approvedData, rejectedData, roomsData] = await Promise.all([
        getPendingReservations(),
        getReservations({ status: 'approved' }),
        getReservations({ status: 'rejected' }),
        getRooms()
    ]);
    
    setReservations(pendingData);
    setApprovedReservations(approvedData);
    setRejectedReservations(rejectedData);
    setRooms(roomsData.filter(room => room.is_active));
    
    // Definir sala padrão se houver salas disponíveis
    if (roomsData.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsData[0].id.toString());
    }
    } catch (err) {
    setError("Erro ao carregar dados: " + err.message);
    setReservations([]);
    setApprovedReservations([]);
    setRooms([]);
    } finally {
    setLoading(false);
    }
};

// Carregar reservas da semana para a sala selecionada
const loadWeeklyReservations = async (roomId) => {
    if (!roomId) return;
    
    try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    
    const weeklyData = await getReservations({
        room_id: roomId,
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
        status: 'approved'
    });
    
    setWeeklyReservations(weeklyData);
    } catch (err) {
    console.error("Erro ao carregar reservas da semana:", err);
    setWeeklyReservations([]);
    }
};

useEffect(() => {
    loadAllData();
}, []);

useEffect(() => {
    if (selectedRoom) {
    loadWeeklyReservations(selectedRoom);
    }
}, [selectedRoom]);

// Aprovar reserva
const handleApprove = async (reservationId) => {
    try {
    setProcessingIds(prev => new Set(prev).add(reservationId));
    setError("");
    setSuccessMessage("");

    const result = await approveReservation(reservationId, 'approve');
    
    setSuccessMessage(result.message || "Reserva aprovada com sucesso!");
    await loadAllData(); // Recarregar todos os dados
    
    setTimeout(() => setSuccessMessage(""), 3000);
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
      
      // Usar a mensagem retornada pela API
      setSuccessMessage(result.message || "Operação realizada com sucesso!");
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

// Selecionar sala automaticamente
const selectRoomFromReservation = (reservation) => {
    if (reservation.room_id) {
        setSelectedRoom(reservation.room_id.toString());
    }
};

// Abrir modal de detalhes
const openDetailsModal = (reservation) => {
    setDetailsReservation(reservation);
    setShowDetailsModal(true);
    
    // Selecionar automaticamente a sala na agenda semanal
    selectRoomFromReservation(reservation);
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

// Gerar dias da semana atual
const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    
    const days = [];
    for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
    }
    return days;
};

// Obter reservas para um dia específico
const getReservationsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weeklyReservations.filter(reservation => {
    const reservationDate = new Date(reservation.start_time).toISOString().split('T')[0];
    return reservationDate === dateStr;
    });
};

// Função para filtrar e ordenar reservas
const getFilteredReservations = (reservationList) => {
    const now = new Date();
    
    let filtered;
    switch (filterType) {
    case 'past':
        filtered = reservationList.filter(r => new Date(r.end_time) < now);
        break;
    case 'upcoming':
        filtered = reservationList.filter(r => new Date(r.start_time) > now);
        break;
    case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = reservationList.filter(r => {
        const startDate = new Date(r.start_time);
        return startDate >= today && startDate < tomorrow;
        });
        break;
    case 'oldest':
        return [...reservationList].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    default:
        filtered = reservationList;
    }
    
    // Ordenação padrão: mais próximas do horário atual primeiro
    return [...filtered].sort((a, b) => {
        const timeA = new Date(a.start_time).getTime();
        const timeB = new Date(b.start_time).getTime();
        const nowTime = now.getTime();
        
        // Calcular distância absoluta do horário atual
        const distanceA = Math.abs(timeA - nowTime);
        const distanceB = Math.abs(timeB - nowTime);
        
        return distanceA - distanceB;
    });
};

// Obter nome da sala selecionada
const getSelectedRoomName = () => {
    const room = rooms.find(r => r.id.toString() === selectedRoom);
    return room ? room.name : 'Selecione uma sala';
};

return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
    <div className="p-6">
        {/* Header */}
            <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <CheckSquare className="text-green-600" size={28} />
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    Reservas
                </h1>
            <p className="text-sm text-gray-700">
                    Revisar e aprovar reservas pendentes
            </p>
            </div>
        </div>
              <div className="flex items-center gap-2">
                {showInlineNew && (
                  <button
                    onClick={() => setShowInlineNew(false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    title="Voltar para Reservas"
                  >
                    Voltar
                  </button>
                )}
                <button
                  onClick={() => setShowInlineNew(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  Nova Reserva
                </button>
                <button
                  onClick={loadAllData}
                  disabled={loading}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  Atualizar
                </button>
              </div>
        </div>

        {/* Mensagens */}
        {showInlineNew ? (
          <div className="bg-white rounded-lg shadow border">
            <NewReservation embed={true} />
          </div>
        ) : (
        <ReservationsLayout
            reservations={reservations}
            approvedReservations={approvedReservations}
            rejectedReservations={rejectedReservations}
            rooms={rooms}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            loading={loading}
            error={error}
            successMessage={successMessage}
            viewType={viewType}
            setViewType={setViewType}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            filterType={filterType}
            setFilterType={setFilterType}
            getFilteredReservations={getFilteredReservations}
            selectRoomFromReservation={selectRoomFromReservation}
            formatDateTime={formatDateTime}
            getPriorityColor={getPriorityColor}
            getPriorityText={getPriorityText}
            openDetailsModal={openDetailsModal}
            openRejectModal={openRejectModal}
            handleApprove={handleApprove}
            processingIds={processingIds}
            getSelectedRoomName={getSelectedRoomName}
            getWeekDays={getWeekDays}
            getReservationsForDay={getReservationsForDay}
        />)}
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

        <ReservationDetailsModal
          open={showDetailsModal}
          reservation={detailsReservation}
          onClose={() => setShowDetailsModal(false)}
          onApprove={handleApprove}
          onReject={(r) => openRejectModal(r)}
          formatDateTime={formatDateTime}
          user={user}
        />
    </div>
    </DashboardLayout>
);
};

export default ApproveReservations;
