import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
getRooms,
getUsers,
createReservation,
getReservations
} from "../../services/authService";
import { 
CalendarPlus,
AlertCircle,
CheckCircle,
Clock,
MapPin,
Users as UsersIcon,
DoorClosed,
Repeat,
Calendar,
Save,
HelpCircle,
Info
} from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../components/Calendar.css';

// Configurar localização para português
moment.locale('pt-br', {
  weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
});
const localizer = momentLocalizer(moment);

// Componente de Tooltip simples
const Tooltip = ({ children, content }) => {
const [isVisible, setIsVisible] = useState(false);

return (
    <div className="relative inline-block">
    <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
    >
        {children}
    </div>
    {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -top-2 transform -translate-y-full left-1/2 -translate-x-1/2 w-64 whitespace-normal">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
    )}
    </div>
);
};

const NewReservation = () => {
const { user } = useAuth();
const userType = user?.role || "admin";
const menuItems = getUserMenu(userType);
const userTypeDisplay = getUserTypeDisplay(userType);

// Estados
const [rooms, setRooms] = useState([]);
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [formLoading, setFormLoading] = useState(false);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [roomReservations, setRoomReservations] = useState([]);
const [selectedRoom, setSelectedRoom] = useState(null);

const [formData, setFormData] = useState({
    user_id: user?.id || "",
    room_id: "",
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    is_recurring: false,
    recurrence_type: "weekly",
    recurrence_end_date: "",
    recurrence_days: [],
    recurrence_interval: 1,
    weekly_schedules: {}, // Para horários específicos por dia da semana
    priority: 1
});

// Carregar dados iniciais
useEffect(() => {
    const loadData = async () => {
    try {
        setLoading(true);
        const [roomsData, usersData] = await Promise.all([
        getRooms(),
        getUsers()
        ]);
        
        setRooms(roomsData.filter(room => room.is_active));
        setUsers(usersData);
        setError("");
    } catch (err) {
        setError("Erro ao carregar dados: " + err.message);
    } finally {
        setLoading(false);
    }
    };

    loadData();
}, []);

// Função para expandir reservas recorrentes
const expandRecurringReservation = (reservation) => {
    if (!reservation.is_recurring) {
        return [{
            id: reservation.id,
            title: reservation.title,
            start: new Date(reservation.start_time),
            end: new Date(reservation.end_time),
            resource: {
                user: reservation.user_name,
                status: reservation.status,
                description: reservation.description
            }
        }];
    }

    const events = [];
    const startDate = new Date(reservation.start_time);
    const endDate = new Date(reservation.recurrence_end_date);
    
    // Tentar extrair dados da descrição
    let recurrenceDays = [];
    let weeklySchedules = {};
    
    try {
        const descMatch = reservation.description?.match(/• Dias da semana: \[([^\]]+)\]/);
        if (descMatch) {
            recurrenceDays = descMatch[1].split(', ').map(d => d.trim());
        }
        
        const scheduleMatch = reservation.description?.match(/• Horários: ({.*})/);
        if (scheduleMatch) {
            weeklySchedules = JSON.parse(scheduleMatch[1]);
        }
    } catch (e) {
        console.warn('Erro ao parsear dados de recorrência:', e);
        // Fallback: usar dados da reserva original
        recurrenceDays = [startDate.getDay().toString()];
        const startTime = startDate.toTimeString().slice(0, 5);
        const endTime = new Date(reservation.end_time).toTimeString().slice(0, 5);
        weeklySchedules[startDate.getDay().toString()] = {
            start_time: startTime,
            end_time: endTime
        };
    }

    // Gerar todas as ocorrências
    const currentDate = new Date(startDate);
    let weekCount = 0;
    
    while (currentDate <= endDate && weekCount < 200) { // Limite de segurança
        for (const dayOfWeek of recurrenceDays) {
            const daySchedule = weeklySchedules[dayOfWeek];
            if (!daySchedule) continue;
            
            // Calcular a data para este dia da semana
            const targetDate = new Date(currentDate);
            const currentDayOfWeek = targetDate.getDay();
            const targetDayOfWeek = parseInt(dayOfWeek);
            const daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
            targetDate.setDate(targetDate.getDate() + daysToAdd);
            
            // Verificar se a data está dentro do período
            if (targetDate >= startDate && targetDate <= endDate) {
                const eventStart = new Date(targetDate);
                const eventEnd = new Date(targetDate);
                
                // Definir horários
                const [startHour, startMin] = daySchedule.start_time.split(':');
                const [endHour, endMin] = daySchedule.end_time.split(':');
                
                eventStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
                eventEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
                
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                
                events.push({
                    id: `${reservation.id}-${targetDate.toISOString().split('T')[0]}-${dayOfWeek}`,
                    title: `${reservation.title} (${dayNames[targetDayOfWeek]})`,
                    start: eventStart,
                    end: eventEnd,
                    resource: {
                        user: reservation.user_name,
                        status: reservation.status,
                        description: reservation.description,
                        isRecurring: true,
                        originalId: reservation.id
                    }
                });
            }
        }
        
        // Avançar para a próxima semana
        currentDate.setDate(currentDate.getDate() + 7);
        weekCount++;
    }

    return events;
};

