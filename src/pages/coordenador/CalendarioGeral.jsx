import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
getReservations,
getRooms 
} from "../../services/authService";
import { 
Calendar as CalendarIcon,
Search,
MapPin,
Clock,
User,
ChevronLeft,
ChevronRight,
AlertCircle,
CheckCircle,
X
} from "lucide-react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import '../../components/Calendar.css';

// Configurar moment para português
moment.locale('pt-br', {
months: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
],
monthsShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
],
weekdays: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
],
weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
});

const localizer = momentLocalizer(moment);

const CalendarioGeral = () => {
const { user } = useAuth();
const userType = user?.role || "admin";
const menuItems = getUserMenu(userType);
const userTypeDisplay = getUserTypeDisplay(userType);

// Estados
const [reservations, setReservations] = useState([]);
const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");

// Estados do calendário
const [selectedDate, setSelectedDate] = useState(new Date());
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedRoom, setSelectedRoom] = useState('');
const [searchTerm, setSearchTerm] = useState('');

// Estados dos dados filtrados
const [calendarEvents, setCalendarEvents] = useState([]);
const [todayReservations, setTodayReservations] = useState([]);
const [daysWithReservations, setDaysWithReservations] = useState(new Set());
const [reservationsPerDay, setReservationsPerDay] = useState(new Map());

// Carregar dados iniciais
const loadData = async () => {
    try {
    setLoading(true);
    setError("");
    
    const [reservationsData, roomsData] = await Promise.all([
        getReservations({ status: 'approved' }),
        getRooms()
    ]);
    
    setReservations(reservationsData || []);
    setRooms(roomsData || []);
    
    } catch (err) {
    console.error("Erro ao carregar dados:", err);
    setError("Erro ao carregar dados: " + (err.message || "Erro desconhecido"));
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    loadData();
}, []);

// Processar dados quando reservations ou selectedRoom mudam
useEffect(() => {
    if (reservations.length > 0) {
    processReservationData();
    }
}, [reservations, selectedRoom, selectedDate, currentMonth]);

// Função para expandir reservas recorrentes simples
const expandRecurringReservations = (reservation) => {
    console.log('Verificando reserva:', {
        title: reservation.title,
        is_recurring: reservation.is_recurring,
        recurrence_end_date: reservation.recurrence_end_date,
        start_time: reservation.start_time
    });

    if (!reservation.is_recurring || !reservation.recurrence_end_date) {
        console.log('Reserva não é recorrente, retornando original');
        return [reservation];
    }

    const occurrences = [];
    const startDate = moment(reservation.start_time);
    const endDate = moment(reservation.recurrence_end_date);
    const startTime = moment(reservation.start_time).format('HH:mm');
    const endTime = moment(reservation.end_time).format('HH:mm');

    console.log(`Expandindo reserva "${reservation.title}":`, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        startTime,
        endTime
    });

    // Para reservas semanais simples, gerar uma ocorrência por semana
    let currentDate = moment(startDate);
    let weekCount = 0;
    const maxWeeks = 52; // Limite de 1 ano

    while (currentDate.isSameOrBefore(endDate) && weekCount < maxWeeks) {
        const occurrenceStart = moment(currentDate).set({
            hour: moment(startTime, 'HH:mm').hour(),
            minute: moment(startTime, 'HH:mm').minute(),
            second: 0,
            millisecond: 0
        });
        
        const occurrenceEnd = moment(currentDate).set({
            hour: moment(endTime, 'HH:mm').hour(),
            minute: moment(endTime, 'HH:mm').minute(),
            second: 0,
            millisecond: 0
        });

        occurrences.push({
            ...reservation,
            id: `${reservation.id}_${currentDate.format('YYYY-MM-DD')}`,
            start_time: occurrenceStart.toISOString(),
            end_time: occurrenceEnd.toISOString(),
            is_recurrence_instance: true,
            original_reservation_id: reservation.id
        });

        currentDate.add(1, 'week');
        weekCount++;
    }

    console.log(`Reserva "${reservation.title}" expandida em ${occurrences.length} ocorrências`);
    return occurrences.length > 0 ? occurrences : [reservation];
};

