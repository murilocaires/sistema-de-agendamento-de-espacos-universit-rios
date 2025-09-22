import React from "react";
import { X, Calendar as CalendarIcon, Clock, MapPin, User, Eye } from "lucide-react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import '../../components/Calendar.css';

const localizer = momentLocalizer(moment);

const ReservationModal = ({ 
    showModal, 
    selectedReservation, 
    modalCalendarEvents, 
    onClose 
}) => {
    if (!showModal || !selectedReservation) return null;

    // Formatar hora para exibição
    const formatTime = (date) => {
        return moment(date).format('HH:mm');
    };

    // Formatar data para exibição
    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-6 py-3 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Detalhes da Reserva
                        </h2>
                        <p className="text-gray-700 text-sm">
                            {selectedReservation.room?.name} - {selectedReservation.room?.location}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Informações da Reserva */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Informações da Reserva
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="text-blue-500" size={18} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Título</p>
                                        <p className="text-gray-900">{selectedReservation.title}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="text-green-500" size={18} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Data e Horário</p>
                                        <p className="text-gray-900">
                                            {formatDate(selectedReservation.start_time)} - 
                                            {formatTime(selectedReservation.start_time)} às {formatTime(selectedReservation.end_time)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="text-purple-500" size={18} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Sala</p>
                                        <p className="text-gray-900">
                                            {selectedReservation.room?.name} - {selectedReservation.room?.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <User className="text-orange-500" size={18} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Responsável</p>
                                        <p className="text-gray-900">{selectedReservation.user_name}</p>
                                    </div>
                                </div>

                                {selectedReservation.description && (
                                    <div className="flex items-start gap-3">
                                        <Eye className="text-gray-500 mt-1" size={18} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Descrição</p>
                                            <p className="text-gray-900">{selectedReservation.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Calendário da Sala */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Calendário da Sala
                            </h3>
                            <div className="calendar-container" style={{ height: '400px' }}>
                                <Calendar
                                    localizer={localizer}
                                    events={modalCalendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    defaultView="week"
                                    views={['week']}
                                    date={new Date(selectedReservation.start_time)}
                                    step={30}
                                    timeslots={2}
                                    min={new Date(0, 0, 0, 7, 0, 0)}
                                    max={new Date(0, 0, 0, 22, 0, 0)}
                                    messages={{
                                        next: "Próxima",
                                        previous: "Anterior",
                                        today: "Hoje",
                                        month: "Mês",
                                        week: "Semana",
                                        day: "Dia",
                                        agenda: "Agenda",
                                        date: "Data",
                                        time: "Hora",
                                        event: "Evento",
                                        noEventsInRange: "Não há reservas neste período",
                                        showMore: (total) => `+${total} mais`
                                    }}
                                    formats={{
                                        timeGutterFormat: 'HH:mm',
                                        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                                            localizer.format(start, 'HH:mm', culture) + ' - ' + 
                                            localizer.format(end, 'HH:mm', culture),
                                        dayFormat: 'ddd DD/MM',
                                        dayHeaderFormat: 'ddd DD/MM',
                                        dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                                            localizer.format(start, 'DD/MM', culture) + ' - ' + 
                                            localizer.format(end, 'DD/MM', culture),
                                        weekdayFormat: 'ddd'
                                    }}
                                    eventPropGetter={(event) => ({
                                        style: {
                                            backgroundColor: event.id === selectedReservation.id ? '#ef4444' : '#3b82f6',
                                            borderColor: event.id === selectedReservation.id ? '#dc2626' : '#1d4ed8',
                                            color: 'white',
                                            fontSize: '12px',
                                            borderRadius: '4px'
                                        }
                                    })}
                                    components={{
                                        event: ({ event }) => (
                                            <div className="text-xs">
                                                <div className="font-medium truncate">{event.title}</div>
                                                <div className="opacity-90 truncate">{event.resource?.user}</div>
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer do Modal */}
                <div className="flex justify-end p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;