// Carregar reservas da sala selecionada
const loadRoomReservations = async (roomId) => {
    if (!roomId) {
        setRoomReservations([]);
        setSelectedRoom(null);
        return;
    }

    const room = rooms.find(r => r.id === parseInt(roomId));
    setSelectedRoom(room);

    try {
        const reservations = await getReservations({ room_id: roomId, status: 'approved' });
        
        // Expandir reservas recorrentes
        const expandedEvents = [];
        for (const reservation of reservations) {
            const events = expandRecurringReservation(reservation);
            expandedEvents.push(...events);
        }
        
        setRoomReservations(expandedEvents);
    } catch (err) {
        console.error('Erro ao carregar reservas da sala:', err);
        setRoomReservations([]);
    }
};

// Manipular mudanças no formulário
const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
    }));

    // Se mudou a sala, carregar reservas
    if (name === 'room_id') {
        await loadRoomReservations(value);
    }
};

// Validar conflitos com reservas existentes
const checkConflicts = () => {
    if (!formData.room_id) return null;
    
    const conflicts = [];
    
    // Gerar ocorrências da nova reserva
    let newOccurrences = [];
    
    if (formData.is_recurring) {
        // Para reservas recorrentes
        if (formData.recurrence_days.length === 0 || !formData.start_date || !formData.recurrence_end_date) {
            return null;
        }
        
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.recurrence_end_date);
        const currentDate = new Date(startDate);
        let weekCount = 0;
        
        while (currentDate <= endDate && weekCount < 50) { // Limite menor para performance
            for (const dayOfWeek of formData.recurrence_days) {
                const daySchedule = formData.weekly_schedules[dayOfWeek];
                if (!daySchedule || !daySchedule.start_time || !daySchedule.end_time) continue;
                
                const targetDate = new Date(currentDate);
                const currentDayOfWeek = targetDate.getDay();
                const targetDayOfWeek = parseInt(dayOfWeek);
                const daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
                targetDate.setDate(targetDate.getDate() + daysToAdd);
                
                if (targetDate >= startDate && targetDate <= endDate) {
                    const occurrenceStart = new Date(targetDate);
                    const occurrenceEnd = new Date(targetDate);
                    
                    const [startHour, startMin] = daySchedule.start_time.split(':');
                    const [endHour, endMin] = daySchedule.end_time.split(':');
                    
                    occurrenceStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
                    occurrenceEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
                    
                    newOccurrences.push({ start: occurrenceStart, end: occurrenceEnd });
                }
            }
            currentDate.setDate(currentDate.getDate() + 7);
            weekCount++;
        }
    } else {
        // Para reservas únicas
        if (!formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
            return null;
        }
        
        const start = new Date(`${formData.start_date}T${formData.start_time}`);
        const end = new Date(`${formData.end_date}T${formData.end_time}`);
        newOccurrences.push({ start, end });
    }
    
    // Verificar conflitos com reservas existentes no calendário
    for (const newOcc of newOccurrences) {
        for (const existingEvent of roomReservations) {
            const existingStart = new Date(existingEvent.start);
            const existingEnd = new Date(existingEvent.end);
            
            // Verificar sobreposição
            if (newOcc.start < existingEnd && existingStart < newOcc.end) {
                conflicts.push({
                    date: newOcc.start.toLocaleDateString('pt-BR'),
                    newTime: `${newOcc.start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${newOcc.end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`,
                    existingTitle: existingEvent.title,
                    existingTime: `${existingStart.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${existingEnd.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`
                });
            }
        }
    }
    
    return conflicts.length > 0 ? conflicts.slice(0, 5) : null; // Mostrar apenas os primeiros 5 conflitos
};

