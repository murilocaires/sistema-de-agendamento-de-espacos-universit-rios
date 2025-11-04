import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, isDateInPast, getBrazilNow, formatBrazilDate } from '../utils/dateUtils';

const DateInput = ({ value, onChange, error, min, max }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(getBrazilNow());
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (open) setViewDate(getBrazilNow());
  }, [open]);

  const days = getDaysInMonth(viewDate);
  const prevMonth = () => setViewDate(d => { const nd = new Date(d); nd.setMonth(d.getMonth() - 1); return nd; });
  const nextMonth = () => setViewDate(d => { const nd = new Date(d); nd.setMonth(d.getMonth() + 1); return nd; });

  return (
    <div className="relative w-full md:w-36" ref={ref}>
      <style>{`
        .no-calendar { appearance: none; -moz-appearance: textfield; }
        .no-calendar::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
        .no-calendar::-webkit-inner-spin-button, .no-calendar::-webkit-clear-button { display: none; }
        .no-calendar::-ms-clear { display: none; }
      `}</style>

      <div className={`relative flex items-center border rounded ${error ? 'border-red-500' : 'border-[#E3E5E8]'} bg-white w-full`}>
        <input
          type="date"
          name="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setOpen(v => !v)}
          placeholder="Selecione a data"
          min={min}
          max={max}
          className="no-calendar w-full py-2 px-3 pr-10 text-sm bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Abrir calendário"
        >
          <Calendar size={18} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 mt-2 z-50 w-full md:w-72 max-h-64 overflow-auto bg-white border border-[#E3E5E8] rounded shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-800">
              {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 focus:outline-none"><ChevronLeft size={14} /></button>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 focus:outline-none"><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
            {['D','S','T','Q','Q','S','S'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const dayString = day.date.toISOString().split('T')[0];
              const isSelected = value && value === dayString;
              const disabled = isDateInPast(dayString);
              return (
                <button
                  key={idx}
                  onClick={() => { if (!disabled) { onChange(dayString); setOpen(false); } }}
                  disabled={disabled}
                  className={`text-center p-1 rounded text-xs font-medium focus:outline-none ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'} ${isSelected ? 'bg-blue-600 text-white' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput;
