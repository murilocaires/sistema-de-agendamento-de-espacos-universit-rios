import React from "react";
import { Clock, MapPin, User } from "lucide-react";
import moment from "moment";

const TodayReservations = ({ todayReservations, onReservationClick, selectedDate }) => {
    // Formatar hora para exibição
    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    // Determinar o título baseado na data selecionada
    const getTitle = () => {
        if (!selectedDate) return "Reservas de Hoje";
        
        const today = moment();
        const selected = moment(selectedDate);
        
        if (selected.isSame(today, 'day')) {
            return "Reservas de Hoje";
        } else if (selected.isSame(today.clone().add(1, 'day'), 'day')) {
            return "Reservas de Amanhã";
        } else if (selected.isSame(today.clone().subtract(1, 'day'), 'day')) {
            return "Reservas de Ontem";
        } else {
            return `Reservas de ${selected.format('DD/MM/YYYY')}`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border p-4 py-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Clock size={18} />
                {getTitle()}
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayReservations.length > 0 ? (
                    todayReservations.map(event => (
                        <div
                            key={event.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 hover:shadow-lg cursor-pointer transition-all duration-200 ease-in-out"
                            onClick={() => onReservationClick(event)}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-gray-800 text-sm">
                                    {event.title}
                                </div>
                                {event.resource?.reservation?.is_recurrence_instance && (
                                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        Recorrente
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-700 flex items-center gap-1 mt-1">
                                <Clock size={12} />
                                {formatTime(event.start)} - {formatTime(event.end)}
                                <MapPin size={12} />
                                {event.resource.room}
                            </div>

                            <div className="text-xs text-gray-700 flex items-center gap-1">
                                <User size={12} />
                                {event.resource?.user}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-700 text-sm text-center py-4">
                        {selectedDate && moment(selectedDate).isSame(moment(), 'day') 
                            ? "Nenhuma reserva para hoje"
                            : selectedDate && moment(selectedDate).isSame(moment().add(1, 'day'), 'day')
                            ? "Nenhuma reserva para amanhã"
                            : selectedDate && moment(selectedDate).isSame(moment().subtract(1, 'day'), 'day')
                            ? "Nenhuma reserva para ontem"
                            : selectedDate 
                            ? `Nenhuma reserva para ${moment(selectedDate).format('DD/MM/YYYY')}`
                            : "Nenhuma reserva para hoje"
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default TodayReservations;
