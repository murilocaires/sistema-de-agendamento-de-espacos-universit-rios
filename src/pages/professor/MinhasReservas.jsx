import React, { useState, useEffect } from "react";
import ProfessorLayout from "../../layouts/ProfessorLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations,
  getRooms 
} from "../../services/authService";
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
  Search
} from "lucide-react";

const MinhasReservas = () => {
  const { user } = useAuth();

  // Estados
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [reservationsData, roomsData] = await Promise.all([
        getReservations({ user_id: user?.id }),
        getRooms()
      ]);
      
      setReservations(reservationsData || []);
      setRooms(roomsData || []);
      
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  // Filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Obter texto do status
  const getStatusText = (status) => {
    const texts = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Rejeitada"
    };
    return texts[status] || status;
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'rejected':
        return <X className="text-red-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  // Abrir modal de detalhes
  const openModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  // Calcular estatísticas
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length
  };

  return (
    <ProfessorLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Minhas Reservas
            </h1>
            <p className="text-gray-700">
              Gerencie suas reservas de salas
            </p>
          </div>
        </div>

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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <X className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, sala ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovadas</option>
                <option value="rejected">Rejeitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Reservas */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando suas reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow border">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || statusFilter !== "all" ? "Nenhuma reserva encontrada" : "Nenhuma reserva encontrada"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca." 
                : "Você ainda não fez nenhuma reserva. Clique em 'Nova Reserva' para começar."
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.title}
                          </div>
                          {reservation.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {reservation.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DoorClosed className="text-gray-400 mr-2" size={16} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.room_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.room_location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="text-gray-400 mr-2" size={16} />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(reservation.start_time).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - 
                              {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(reservation.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(reservation)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes da Reserva
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="text-sm text-gray-900">{selectedReservation.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedReservation.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusText(selectedReservation.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sala</label>
                    <p className="text-sm text-gray-900">{selectedReservation.room_name}</p>
                    <p className="text-xs text-gray-700">{selectedReservation.room_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data/Hora Início</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedReservation.start_time)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data/Hora Fim</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedReservation.end_time)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Criada em</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedReservation.created_at)}</p>
                  </div>
                </div>

                {selectedReservation.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedReservation.description}</p>
                  </div>
                )}

                {selectedReservation.is_recurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-800">
                        Tipo: {selectedReservation.recurrence_type}
                      </p>
                      {selectedReservation.recurrence_end_date && (
                        <p className="text-sm text-blue-600">
                          Até: {formatDate(selectedReservation.recurrence_end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedReservation.status === 'rejected' && selectedReservation.rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
                    <p className="text-sm text-gray-900 bg-red-50 p-3 rounded">{selectedReservation.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

export default MinhasReservas;
