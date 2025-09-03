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

const ApproveReservations = () => {
const { user } = useAuth();
const userType = user?.role || "admin";
const menuItems = getUserMenu(userType);
const userTypeDisplay = getUserTypeDisplay(userType);

// Estados
const [reservations, setReservations] = useState([]);
const [approvedReservations, setApprovedReservations] = useState([]);
const [rooms, setRooms] = useState([]);
const [selectedRoom, setSelectedRoom] = useState("");
const [weeklyReservations, setWeeklyReservations] = useState([]);
const [showApproved, setShowApproved] = useState(false);
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
    
    const [pendingData, approvedData, roomsData] = await Promise.all([
        getPendingReservations(),
        getReservations({ status: 'approved' }),
        getRooms()
    ]);
    
    setReservations(pendingData);
    setApprovedReservations(approvedData);
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
                Aprovar Reservas
            </h1>
            <p className="text-sm text-gray-700">
                Revisar e aprovar reservas pendentes
            </p>
            </div>
        </div>
        <button
            onClick={loadAllData}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Atualizar
        </button>
        </div>

        {/* Mensagens */}
        {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={18} />
            <span className="text-sm text-red-700">{error}</span>
        </div>
        )}

        {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-500" size={18} />
            <span className="text-sm text-green-700">{successMessage}</span>
        </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Reservas */}
        <div className="lg:col-span-2">
            {/* Estatísticas */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-700">Pendentes</p>
                    <p className="text-xl font-bold text-orange-600">{reservations.length}</p>
                </div>
                <Clock className="text-orange-400" size={20} />
                </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-700">Aprovadas</p>
                    <p className="text-xl font-bold text-green-600">{approvedReservations.length}</p>
                </div>
                <CheckCircle className="text-green-400" size={20} />
                </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-700">Total</p>
                    <p className="text-xl font-bold text-blue-600">{reservations.length + approvedReservations.length}</p>
                </div>
                <Filter className="text-blue-400" size={20} />
                </div>
            </div>
            </div>

            {/* Controles */}
            <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
                {showApproved ? 'Reservas Aprovadas' : 'Reservas Pendentes'}
            </h2>
            <button
                onClick={() => setShowApproved(!showApproved)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-500 hover:bg-gray-400 rounded-lg text-gray-700"
            >
                {showApproved ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showApproved ? 'Ver Pendentes' : 'Ver Aprovadas'}
            </button>
            </div>

            {/* Lista de Reservas */}
            {loading ? (
            <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600">Carregando...</p>
            </div>
            ) : (showApproved ? approvedReservations : reservations).length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow border">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                {showApproved ? 'Nenhuma reserva aprovada' : 'Nenhuma reserva pendente'}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                {showApproved ? 'Ainda não há reservas aprovadas' : 'Todas as reservas foram processadas!'}
                </p>
            </div>
            ) : (
            <div className="space-y-10 max-h-screen overflow-y-auto pr-2">
                {(showApproved ? approvedReservations : reservations).map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-lg shadow border p-4">
                    {/* Header Compacto */}
                    <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {reservation.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(reservation.priority)}`}>
                            {getPriorityText(reservation.priority)}
                        </span>
                        </div>
                        <p className="text-xs text-gray-600">
                        {formatDateTime(reservation.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={() => openDetailsModal(reservation)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalhes"
                    >
                        <Info size={16} />
                    </button>
                    </div>


                    {/* Informações Compactas */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <User className="text-gray-500" size={14} />
                        <div>
                        <p className="text-xs font-medium text-gray-800">{reservation.user_name}</p>
                        <p className="text-xs text-gray-700">{reservation.user_role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DoorClosed className="text-gray-700" size={14} />
                        <div>
                        <p className="text-xs font-medium text-gray-700">{reservation.room_name}</p>
                        <p className="text-xs text-gray-700">{reservation.room_location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="text-gray-700" size={14} />
                        <div>
                        <p className="text-xs font-medium text-gray-700">
                            {new Date(reservation.start_time).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-700">
                            {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="text-gray-700" size={14} />
                        <div>
                        <p className="text-xs font-medium text-gray-700">
                            {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                        <p className="text-xs text-gray-700">
                            {Math.round((new Date(reservation.end_time) - new Date(reservation.start_time)) / (1000 * 60))}min
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Recorrência Compacta */}
                    {reservation.is_recurring && (
                    <div className="mb-3 p-2 bg-blue-50 rounded flex items-center gap-2">
                        <AlertTriangle className="text-blue-600" size={14} />
                        <p className="text-xs text-blue-800">
                        Recorrente ({reservation.recurrence_type})
                        </p>
                    </div>
                    )}

                    {/* Botões de Ação Compactos */}
                    {!showApproved && (
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                        onClick={() => openRejectModal(reservation)}
                        disabled={processingIds.has(reservation.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
                        >
                        {processingIds.has(reservation.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                            <X size={14} />
                        )}
                        Rejeitar
                        </button>
                        
                        <button
                        onClick={() => handleApprove(reservation.id)}
                        disabled={processingIds.has(reservation.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                        >
                        {processingIds.has(reservation.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                            <Check size={14} />
                        )}
                        Aprovar
                        </button>
                    </div>
                    )}

                    {/* Status para reservas aprovadas */}
                    {showApproved && (
                    <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Aprovada
                        </span>
                        {reservation.approved_by_name && (
                            <span className="text-xs text-gray-700">
                            por {reservation.approved_by_name}
                            </span>
                        )}
                        </div>
                    </div>
                    )}
                </div>
                ))}
            </div>
            )}
        </div>

                  {/* Coluna Direita - Calendário Semanal */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border p-4">
            {/* Header do Calendário */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Agenda Semanal
                </h3>
                <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">Selecione uma sala</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                    {room.name} - {room.location}
                    </option>
                ))}
                </select>
            </div>

            {/* Calendário */}
            {selectedRoom ? (
                <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {getSelectedRoomName()}
                </h4>
                
                {/* Dias da Semana */}
                <div className="space-y-2">
                    {getWeekDays().map((day, index) => {
                    const dayReservations = getReservationsForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    
                    return (
                        <div key={index} className={`p-2 rounded-lg border ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        {/* Header do Dia */}
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium ${isToday ? 'text-blue-800' : 'text-gray-700'}`}>
                            {dayNames[day.getDay()]} {day.getDate().toString().padStart(2, '0')}/{(day.getMonth() + 1).toString().padStart(2, '0')}
                            </span>
                                                         <span className="text-xs text-gray-600">
                             {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''}
                             </span>
                        </div>
                        
                        {/* Reservas do Dia */}
                        <div className="space-y-1">
                            {dayReservations.length === 0 ? (
                            <p className="text-xs text-gray-700 italic">Nenhuma reserva</p>
                            ) : (
                            dayReservations
                                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                                .map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                                    onClick={() => openDetailsModal(reservation)}
                                >
                                    <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-800 truncate">
                                        {reservation.title}
                                        </p>
                                        <p className="text-xs text-gray-700">
                                        {reservation.user_name}
                                        </p>
                                    </div>
                                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${getPriorityColor(reservation.priority)}`}>
                                        {getPriorityText(reservation.priority)[0]}
                                    </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                    <Clock className="text-gray-700" size={10} />
                                    <span className="text-xs text-gray-700">
                                        {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - 
                                        {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                                    </span>
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
                            ) : (
                <div className="text-center py-8">
                <DoorClosed className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                    Selecione uma sala para ver a agenda semanal
                </p>
                </div>
                )}
            </div>
        </div>
        </div>

        {/* Modal de Rejeição */}
        {showRejectModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                {selectedReservation?.status === 'approved' ? 'Revogar Aprovação' : 'Rejeitar Reserva'}
                </h3>
                <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-700 hover:text-gray-700"
                >
                <X size={24} />
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                {selectedReservation?.status === 'approved' 
                    ? 'Você está revogando a aprovação da reserva:' 
                    : 'Você está rejeitando a reserva:'
                }
                </p>
                <p className="font-medium">{selectedReservation.title}</p>
                <p className="text-sm text-gray-700">
                {selectedReservation.room_name} - {formatDateTime(selectedReservation.start_time)}
                </p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedReservation?.status === 'approved' 
                    ? 'Motivo da Revogação *' 
                    : 'Motivo da Rejeição *'
                }
                </label>
                <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder={selectedReservation?.status === 'approved' 
                    ? 'Explique o motivo da revogação...' 
                    : 'Explique o motivo da rejeição...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                Cancelar
                </button>
                <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingIds.has(selectedReservation.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                {selectedReservation?.status === 'approved' ? 'Revogar' : 'Rejeitar'}
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Modal de Detalhes */}
        {showDetailsModal && detailsReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                Detalhes da Reserva
                </h3>
                <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-700"
                >
                <X size={24} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="text-sm text-gray-900">{detailsReservation.title}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(detailsReservation.priority)}`}>
                    {getPriorityText(detailsReservation.priority)}
                    </span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Solicitante</label>
                    <p className="text-sm text-gray-900">{detailsReservation.user_name}</p>
                    <p className="text-xs text-gray-700">{detailsReservation.user_email} ({detailsReservation.user_role})</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sala</label>
                    <p className="text-sm text-gray-900">{detailsReservation.room_name}</p>
                    <p className="text-xs text-gray-700">{detailsReservation.room_location} (Cap: {detailsReservation.room_capacity})</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data/Hora Início</label>
                    <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.start_time)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data/Hora Fim</label>
                    <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.end_time)}</p>
                </div>
                </div>

                {detailsReservation.description && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{detailsReservation.description}</p>
                </div>
                )}

                {detailsReservation.is_recurring && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                    <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">
                        Tipo: {detailsReservation.recurrence_type}
                    </p>
                    {detailsReservation.recurrence_end_date && (
                        <p className="text-sm text-blue-600">
                        Até: {formatDateTime(detailsReservation.recurrence_end_date)}
                        </p>
                    )}
                    </div>
                </div>
                )}

                <div>
                <label className="block text-sm font-medium text-gray-700">Solicitado em</label>
                <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.created_at)}</p>
                </div>

                {/* Informações de aprovação/rejeição */}
                {detailsReservation.status === 'approved' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Aprovada em</label>
                    <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.approved_at)}</p>
                    {detailsReservation.approved_by_name && (
                    <p className="text-xs text-gray-600">por {detailsReservation.approved_by_name}</p>
                    )}
                </div>
                )}

                {detailsReservation.status === 'rejected' && detailsReservation.rejection_reason && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
                    <p className="text-sm text-gray-900 bg-red-50 p-3 rounded">{detailsReservation.rejection_reason}</p>
                </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                Fechar
                </button>
                
                {/* Mostrar botões de ação baseado no status e papel do usuário */}
                {detailsReservation.status === 'pending' ? (
                <>
                    <button
                    onClick={() => {
                        setShowDetailsModal(false);
                        openRejectModal(detailsReservation);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    >
                    Rejeitar
                    </button>
                    <button
                    onClick={() => {
                        setShowDetailsModal(false);
                        handleApprove(detailsReservation.id);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                    >
                    Aprovar
                    </button>
                </>
                ) : detailsReservation.status === 'approved' ? (
                /* Para reservas aprovadas - admin pode rejeitar */
                <div className="flex items-center gap-2">
                    <span className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">
                        ✓ Já Aprovada
                    </span>
                    {user?.role === 'admin' && (
                    <button
                        onClick={() => {
                            setShowDetailsModal(false);
                            openRejectModal(detailsReservation);
                        }}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                        title="Revogar aprovação"
                    >
                        Revogar
                    </button>
                    )}
                </div>
                ) : (
                /* Para reservas rejeitadas */
                <div className="flex items-center gap-2">
                    <span className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">
                        ✗ Rejeitada
                    </span>
                </div>
                )}
            </div>
            </div>
        </div>
        )}
    </div>
    </DashboardLayout>
);
};

export default ApproveReservations;
