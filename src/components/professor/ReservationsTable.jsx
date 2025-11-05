import React, { useState, useMemo } from 'react';
import { Calendar, Clock, DoorClosed, CheckCircle, X, Eye, ChevronUp, ChevronDown, Ban } from 'lucide-react';
import { formatBrazilDateTime } from '../../utils/dateUtils';

const ReservationsTable = ({ 
  reservations, 
  loading, 
  searchTerm, 
  statusFilter, 
  viewMode, 
  onReservationClick 
}) => {
  const [sortField, setSortField] = useState('start_time');
  const [sortDirection, setSortDirection] = useState('desc');

  // Função para ordenar as reservas
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reservas ordenadas
  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'room_name':
          aValue = a.room_name?.toLowerCase() || '';
          bValue = b.room_name?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'start_time':
        default:
          aValue = new Date(a.start_time);
          bValue = new Date(b.start_time);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reservations, sortField, sortDirection]);

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      professor_approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100/10 text-gray-600"
    };
    return colors[status] || "bg-gray-100/10 text-gray-800";
  };

  // Obter texto do status
  const getStatusText = (status) => {
    const texts = {
      pending: "Pendente",
      approved: "Aprovada",
      professor_approved: "Aprovado pelo Professor",
      rejected: "Rejeitada",
      cancelled: "Cancelada"
    };
    return texts[status] || status;
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'professor_approved':
        return <CheckCircle className="text-blue-600" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'rejected':
        return <X className="text-red-600" size={16} />;
      case 'cancelled':
        return <Ban className="text-gray-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  // Obter ícone de ordenação
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUp className="text-gray-300" size={16} />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="text-blue-600" size={16} /> : 
      <ChevronDown className="text-blue-600" size={16} />;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando suas reservas...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow border">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {searchTerm || statusFilter !== "all" ? "Nenhuma reserva encontrada" : "Nenhuma reserva encontrada"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm || statusFilter !== "all" 
            ? "Tente ajustar os filtros de busca." 
            : viewMode === 'my-reservations'
              ? "Você ainda não fez nenhuma reserva pessoal. Clique em 'Nova Reserva' para começar."
              : "Nenhuma reserva foi encontrada nos seus projetos de extensão."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/10 select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Reserva
                    {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/10 select-none"
                  onClick={() => handleSort('room_name')}
                >
                  <div className="flex items-center gap-1">
                    Sala
                    {getSortIcon('room_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/10 select-none"
                  onClick={() => handleSort('start_time')}
                >
                  <div className="flex items-center gap-1">
                    Data/Hora
                    {getSortIcon('start_time')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/10 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/10 select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Criado em
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReservations.map((reservation) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.created_at ? formatBrazilDateTime(reservation.created_at) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onReservationClick(reservation)}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-3">
        {sortedReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
            onClick={() => onReservationClick(reservation)}
          >
            {/* Header: Título e Status */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex-1 pr-2 break-words">
                {reservation.title}
              </h3>
              <div className="flex items-center flex-shrink-0">
                {getStatusIcon(reservation.status)}
                <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>

            {/* Descrição se houver */}
            {reservation.description && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 break-words">
                  {reservation.description}
                </p>
              </div>
            )}

            {/* Informações principais */}
            <div className="space-y-1.5 mb-2">
              {/* Sala */}
              <div className="flex items-start gap-2">
                <DoorClosed className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500">Sala: </span>
                  <span className="text-xs font-medium text-gray-900 break-words">
                    {reservation.room_name}
                  </span>
                  {reservation.room_location && (
                    <span className="text-xs text-gray-500 block break-words">
                      {reservation.room_location}
                    </span>
                  )}
                </div>
              </div>

              {/* Data/Hora */}
              <div className="flex items-start gap-2">
                <Clock className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500">Data/Hora: </span>
                  <span className="text-xs text-gray-900">
                    {new Date(reservation.start_time).toLocaleDateString('pt-BR')} - 
                    {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} até 
                    {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
              </div>

              {/* Criado em */}
              {reservation.created_at && (
                <div className="flex items-start gap-2">
                  <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500">Criado em: </span>
                    <span className="text-xs text-gray-900">
                      {formatBrazilDateTime(reservation.created_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReservationClick(reservation);
                }}
                className="flex items-center justify-center focus:outline-none"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#E3E5E8",
                  borderRadius: "5px",
                  padding: "6px",
                }}
                title="Ver detalhes"
              >
                <Eye size={14} style={{ color: "#1E2024" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReservationsTable;