// Processar dados das reservas
const processReservationData = () => {
    console.log('Processando dados das reservas...', reservations.length);
    
    let approvedReservations = reservations.filter(reservation => 
        reservation.status === 'approved'
    );

    console.log('Reservas aprovadas:', approvedReservations.length);

    // Expandir reservas recorrentes
    let expandedReservations = [];
    approvedReservations.forEach(reservation => {
        const occurrences = expandRecurringReservations(reservation);
        expandedReservations.push(...occurrences);
        
        // Log para debug
        if (reservation.is_recurring) {
            console.log(`Reserva recorrente "${reservation.title}": ${occurrences.length} ocorrências geradas`);
        }
    });

    console.log('Reservas expandidas:', expandedReservations.length);

    // Filtrar por sala se selecionada
    if (selectedRoom) {
        expandedReservations = expandedReservations.filter(
            reservation => reservation.room_id.toString() === selectedRoom
        );
    }

    // Converter para eventos do calendário
    const events = expandedReservations.map(reservation => {
        const room = rooms.find(r => r.id === reservation.room_id);
        return {
            id: reservation.id,
            title: reservation.title,
            start: new Date(reservation.start_time),
            end: new Date(reservation.end_time),
            resource: {
                user: reservation.user_name || 'Usuário',
                room: room?.name || 'Sala não encontrada',
                room_id: reservation.room_id,
                description: reservation.description,
                reservation: reservation
            }
        };
    });

    setCalendarEvents(events);

    // Reservas de hoje
    const today = moment().format('YYYY-MM-DD');
    const todayEvents = events.filter(event => 
        moment(event.start).format('YYYY-MM-DD') === today
    );
    setTodayReservations(todayEvents);

    // Dias com reservas no mês atual e contagem por dia
    const daysSet = new Set();
    const dayCountMap = new Map();
    
    events.forEach(event => {
        const eventDate = moment(event.start).format('YYYY-MM-DD');
        
        if (moment(event.start).isSame(currentMonth, 'month')) {
            daysSet.add(eventDate);
        }
        
        // Contar reservas por dia (para todo o período, não só o mês atual)
        const currentCount = dayCountMap.get(eventDate) || 0;
        dayCountMap.set(eventDate, currentCount + 1);
    });
    
    setDaysWithReservations(daysSet);
    setReservationsPerDay(dayCountMap);
    
    console.log('Processamento concluído com sucesso');
};

// Filtrar salas por busca
const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
);

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

// Navegar mês anterior/próximo
const navigateMonth = (direction) => {
    const newMonth = moment(currentMonth).add(direction, 'month').toDate();
    setCurrentMonth(newMonth);
};

// Selecionar data e navegar calendário principal
const selectDate = (date) => {
    const selectedDateObj = date.toDate();
    setSelectedDate(selectedDateObj);
    
    // Navegar o calendário principal para a semana da data selecionada
    // O react-big-calendar irá automaticamente mostrar a semana que contém esta data
};

// Abrir sala específica no calendário
const openRoomCalendar = (roomId) => {
    setSelectedRoom(roomId.toString());
};

// Formatar hora para exibição
const formatTime = (date) => {
    return moment(date).format('HH:mm');
};

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
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
    <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">
            Calendário Geral
            </h1>
            <p className="text-gray-700">
            Visualização completa de todas as reservas confirmadas
            </p>
        </div>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <AlertCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{error}</span>
                <button
                    onClick={() => setError("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
        <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20' : 'top-4'
        }`}>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <CheckCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {loading ? (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-800">Carregando calendário...</p>
        </div>
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Coluna Esquerda - Calendário Pequeno e Reservas de Hoje */}
            <div className="xl:col-span-1 space-y-6">
            {/* Calendário Pequeno */}
            <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {moment(currentMonth).format('MMMM YYYY')}
                </h3>
                <div className="flex gap-1">
                    <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                    >
                    <ChevronLeft size={16} />
                    </button>
                    <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                    >
                    <ChevronRight size={16} />
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                    <div key={`day-${index}`} className="text-xs font-medium text-gray-800 py-2">
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
                        onClick={() => selectDate(day)}
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
            </div>

            {/* Reservas de Hoje */}
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
                        onClick={() => openRoomCalendar(event.resource.room_id)}
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
            </div>

            {/* Coluna Direita - Calendário Principal */}
            <div className="xl:col-span-3">
            {/* Filtros */}
            <div className="bg-white rounded-lg shadow border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                {/* Busca por Sala */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar Sala
                    </label>
                    <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Nome ou localização da sala..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    </div>
                </div>

                {/* Seletor de Sala */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Sala
                    </label>
                    <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                    <option value="">Todas as salas</option>
                    {filteredRooms.map(room => (
                        <option key={room.id} value={room.id}>
                        {room.name} - {room.location}
                        </option>
                    ))}
                    </select>
                </div>
                </div>
            </div>

            {/* Calendário Principal */}
            <div className="bg-white rounded-lg shadow border p-4">
                <div className="calendar-container" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="week"
                    views={['week']}
                    date={selectedDate}
                    onNavigate={(newDate) => setSelectedDate(newDate)}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 7, 0, 0)} // 7:00 AM
                    max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
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
                        backgroundColor: '#3b82f6',
                        borderColor: '#1d4ed8',
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '4px'
                        }
                    })}
                    components={{
                        event: ({ event }) => (
                        <div className="text-xs">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="opacity-90 truncate">{event.resource?.room}</div>
                            <div className="opacity-80 truncate">{event.resource?.user}</div>
                        </div>
                        )
                    }}
                    onSelectEvent={(event) => {
                    openRoomCalendar(event.resource.room_id);
                    }}
                />
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
    </DashboardLayout>
);
};

export default CalendarioGeral;
