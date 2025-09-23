import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations
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
  Eye,
  Filter,
  Search,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";

const HistoricoAluno = () => {
  const { user } = useAuth();

  // Estados
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const reservationsData = await getReservations({ user_id: user?.id });
      setReservations(reservationsData);
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
    
    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      
      const now = new Date();
      const reservationDate = new Date(reservation.start_time);
      
      switch (dateFilter) {
        case "today":
          return reservationDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reservationDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return reservationDate >= monthAgo;
        case "past":
          return reservationDate < now;
        case "future":
          return reservationDate > now;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
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

  // Calcular estatísticas
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
    past: reservations.filter(r => new Date(r.start_time) < new Date()).length,
    future: reservations.filter(r => new Date(r.start_time) > new Date()).length
  };

  // Calcular paginação
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

  // Ordenar reservas por data (mais recentes primeiro)
  const sortedReservations = [...paginatedReservations].sort((a, b) => 
    new Date(b.start_time) - new Date(a.start_time)
  );

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
            <h1 className="text-2xl font-bold text-gray-800">Histórico de Reservas</h1>
            <p className="text-gray-700">Visualize todo o histórico das suas reservas</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total */}
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

          {/* Passadas */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passadas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.past}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <TrendingDown className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          {/* Futuras */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Futuras</p>
                <p className="text-2xl font-bold text-blue-600">{stats.future}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="text-blue-600" size={24} />
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
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-4 w-full md:w-2/3">
              <select
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Rejeitada</option>
              </select>
              <select
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todas as Datas</option>
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="past">Passadas</option>
                <option value="future">Futuras</option>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReservations.map((reservation) => {
                      const isPast = new Date(reservation.start_time) < new Date();
                      const isFuture = new Date(reservation.start_time) > new Date();
                      
                      return (
                        <tr key={reservation.id} className={isPast ? "bg-gray-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.room_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(reservation.start_time)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                              {getStatusText(reservation.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isPast ? (
                              <span className="text-gray-500">Passada</span>
                            ) : isFuture ? (
                              <span className="text-blue-600">Futura</span>
                            ) : (
                              <span className="text-green-600">Hoje</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openModal(reservation)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver Detalhes"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
              <div className="space-y-3 text-gray-700">
                <p><strong>Título:</strong> {selectedReservation.title}</p>
                <p><strong>Descrição:</strong> {selectedReservation.description || 'N/A'}</p>
                <p className="flex items-center gap-2">
                  <DoorClosed size={16} /> <strong>Sala:</strong> {selectedReservation.room_name}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} /> <strong>Início:</strong> {formatDate(selectedReservation.start_time)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} /> <strong>Fim:</strong> {formatDate(selectedReservation.end_time)}
                </p>
                <p className="flex items-center gap-2">
                  <UsersIcon size={16} /> <strong>Reservado por:</strong> {selectedReservation.user_name} ({selectedReservation.user_email})
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} /> <strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusText(selectedReservation.status)}
                  </span>
                </p>
                {selectedReservation.rejection_reason && (
                  <p className="text-red-600"><strong>Motivo da Rejeição:</strong> {selectedReservation.rejection_reason}</p>
                )}
                <p className="flex items-center gap-2">
                  <CalendarIcon size={16} /> <strong>Criada em:</strong> {formatDate(selectedReservation.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default HistoricoAluno;