// Validar horários
const validateTimes = () => {
    // Se não for recorrente, usar validação normal
    if (!formData.is_recurring) {
        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
        const now = new Date();

        if (startDateTime <= now) {
            return "A data/hora de início deve ser no futuro";
        }

        if (endDateTime <= startDateTime) {
            return "A data/hora de fim deve ser posterior à data/hora de início";
        }

        // Verificar se não ultrapassa 24 horas
        const diffHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
            return "A reserva não pode ultrapassar 24 horas";
        }
    } else {
        // Para recorrência, validar horários por dia
        if (formData.recurrence_days.length === 0) {
            return "Selecione pelo menos um dia da semana para a recorrência";
        }

        for (const day of formData.recurrence_days) {
            const daySchedule = formData.weekly_schedules[day];
            if (!daySchedule || !daySchedule.start_time || !daySchedule.end_time) {
                const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                return `Defina os horários para ${dayNames[parseInt(day)]}`;
            }

            const startTime = daySchedule.start_time;
            const endTime = daySchedule.end_time;
            
            if (endTime <= startTime) {
                const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                return `O horário de fim deve ser posterior ao de início em ${dayNames[parseInt(day)]}`;
            }
        }

        if (!formData.recurrence_end_date) {
            return "Defina a data limite da recorrência";
        }
    }

    return null;
};

// Submeter formulário
const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccessMessage("");

    try {
    // Validações
    const timeError = validateTimes();
    if (timeError) {
        setError(timeError);
        return;
    }

    // Verificar conflitos
    const conflicts = checkConflicts();
    if (conflicts && conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => 
            `📅 ${c.date}: Sua reserva (${c.newTime}) conflita com "${c.existingTitle}" (${c.existingTime})`
        ).join('\n');
        
        setError(`⚠️ Conflitos de horário detectados:\n\n${conflictMessages}\n\nEscolha outros horários ou sala.`);
        return;
    }

    // Preparar dados da reserva
    let reservationData;

    if (formData.is_recurring) {
        // Para reservas recorrentes, criar uma única reserva com informações completas na descrição
        const firstDay = formData.recurrence_days[0];
        const firstSchedule = formData.weekly_schedules[firstDay];
        
        if (!firstSchedule || !firstSchedule.start_time || !firstSchedule.end_time) {
            setError("Erro: Horário não definido para o primeiro dia selecionado");
            return;
        }

        // Usar a data de início e horários do primeiro dia como referência
        const startDateTime = `${formData.start_date}T${firstSchedule.start_time}:00`;
        const endDateTime = `${formData.start_date}T${firstSchedule.end_time}:00`;

        // Criar descrição detalhada com todos os horários
        const scheduleDetails = formData.recurrence_days.map(day => {
            const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            const schedule = formData.weekly_schedules[day];
            return `• ${dayNames[parseInt(day)]}: ${schedule?.start_time} às ${schedule?.end_time}`;
        }).join('\n');

        const fullDescription = `${formData.description.trim()}\n\n🔄 RESERVA RECORRENTE\n\n📅 Período: ${formData.start_date} até ${formData.recurrence_end_date}\n📚 Tipo: ${formData.recurrence_type === 'weekly' ? 'Semanal' : formData.recurrence_type}\n⏰ Horários por semana:\n${scheduleDetails}\n\n📊 Dados técnicos:\n• Dias da semana: [${formData.recurrence_days.join(', ')}]\n• Intervalo: A cada ${formData.recurrence_interval} semana(s)\n• Horários: ${JSON.stringify(formData.weekly_schedules)}`;

        reservationData = {
            user_id: parseInt(formData.user_id),
            room_id: parseInt(formData.room_id),
            title: formData.title.trim(),
            description: fullDescription,
            start_time: startDateTime,
            end_time: endDateTime,
            is_recurring: true,
            recurrence_type: formData.recurrence_type,
            recurrence_end_date: `${formData.recurrence_end_date}T23:59:59`,
            recurrence_days: formData.recurrence_days,
            weekly_schedules: formData.weekly_schedules,
            priority: parseInt(formData.priority)
        };
    } else {
        // Para reservas únicas, usar o formato original
        const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
        const endDateTime = `${formData.end_date}T${formData.end_time}:00`;

        reservationData = {
            user_id: parseInt(formData.user_id),
            room_id: parseInt(formData.room_id),
            title: formData.title.trim(),
            description: formData.description.trim(),
            start_time: startDateTime,
            end_time: endDateTime,
            is_recurring: false,
            recurrence_type: null,
            recurrence_end_date: null,
            priority: parseInt(formData.priority)
        };
    }

    const result = await createReservation(reservationData);
    
    setSuccessMessage(
        result.status === 'approved' 
        ? "Reserva criada e aprovada automaticamente!"
        : "Reserva criada com sucesso! Aguardando aprovação."
    );

    // Limpar formulário
    setFormData({
        user_id: user?.id || "",
        room_id: "",
        title: "",
        description: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        is_recurring: false,
        recurrence_type: "weekly",
        recurrence_end_date: "",
        recurrence_days: [],
        recurrence_interval: 1,
        weekly_schedules: {},
        priority: 1
    });
    
    // Limpar calendário
    setRoomReservations([]);
    setSelectedRoom(null);

    } catch (err) {
    setError(err.message);
    } finally {
    setFormLoading(false);
    }
};

