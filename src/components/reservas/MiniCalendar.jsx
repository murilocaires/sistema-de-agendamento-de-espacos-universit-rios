import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isSameDate, getBrazilNow } from "../../utils/dateUtils";

const MiniCalendar = ({
  currentDate,
  formData,
  onNavigateCalendar,
  onDateSelect,
  getRecurringDays
}) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Adicionar dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = prevMonthDays - i;
      days.push({
        date: new Date(year, month - 1, dayNumber),
        isCurrentMonth: false
      });
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const recurringDays = getRecurringDays();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">
          {currentDate.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric',
            timeZone: 'America/Sao_Paulo'
          })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => onNavigateCalendar(-1)}
            className="p-1 rounded focus:outline-none transition-transform hover:scale-130"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onNavigateCalendar(1)}
            className="p-1 rounded focus:outline-none transition-transform hover:scale-130"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-gray-500 p-1 font-medium text-xs">
            {day}
          </div>
        ))}
        
        {getDaysInMonth(currentDate).map((day, index) => {
          const isToday = isSameDate(day.date, getBrazilNow());
          const dayString = day.date.toISOString().split('T')[0];
          const isSelected = formData.date && dayString === formData.date;
          const isRecurring = recurringDays.includes(dayString);
          
          // Para recorrência diária, verificar se é primeiro, último ou intermediário
          let recurringStyle = '';
          if (isRecurring && !isSelected && formData.is_recurring && formData.recurrence_frequency === 'daily') {
            const isFirstDay = dayString === formData.date;
            const isLastDay = dayString === formData.recurrence_end_date;
            const isMiddleDay = !isFirstDay && !isLastDay;
            
            if (isFirstDay || isLastDay) {
              recurringStyle = 'bg-blue-600 text-white hover:bg-blue-600';
            } else if (isMiddleDay) {
              recurringStyle = 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            }
          } else if (isRecurring && !isSelected) {
            recurringStyle = 'bg-blue-600 text-white hover:bg-blue-600';
          }
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(dayString)}
              disabled={false}
              className={`text-center p-1 rounded text-xs font-medium focus:outline-none ${
                !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } ${isToday ? 'border-2 border-blue-600' : ''} ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-600' : ''} ${recurringStyle} ${!isSelected && !isRecurring && day.isCurrentMonth ? 'hover:bg-blue-100' : ''}`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;

