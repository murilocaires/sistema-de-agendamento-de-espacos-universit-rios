import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { formatTime } from '../utils/calendarUtils';

export const TodayReservations = ({ 
    todayReservations, 
    onRoomClick 
}) => {
    return (
        <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} />
                Reservas de Hoje
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayReservations.length > 0 ? (
                    todayReservations.map(event => (
                        <div
                            key={event.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => onRoomClick(event.resource.room_id)}
                        >
                            <div className="font-medium text-gray-800 text-sm">
                                {event.title}
                            </div>
                            <div className="text-xs text-gray-700 flex items-center gap-1 mt-1">
                                <Clock size={12} />
                                {formatTime(event.start)} - {formatTime(event.end)}
                            </div>
                            <div className="text-xs text-gray-700 flex items-center gap-1">
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
                        Nenhuma reserva para hoje
                    </p>
                )}
            </div>
        </div>
    );
};

