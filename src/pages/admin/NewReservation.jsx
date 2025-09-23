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
Save
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
    people_count: 1,
    is_recurring: false,
    recurrence_type: "weekly",
    recurrence_end_date: "",
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
        setRoomReservations(reservations.map(reservation => ({
            id: reservation.id,
            title: reservation.title,
            start: new Date(reservation.start_time),
            end: new Date(reservation.end_time),
            resource: {
                user: reservation.user_name,
                status: reservation.status,
                description: reservation.description
            }
        })));
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

// Validar horários
const validateTimes = () => {
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

    // Preparar dados da reserva
    const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
    const endDateTime = `${formData.end_date}T${formData.end_time}:00`;

    const reservationData = {
        user_id: parseInt(formData.user_id),
        room_id: parseInt(formData.room_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_time: startDateTime,
        end_time: endDateTime,
        people_count: parseInt(formData.people_count),
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date 
        ? `${formData.recurrence_end_date}T23:59:59` 
        : null,
        priority: parseInt(formData.priority)
    };

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

if (loading) {
    return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
        <div className="p-8">
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário e Sala */}
            <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <UsersIcon size={16} className="inline mr-1" />
                Usuário
                </label>
                <select
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">Selecione um usuário</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                    {user.name} ({user.role}) - {user.email}
                    </option>
                ))}
                </select>
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

            {/* Quantidade de Pessoas */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <UsersIcon size={16} className="inline mr-1" />
                Quantidade de Pessoas
            </label>
            <input
                type="number"
                name="people_count"
                value={formData.people_count}
                onChange={handleInputChange}
                min="1"
                max={selectedRoom ? selectedRoom.capacity : 100}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a quantidade de pessoas"
            />
            {selectedRoom && (
                <p className="mt-1 text-sm text-gray-600">
                    Capacidade da sala: {selectedRoom.capacity} pessoas
                </p>
            )}
            </div>

            {/* Data e Hora de Início */}
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
                <label className="text-sm font-medium text-gray-700">
                <Repeat size={16} className="inline mr-1" />
                Reserva Recorrente
                </label>
            </div>

            {formData.is_recurring && (
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
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Limite da Recorrência
                    </label>
                    <input
                    type="date"
                    name="recurrence_end_date"
                    value={formData.recurrence_end_date}
                    onChange={handleInputChange}
                    min={formData.start_date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                </div>
            )}
            </div>

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
                        <strong>Recorrência:</strong> {formData.recurrence_type} 
                        {formData.recurrence_end_date && ` até ${formData.recurrence_end_date}`}
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
                        <div className="opacity-90">{event.resource?.user}</div>
                    </div>
                    )
                }}
                />
            </div>
            
            <div className="mt-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Reservas Aprovadas</span>
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
