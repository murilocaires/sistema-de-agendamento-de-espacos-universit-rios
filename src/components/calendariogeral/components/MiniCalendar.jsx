import React from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateCalendarDays } from '../utils/calendarUtils';

export const MiniCalendar = ({
    currentMonth,
    selectedDate,
    daysWithReservations,
    reservationsPerDay,
    onNavigateMonth,
    onSelectDate
}) => {
    // Renderizar bolinhas de reservas (máximo 4)
    const renderReservationDots = (dayStr) => {
        const count = reservationsPerDay.get(dayStr) || 0;
        if (count === 0) return null;

        const maxDots = Math.min(count, 4);
        const dots = [];
        
        for (let i = 0; i < maxDots; i++) {
            dots.push(
                <div
                    key={i}
                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
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
        <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center justify-between mb-4">
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
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-800 py-2">
                        {day}
                    </div>
                ))}
                
                {generateCalendarDays(currentMonth).map(day => {
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
                                ${isToday ? 'bg-gray-500/10 text-blue-800 font-semibold' : ''}
                                ${isSelected ? 'bg-blue-700 text-white' : ''}
                            `}
                        >
                            {day.format('D')}
                            {hasReservations && renderReservationDots(dayStr)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

