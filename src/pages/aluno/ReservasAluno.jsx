import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations,
  getRooms,
  deleteReservation
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
import StudentLayout from "../../layouts/StudentLayout";

const ReservasAluno = () => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsData, roomsData] = await Promise.all([
        getReservations({ user_id: user?.id }), // Buscar apenas as reservas do usuário logado
        getRooms()
      ]);
      setReservations(reservationsData);
      setRooms(roomsData.filter(room => room.is_active)); // Apenas salas ativas
      setError("");
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
  }, [user]);

  // Filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.room_name.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Fechar modal de detalhes
  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  // Abrir modal de confirmação de exclusão
  const confirmDelete = (reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteConfirm(true);
  };

  // Excluir reserva
  const handleDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await deleteReservation(reservationToDelete.id);
      setReservations(reservations.filter(r => r.id !== reservationToDelete.id));
      setShowDeleteConfirm(false);
      setReservationToDelete(null);
      setError("");
    } catch (err) {
      setError("Erro ao excluir reserva: " + err.message);
    }
  };

  // Calcular estatísticas
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length
  };

  // Calcular paginação
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Reservas</h1>
            <p className="text-gray-700">Gerencie suas reservas de espaços universitários</p>
          </div>
        </div>

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <AlertCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total de Reservas */}
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

          {/* Pendentes */}
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

          {/* Aprovadas */}
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

          {/* Rejeitadas */}
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

        {/* Filtros e Lista */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título ou sala..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page on search
                }}
              />
            </div>
            <div className="w-full md:w-1/4">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset page on filter change
                }}
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Rejeitada</option>
              </select>
            </div>
          </div>

          {/* Lista de Reservas */}
          {filteredReservations.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Ajuste seus filtros ou crie uma nova reserva.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.room_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(reservation.start_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(reservation.end_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModal(reservation)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Ver Detalhes"
                          >
                            <Eye size={18} />
                          </button>
                          {reservation.status === 'pending' && (
                            <button
                              onClick={() => confirmDelete(reservation)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancelar Reserva"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalhes da Reserva */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalhes da Reserva</h2>
              <div className="text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p><strong>Título:</strong> {selectedReservation.title}</p>
                <p><strong>ID:</strong> #{selectedReservation.id}</p>

                <p className="sm:col-span-2"><strong>Descrição:</strong> {selectedReservation.description || 'N/A'}</p>

                <p><strong>Projeto:</strong> {selectedReservation.project_name || 'N/A'}</p>
                <p><strong>Tipo do Projeto:</strong> {selectedReservation.project_type || 'N/A'}</p>

                <p className="flex items-center gap-2">
                  <DoorClosed size={16} /> <strong>Sala:</strong> {selectedReservation.room_name}
                </p>
                <p><strong>Local:</strong> {selectedReservation.room_location || 'N/A'}</p>

                <p><strong>Capacidade da Sala:</strong> {selectedReservation.room_capacity ? `${selectedReservation.room_capacity} pessoas` : 'N/A'}</p>
                <p><strong>Quantidade de Pessoas:</strong> {selectedReservation.people_count ? `${selectedReservation.people_count} ${selectedReservation.people_count === 1 ? 'pessoa' : 'pessoas'}` : 'N/A'}</p>

                <p className="flex items-center gap-2">
                  <Clock size={16} /> <strong>Início:</strong> {formatDate(selectedReservation.start_time)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} /> <strong>Fim:</strong> {formatDate(selectedReservation.end_time)}
                </p>

                <p><strong>Recorrência:</strong> {selectedReservation.is_recurring ? (selectedReservation.recurrence_type || 'Sim') : 'Não'}</p>
                {selectedReservation.is_recurring && (
                  <>
                    <p><strong>Fim da Recorrência:</strong> {selectedReservation.recurrence_end_date ? formatDate(selectedReservation.recurrence_end_date) : 'N/A'}</p>
                    <p><strong>Intervalo:</strong> {selectedReservation.recurrence_interval || 'N/A'}</p>
                  </>
                )}

                <p><strong>Solicitado em:</strong> {selectedReservation.created_at ? formatDate(selectedReservation.created_at) : 'N/A'}</p>
                <p><strong>Atualizado em:</strong> {selectedReservation.updated_at ? formatDate(selectedReservation.updated_at) : 'N/A'}</p>

                <p className="flex items-center gap-2 sm:col-span-2">
                  <UsersIcon size={16} /> <strong>Solicitante:</strong> {selectedReservation.user_name} ({selectedReservation.user_email})
                </p>
                {selectedReservation.approved_by_name && (
                  <p className="sm:col-span-2"><strong>Aprovado por:</strong> {selectedReservation.approved_by_name}</p>
                )}

                <p className="flex items-center gap-2 sm:col-span-2">
                  <CheckCircle size={16} /> <strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusText(selectedReservation.status)}
                  </span>
                </p>

                {selectedReservation.rejection_reason && (
                  <p className="text-red-600 sm:col-span-2"><strong>Motivo da Rejeição:</strong> {selectedReservation.rejection_reason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar Exclusão</h2>
              <p className="text-gray-700 mb-6">Tem certeza que deseja cancelar a reserva "{reservationToDelete?.title}"?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ReservasAluno;