// Obter nome do usuário
const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === parseInt(userId));
    return foundUser ? foundUser.name : 'Usuário não encontrado';
};

// Obter nome da sala
const getRoomName = (roomId) => {
    const foundRoom = rooms.find(r => r.id === parseInt(roomId));
    return foundRoom ? `${foundRoom.name} - ${foundRoom.location}` : 'Sala não encontrada';
};

// Atualizar horário de um dia específico
const updateDaySchedule = (dayValue, field, value) => {
    setFormData(prev => ({
        ...prev,
        weekly_schedules: {
            ...prev.weekly_schedules,
            [dayValue]: {
                ...prev.weekly_schedules[dayValue],
                [field]: value
            }
        }
    }));
};

// Remover horário de um dia específico
const removeDaySchedule = (dayValue) => {
    setFormData(prev => {
        const newSchedules = { ...prev.weekly_schedules };
        delete newSchedules[dayValue];
        return {
            ...prev,
            weekly_schedules: newSchedules,
            recurrence_days: prev.recurrence_days.filter(d => d !== dayValue)
        };
    });
};

if (loading) {
    return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
        <div className="p-8">
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Carregando...</p>
        </div>
        </div>
    </DashboardLayout>
    );
}

return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
    <div className="p-8">
        {/* Header */}
        <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
            <CalendarPlus className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
            Nova Reserva
            </h1>
        </div>
        <p className="text-gray-700">
            Criar uma nova reserva de sala
        </p>
        </div>

        {/* Mensagens */}
        {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
        </div>
        )}

        {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-700">{successMessage}</span>
        </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Formulário */}
        <div className="bg-white rounded-lg shadow border p-4 max-h-[calc(100vh-12rem)] overflow-y-auto form-scroll form-container">
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Usuário e Sala */}
            <div className="grid grid-cols-1 gap-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <UsersIcon size={16} className="inline mr-1" />
                Coordenador Responsável
                </label>
                <input
                type="text"
                value={`${user?.name} (${user?.role}) - ${user?.email}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
                <input type="hidden" name="user_id" value={formData.user_id} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <DoorClosed size={16} className="inline mr-1" />
                Sala
                </label>
                <select
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">Selecione uma sala</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                    {room.name} - {room.location} (Cap: {room.capacity})
                    </option>
                ))}
                </select>
            </div>
            </div>

            {/* Título e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Reserva
                </label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Ex: Reunião de Coordenação"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
                </label>
                <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value={1}>Normal</option>
                <option value={2}>Alta</option>
                <option value={3}>Urgente</option>
                </select>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (Opcional)
            </label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Detalhes adicionais sobre a reserva..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            {/* Seção de Datas e Horários */}
            <div className="border-t pt-4">
            <h3 className="text-base font-medium text-gray-800 mb-3">
                {formData.is_recurring ? "📅 Período e Horários" : "📅 Data e Horário da Reserva"}
            </h3>
            
            {!formData.is_recurring ? (
                // Reserva única - campos normais
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Data de Início
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Hora de Início
                    </label>
                    <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Data de Fim
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Hora de Fim
                    </label>
                    <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                </div>
                </>
            ) : (
                // Reserva recorrente - apenas data de início para referência
                <div className="grid grid-cols-1 gap-4">
                    <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Data de Início da Recorrência
                        <Tooltip content={
                            <div>
                            <strong>📚 Explicação Detalhada</strong><br/><br/>
                            <strong>1. Data de Início da Recorrência:</strong><br/>
                            Define a primeira data das aulas (ex: 04/03/2024 = primeira segunda-feira)<br/><br/>
                            <strong>2. Horários por Dia da Semana:</strong><br/>
                            Cada dia pode ter horários diferentes:<br/>
                            • Seg: 08:00-10:00 (Teoria - 2h)<br/>
                            • Qua: 14:00-17:00 (Prática - 3h)<br/>
                            • Sex: 10:00-12:00 (Lab - 2h)<br/><br/>
                            <strong>3. Data Limite da Recorrência:</strong><br/>
                            Define quando param as aulas (ex: 30/06/2024 = final do semestre)<br/><br/>
                            <strong>4. Campos Ocultos:</strong><br/>
                            Na recorrência, não usamos "Data de Fim" nem "Hora de Início/Fim" pois cada dia tem seus próprios horários.
                            </div>
                        }>
                            <Info size={16} className="ml-2 text-blue-600 hover:text-blue-800 cursor-help" />
                        </Tooltip>
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                </div>
            )}
            </div>

            {/* Recorrência */}
            <div className="border-t pt-4">
            <div className="flex items-center mb-4">
                <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleInputChange}
                className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 flex items-center">
                <Repeat size={16} className="inline mr-1" />
                Reserva Recorrente
                </label>
                <Tooltip content={
                <div>
                    <strong>🔄 Reserva Recorrente</strong><br/><br/>
                    Ideal para <strong>disciplinas e aulas regulares</strong> que se repetem ao longo do semestre.<br/><br/>
                    <strong>Benefícios:</strong><br/>
                    • Cria automaticamente todas as aulas do semestre<br/>
                    • Permite horários diferentes por dia da semana<br/>
                    • Evita criar reserva por reserva manualmente<br/>
                    • Perfeito para grades horárias acadêmicas<br/><br/>
                    <strong>Exemplo:</strong> Disciplina que acontece Seg/Qua/Sex durante todo o semestre
                </div>
                }>
                <HelpCircle size={16} className="ml-2 text-blue-500 hover:text-blue-700" />
                </Tooltip>
            </div>

            {formData.is_recurring && (
                <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Recorrência
                    </label>
                    <select
                        name="recurrence_type"
                        value={formData.recurrence_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="weekly">Semanal (Aulas regulares)</option>
                        <option value="daily">Diário (Curso intensivo)</option>
                        <option value="monthly">Mensal (Reuniões mensais)</option>
                        <option value="custom">Personalizado (Dias específicos)</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalo de Repetição
                    </label>
                    <select
                        name="recurrence_interval"
                        value={formData.recurrence_interval}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>A cada 1 {formData.recurrence_type === 'weekly' ? 'semana' : formData.recurrence_type === 'daily' ? 'dia' : 'mês'}</option>
                        <option value={2}>A cada 2 {formData.recurrence_type === 'weekly' ? 'semanas' : formData.recurrence_type === 'daily' ? 'dias' : 'meses'}</option>
                        <option value={3}>A cada 3 {formData.recurrence_type === 'weekly' ? 'semanas' : formData.recurrence_type === 'daily' ? 'dias' : 'meses'}</option>
                        <option value={4}>A cada 4 {formData.recurrence_type === 'weekly' ? 'semanas' : formData.recurrence_type === 'daily' ? 'dias' : 'meses'}</option>
                    </select>
                    </div>
                </div>

                {/* Horários por dia da semana */}
                {(formData.recurrence_type === 'weekly' || formData.recurrence_type === 'custom') && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        📅 Horários por Dia da Semana
                    </label>
                    <p className="text-xs text-gray-700 mb-3">
                        Configure horários específicos para cada dia.
                    </p>
                    
                    <div className="space-y-2">
                        {[
                        { value: '1', label: 'Segunda-feira', short: 'Seg' },
                        { value: '2', label: 'Terça-feira', short: 'Ter' },
                        { value: '3', label: 'Quarta-feira', short: 'Qua' },
                        { value: '4', label: 'Quinta-feira', short: 'Qui' },
                        { value: '5', label: 'Sexta-feira', short: 'Sex' },
                        { value: '6', label: 'Sábado', short: 'Sáb' },
                        { value: '0', label: 'Domingo', short: 'Dom' }
                        ].map(day => {
                        const isSelected = formData.recurrence_days.includes(day.value);
                        const daySchedule = formData.weekly_schedules[day.value] || {};
                        
                        return (
                            <div key={day.value} className="border rounded-lg p-2 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData(prev => ({ 
                                        ...prev, 
                                        recurrence_days: [...prev.recurrence_days, day.value] 
                                        }));
                                    } else {
                                        removeDaySchedule(day.value);
                                    }
                                    }}
                                    className="mr-2"
                                />
                                <span className="font-medium text-gray-800">{day.label}</span>
                                </label>
                                {isSelected && (
                                <button
                                    type="button"
                                    onClick={() => removeDaySchedule(day.value)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    Remover
                                </button>
                                )}
                            </div>
                            
                            {isSelected && (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Início
                                    </label>
                                    <input
                                    type="time"
                                    value={daySchedule.start_time || ''}
                                    onChange={(e) => updateDaySchedule(day.value, 'start_time', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Fim
                                    </label>
                                    <input
                                    type="time"
                                    value={daySchedule.end_time || ''}
                                    onChange={(e) => updateDaySchedule(day.value, 'end_time', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                </div>
                            )}
                            </div>
                        );
                        })}
                    </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Limite da Recorrência (Final do Semestre)
                    </label>
                    <input
                    type="date"
                    name="recurrence_end_date"
                    value={formData.recurrence_end_date}
                    onChange={handleInputChange}
                    min={formData.start_date}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-700 mt-1">
                    Final do período letivo
                    </p>
                </div>
                </div>
            )}
            </div>

            {/* Verificação de Conflitos */}
            {formData.room_id && (formData.is_recurring ? 
                (formData.recurrence_days.length > 0 && formData.start_date && formData.recurrence_end_date) :
                (formData.start_date && formData.start_time && formData.end_date && formData.end_time)
            ) && (() => {
                const conflicts = checkConflicts();
                return conflicts && conflicts.length > 0 ? (
                    <div className="border-t pt-4">
                        <h3 className="text-base font-medium text-red-800 mb-2">⚠️ Conflitos Detectados</h3>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <div className="text-sm text-red-700 space-y-1">
                                {conflicts.map((conflict, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <div><strong>📅 {conflict.date}:</strong></div>
                                        <div className="ml-4">
                                            <div>• Sua reserva: {conflict.newTime}</div>
                                            <div>• Conflita com: "{conflict.existingTitle}" ({conflict.existingTime})</div>
                                        </div>
                                    </div>
                                ))}
                                {conflicts.length >= 5 && (
                                    <div className="text-xs text-red-600 italic mt-2">
                                        * Mostrando apenas os primeiros 5 conflitos
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null;
            })()}

            {/* Preview da Reserva */}
            {formData.user_id && formData.room_id && formData.title && formData.start_date && formData.start_time && formData.end_date && formData.end_time && (
            <div className="border-t pt-4">
                <h3 className="text-base font-medium text-gray-800 mb-2">Preview da Reserva</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                    <strong>Usuário:</strong> {getUserName(formData.user_id)}
                    </div>
                    <div>
                    <strong>Sala:</strong> {getRoomName(formData.room_id)}
                    </div>
                    <div>
                    <strong>Título:</strong> {formData.title}
                    </div>
                    <div>
                    <strong>Período:</strong> {formData.start_date} {formData.start_time} - {formData.end_date} {formData.end_time}
                    </div>
                    {formData.is_recurring && (
                    <div>
                        <strong>Recorrência:</strong> {
                        formData.recurrence_type === 'weekly' ? 'Semanal (Aulas regulares)' :
                        formData.recurrence_type === 'daily' ? 'Diário (Curso intensivo)' :
                        formData.recurrence_type === 'monthly' ? 'Mensal (Reuniões mensais)' :
                        'Personalizado'
                        }
                        {formData.recurrence_interval > 1 && ` - A cada ${formData.recurrence_interval} ${
                        formData.recurrence_type === 'weekly' ? 'semanas' :
                        formData.recurrence_type === 'daily' ? 'dias' : 'meses'
                        }`}
                    </div>
                    )}
                    {formData.is_recurring && formData.recurrence_days.length > 0 && (
                    <div>
                        <strong>Horários da Semana:</strong>
                        <div className="mt-1 space-y-1">
                        {formData.recurrence_days.map(day => {
                            const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                            const daySchedule = formData.weekly_schedules[day];
                            return (
                            <div key={day} className="text-xs bg-blue-50 p-2 rounded">
                                <strong>{dayNames[parseInt(day)]}:</strong> {
                                daySchedule?.start_time && daySchedule?.end_time
                                    ? `${daySchedule.start_time} - ${daySchedule.end_time}`
                                    : 'Horário não definido'
                                }
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    )}
                    {formData.is_recurring && formData.recurrence_end_date && (
                    <div>
                        <strong>Final do Período:</strong> {formData.recurrence_end_date}
                    </div>
                    )}
                </div>
                </div>
            </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
            <button
                type="button"
                onClick={() => {
                setFormData({
                    user_id: user?.id || "",
                    room_id: "",
                    title: "",
                    description: "",
                    start_date: "",
                    start_time: "",
                    end_date: "",
                    end_time: "",
                    is_recurring: false,
                    recurrence_type: "weekly",
                    recurrence_end_date: "",
                    recurrence_days: [],
                    recurrence_interval: 1,
                    weekly_schedules: {},
                    priority: 1
                });
                setRoomReservations([]);
                setSelectedRoom(null);
                setError("");
                setSuccessMessage("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
                Limpar
            </button>
            <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
                {formLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                </>
                ) : (
                <>
                    <Save size={16} />
                    Criar Reserva
                </>
                )}
            </button>
            </div>
        </form>
        </div>
        
        {/* Calendário da Sala */}
        <div className="bg-white rounded-lg shadow border p-4 max-h-[calc(100vh-12rem)] overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                {selectedRoom ? `Agenda da Sala - ${selectedRoom.name}` : 'Selecione uma sala para ver a agenda'}
                </h3>
            </div>
            
            <div style={{ height: 'calc(100vh - 18rem)' }}>
                <BigCalendar
                localizer={localizer}
                events={roomReservations}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={['week']}
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
                    backgroundColor: event.resource?.isRecurring ? '#10b981' : '#3b82f6',
                    borderColor: event.resource?.isRecurring ? '#059669' : '#1d4ed8',
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: event.resource?.isRecurring ? '2px solid #047857' : '1px solid #1d4ed8'
                    }
                })}
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
                <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Reservas Únicas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded border-2 border-green-700"></div>
                    <span>Reservas Recorrentes</span>
                </div>
                </div>
                {!selectedRoom && (
                <div className="mt-2 text-gray-700 italic">
                    Selecione uma sala no formulário para visualizar suas reservas
                </div>
                )}
            </div>
            </div>
        
        </div>
    </div>
    </DashboardLayout>
);
};

export default NewReservation;

