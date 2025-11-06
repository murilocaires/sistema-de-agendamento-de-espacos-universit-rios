import React from 'react';
import { Calendar } from 'lucide-react';
import { Calendar as BigCalendar } from 'react-big-calendar';
import { localizer, calendarMessages, calendarFormats } from '../config/calendarConfig';

export const ReservationCalendar = ({ 
    events, 
    calendarDate, 
    onNavigate, 
    selectedRoom 
}) => {
    return (
        <div className="bg-white rounded-lg shadow border p-4 max-h-[calc(100vh-12rem)] overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                    {selectedRoom ? `Agenda da Sala - ${selectedRoom.name}` : 'Calendário Geral - Todas as Salas'}
                </h3>
            </div>
            
            <div style={{ height: 'calc(100vh - 18rem)' }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    date={calendarDate}
                    onNavigate={onNavigate}
                    defaultView="week"
                    views={['week']}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 7, 0, 0)} // 7:00 AM
                    max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                    messages={calendarMessages}
                    formats={calendarFormats}
                    eventPropGetter={(event) => {
                        // Se for evento de preview, usar cor laranja
                        if (event.resource?.isPreview) {
                            return {
                                style: {
                                    backgroundColor: '#f97316',
                                    borderColor: '#ea580c',
                                    color: 'white',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    opacity: 0.8,
                                    borderStyle: 'dashed'
                                }
                            };
                        }
                        // Eventos normais (azul)
                        return {
                            style: {
                                backgroundColor: '#3b82f6',
                                borderColor: '#1d4ed8',
                                color: 'white',
                                fontSize: '12px',
                                borderRadius: '4px'
                            }
                        };
                    }}
                    components={{
                        event: ({ event }) => (
                            <div className="text-xs">
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="opacity-90">{event.resource?.user}</div>
                            </div>
                        )
                    }}
                />
            </div>
            
            <div className="mt-3 text-sm text-gray-700">
                {selectedRoom ? (
                    <div className="mt-2 text-gray-700">
                        Mostrando reservas da sala: <strong>{selectedRoom.name}</strong>
                    </div>
                ) : (
                    <div className="mt-2 text-gray-700 italic">
                        Mostrando todas as reservas. Selecione uma sala no formulário para filtrar.
                    </div>
                )}
            </div>
        </div>
    );
};

