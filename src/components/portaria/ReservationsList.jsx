import React from "react";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

const ReservationsList = ({ 
    reservations, 
    onReservationClick, 
    currentPage, 
    onPageChange, 
    totalPages,
    loading = false 
}) => {
    // Formatar hora para exibição
    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    // Formatar data para exibição
    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    // Agrupar reservas por data
    const groupedReservations = reservations.reduce((groups, reservation) => {
        const date = moment(reservation.start_time).format('YYYY-MM-DD');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(reservation);
        return groups;
    }, {});

    // Ordenar datas
    const sortedDates = Object.keys(groupedReservations).sort();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow border p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-800">Carregando reservas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow border">
            {/* Header */}
            <div className="py-3 px-6 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Lista de Reservas
                        </h2>
                        <p className="text-gray-800 text-sm mt-0">
                            {reservations.length} reserva(s) encontrada(s)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-800">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Reservas */}
            <div className="max-h-[600px] overflow-y-auto">
                {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                        <div key={date} className="border-b last:border-b-0">
                            {/* Cabeçalho da Data */}
                            <div className="bg-gray-50 px-6 py-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-blue-500" size={16} />
                                    <h3 className="font-semibold text-gray-800">
                                        {moment(date).format('dddd, DD [de] MMMM [de] YYYY')}
                                    </h3>
                                    <span className="text-sm text-gray-800">
                                        [{groupedReservations[date].length} reserva(s)]
                                    </span>
                                </div>
                            </div>

                            {/* Reservas do Dia */}
                            <div className="px-6 py-3">
                                <div className="grid gap-2">
                                    {groupedReservations[date]
                                        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                                        .map(reservation => (
                                            <div
                                                key={reservation.id}
                                                className="px-4 py-3 border rounded-lg hover:bg-gray-50 hover:shadow-lg hover:scale-[1.005] cursor-pointer transition-all duration-200 ease-in-out"
                                                onClick={() => onReservationClick({
                                                    id: reservation.id,
                                                    title: reservation.title,
                                                    start: new Date(reservation.start_time),
                                                    end: new Date(reservation.end_time),
                                                    resource: {
                                                        user: reservation.user_name || 'Usuário',
                                                        room: reservation.room_name || 'Sala não encontrada',
                                                        room_id: reservation.room_id,
                                                        description: reservation.description,
                                                        reservation: reservation
                                                    }
                                                })}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="font-semibold text-gray-800">
                                                                {reservation.title}
                                                            </h4>
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                {reservation.status === 'approved' ? 'Aprovada' : reservation.status}
                                                            </span>
                                                            {reservation.is_recurrence_instance && (
                                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                    Recorrente
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-800">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} />
                                                                <span>
                                                                    {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={14} />
                                                                <span>
                                                                    {reservation.room_name} - {reservation.room_location}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <User size={14} />
                                                                <span>{reservation.user_name}</span>
                                                            </div>
                                                        </div>

                                                        {reservation.description && (
                                                            <div className="mt-2 text-xs text-gray-800">
                                                                <p className="line-clamp-2">{reservation.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="ml-4 text-right">
                                                        <div className="text-xs text-gray-700">
                                                            Criada em {formatDate(reservation.created_at)}
                                                        </div>
                                                        {reservation.approved_at && (
                                                            <div className="text-xs text-green-600">
                                                                Aprovada em {formatDate(reservation.approved_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Nenhuma reserva encontrada
                        </h3>
                        <p className="text-gray-800">
                            Não há reservas para exibir com os filtros atuais.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsList;
