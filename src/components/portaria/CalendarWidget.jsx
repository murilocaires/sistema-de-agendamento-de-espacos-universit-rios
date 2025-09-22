import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

const CalendarWidget = ({ 
    currentMonth, 
    onNavigateMonth, 
    selectedDate, 
    onSelectDate, 
    daysWithReservations, 
    reservationsPerDay 
}) => {
    // Gerar dias do calendário pequeno
    const generateCalendarDays = () => {
        const startOfMonth = moment(currentMonth).startOf('month');
        const endOfMonth = moment(currentMonth).endOf('month');
        const startDate = moment(startOfMonth).startOf('week');
        const endDate = moment(endOfMonth).endOf('week');

        const days = [];
        const current = moment(startDate);

        while (current.isSameOrBefore(endDate)) {
            days.push(moment(current));
            current.add(1, 'day');
        }

        return days;
    };

    // Renderizar bolinhas de reservas (máximo 4)
    const renderReservationDots = (dayStr) => {
        const count = reservationsPerDay.get(dayStr) || 0;
        if (count === 0) return null;

        const maxDots = Math.min(count, 4);
        const dots = [];
        
        // Determinar se o dia é hoje, passado ou futuro
        const dayMoment = moment(dayStr);
        const today = moment();
        const isToday = dayMoment.isSame(today, 'day');
        const isPast = dayMoment.isBefore(today, 'day');
        
        // Cor das bolinhas: verde para hoje/futuro, cinza para passado
        const dotColor = isPast ? 'bg-gray-400' : 'bg-green-500';
        
        for (let i = 0; i < maxDots; i++) {
            dots.push(
                <div
                    key={i}
                    className={`w-1.5 h-1.5 ${dotColor} rounded-full`}
                    style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: `${2 + (i * 4)}px`
                    }}
                />
            );
        }
        
        return dots;
    };

    return (
        <div className="bg-white rounded-lg shadow border p-4 pb-2">
            <div className="flex items-center justify-between mb-0">
                <h3 className="text-lg font-semibold text-gray-800">
                    {moment(currentMonth).format('MMMM YYYY')}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => onNavigateMonth(-1)}
                        className="p-1 hover:bg-gray-100/10 rounded"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => onNavigateMonth(1)}
                        className="p-1 hover:bg-gray-100/10 rounded"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                    <div key={`day-${index}`} className="text-xs font-medium text-gray-800 py-2 pb-0">
                        {day}
                    </div>
                ))}
                
                {generateCalendarDays().map(day => {
                    const dayStr = day.format('YYYY-MM-DD');
                    const hasReservations = daysWithReservations.has(dayStr);
                    const isToday = day.isSame(moment(), 'day');
                    const isSelected = day.isSame(selectedDate, 'day');
                    const isCurrentMonth = day.isSame(currentMonth, 'month');

                    return (
                        <button
                            key={dayStr}
                            onClick={() => onSelectDate(day)}
                            className={`
                            relative p-2 text-xs rounded hover:bg-blue-300 transition-colors
                            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                            ${isToday ? 'bg-gray-500 text-blue-800 font-semibold' : ''}
                            ${isSelected ? 'bg-blue-700 text-white' : ''}
                            `}
                        >
                            {day.format('D')}
                            {hasReservations && renderReservationDots(dayStr)}
                        </button>
                    );
                })}
            </div>
            
            {/* Legenda das bolinhas */}
            <div className="mt-2 pt-2 border-t border-gray-500">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Hoje/Futuro</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-700">Passado</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
