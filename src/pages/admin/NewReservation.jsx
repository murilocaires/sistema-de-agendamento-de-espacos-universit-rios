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
Search,
X
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

const NewReservation = ({ embed = false }) => {
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
const [allReservations, setAllReservations] = useState([]);
const [roomReservations, setRoomReservations] = useState([]);
const [selectedRoom, setSelectedRoom] = useState(null);
const [calendarDate, setCalendarDate] = useState(new Date());
const [roomSearchTerm, setRoomSearchTerm] = useState("");
const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
const [userSearchTerm, setUserSearchTerm] = useState("");
const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

const [formData, setFormData] = useState({
    user_id: user?.id || "",
    room_id: "",
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_time: "",
    people_count: 1,
    is_recurring: false,
    recurrence_type: "weekly",
    recurrence_end_date: ""
});

// Carregar dados iniciais
useEffect(() => {
    const loadData = async () => {
    try {
        setLoading(true);
        const [roomsData, usersData, reservationsData] = await Promise.all([
        getRooms(),
        getUsers(),
        getReservations({ status: 'approved' })
        ]);
        
        setRooms(roomsData.filter(room => room.is_active));
        setUsers(usersData);
        setAllReservations(reservationsData || []);
        setError("");
    } catch (err) {
        setError("Erro ao carregar dados: " + err.message);
    } finally {
        setLoading(false);
    }
    };

    loadData();
}, []);

// Fechar dropdown ao clicar fora
useEffect(() => {
    const handleClickOutside = (event) => {
        if (isRoomDropdownOpen && !event.target.closest('.room-search-container')) {
            setIsRoomDropdownOpen(false);
        }
        if (isUserDropdownOpen && !event.target.closest('.user-search-container')) {
            setIsUserDropdownOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [isRoomDropdownOpen, isUserDropdownOpen]);

// Função para expandir reservas recorrentes
const expandRecurringReservations = (reservation) => {
    if (!reservation.is_recurring || !reservation.recurrence_end_date) {
        return [reservation];
    }

    const occurrences = [];
    const startDate = moment(reservation.start_time);
    const endDate = moment(reservation.recurrence_end_date);
    const startTime = moment(reservation.start_time).format('HH:mm');
    const endTime = moment(reservation.end_time).format('HH:mm');

    // Determinar o tipo de recorrência (padrão: weekly se não especificado)
    const recurrenceType = reservation.recurrence_type || 'weekly';
    
    // Normalizar datas para comparação apenas por dia (ignorar horas)
    const startDateDay = moment(startDate).startOf('day');
    const endDateDay = moment(endDate).startOf('day');
    
    let currentDate = moment(startDateDay);
    let count = 0;
    
    // Limites baseados no tipo de recorrência
    let maxCount;
    if (recurrenceType === 'daily') {
        maxCount = 365; // Limite de 1 ano para recorrências diárias
    } else if (recurrenceType === 'weekly') {
        maxCount = 52; // Limite de 1 ano (52 semanas)
    } else if (recurrenceType === 'monthly') {
        maxCount = 12; // Limite de 1 ano (12 meses)
    } else {
        maxCount = 52; // Padrão: 52 semanas
    }

    // Gerar ocorrências enquanto a data atual for menor ou igual à data final
    while (currentDate.isSameOrBefore(endDateDay, 'day') && count < maxCount) {
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

        // Incrementar baseado no tipo de recorrência ANTES de verificar novamente
        if (recurrenceType === 'daily') {
            currentDate.add(1, 'day');
        } else if (recurrenceType === 'weekly') {
        currentDate.add(1, 'week');
        } else if (recurrenceType === 'monthly') {
            currentDate.add(1, 'month');
        } else {
            currentDate.add(1, 'week'); // Padrão: semanal
        }
        count++;
    }

    return occurrences.length > 0 ? occurrences : [reservation];
};

// Gerar eventos de preview da reserva em criação (incluindo recorrências)
const generatePreviewEvents = () => {
    // Verificar se todos os campos necessários estão preenchidos
    if (!formData.room_id || !formData.start_date || !formData.start_time || !formData.end_time || !formData.title) {
        return [];
    }

    try {
        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.start_date}T${formData.end_time}`);

        // Validar se as datas são válidas
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return [];
        }

        const user = users.find(u => u.id === parseInt(formData.user_id));
        const room = rooms.find(r => r.id === parseInt(formData.room_id));

        const events = [];

        // Se for reserva recorrente, expandir ocorrências
        if (formData.is_recurring && formData.recurrence_end_date) {
            const startDate = moment(startDateTime);
            const endDate = moment(formData.recurrence_end_date);
            const startTime = moment(startDateTime).format('HH:mm');
            const endTime = moment(endDateTime).format('HH:mm');
            const recurrenceType = formData.recurrence_type || 'weekly';

            // Normalizar datas para comparação
            const startDateDay = moment(startDate).startOf('day');
            const endDateDay = moment(endDate).startOf('day');
            
            let currentDate = moment(startDateDay);
            let count = 0;
            
            // Limites baseados no tipo de recorrência
            let maxCount;
            if (recurrenceType === 'daily') {
                maxCount = 365;
            } else if (recurrenceType === 'weekly') {
                maxCount = 52;
            } else if (recurrenceType === 'monthly') {
                maxCount = 12;
            } else {
                maxCount = 52;
            }

            while (currentDate.isSameOrBefore(endDateDay, 'day') && count < maxCount) {
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

                // Verificar se a sala corresponde ao filtro do calendário
                const shouldShow = !selectedRoom || formData.room_id.toString() === selectedRoom.id.toString();

                if (shouldShow) {
                    events.push({
                        id: `preview-reservation-${currentDate.format('YYYY-MM-DD')}`,
                        title: formData.title,
                        start: occurrenceStart.toDate(),
                        end: occurrenceEnd.toDate(),
                        resource: {
                            user: user?.name || 'Usuário',
                            room: room?.name || 'Sala não encontrada',
                            room_id: formData.room_id,
                            status: 'preview',
                            description: formData.description,
                            isPreview: true
                        }
                    });
                }

                // Incrementar baseado no tipo de recorrência
                if (recurrenceType === 'daily') {
                    currentDate.add(1, 'day');
                } else if (recurrenceType === 'weekly') {
                    currentDate.add(1, 'week');
                } else if (recurrenceType === 'monthly') {
                    currentDate.add(1, 'month');
                } else {
                    currentDate.add(1, 'week');
                }
                count++;
            }
        } else {
            // Reserva não recorrente - apenas um evento
            // Verificar se a sala corresponde ao filtro do calendário
            const shouldShow = !selectedRoom || formData.room_id.toString() === selectedRoom.id.toString();

            if (shouldShow) {
                events.push({
                    id: 'preview-reservation',
                    title: formData.title,
                    start: startDateTime,
                    end: endDateTime,
                    resource: {
                        user: user?.name || 'Usuário',
                        room: room?.name || 'Sala não encontrada',
                        room_id: formData.room_id,
                        status: 'preview',
                        description: formData.description,
                        isPreview: true
                    }
                });
            }
        }

        return events;
    } catch (err) {
        return [];
    }
};

// Validar conflitos com reservas existentes
const validateReservationConflicts = () => {
    if (!formData.room_id || !formData.start_date || !formData.start_time || !formData.end_time) {
        return null;
    }

    try {
        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.start_date}T${formData.end_time}`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return null;
        }

        // Expandir todas as reservas existentes (incluindo recorrentes)
        let allExistingReservations = [];
        allReservations
            .filter(r => r.status === 'approved' && r.room_id.toString() === formData.room_id.toString())
            .forEach(reservation => {
                const occurrences = expandRecurringReservations(reservation);
                allExistingReservations.push(...occurrences);
            });

        // Verificar se a nova reserva é recorrente
        if (formData.is_recurring && formData.recurrence_end_date) {
            const startDate = moment(startDateTime);
            const endDate = moment(formData.recurrence_end_date);
            const startTime = moment(startDateTime).format('HH:mm');
            const endTime = moment(endDateTime).format('HH:mm');
            const recurrenceType = formData.recurrence_type || 'weekly';

            const startDateDay = moment(startDate).startOf('day');
            const endDateDay = moment(endDate).startOf('day');
            
            let currentDate = moment(startDateDay);
            let count = 0;
            
            let maxCount;
            if (recurrenceType === 'daily') {
                maxCount = 365;
            } else if (recurrenceType === 'weekly') {
                maxCount = 52;
            } else if (recurrenceType === 'monthly') {
                maxCount = 12;
            } else {
                maxCount = 52;
            }

            // Verificar cada ocorrência da nova reserva recorrente
            while (currentDate.isSameOrBefore(endDateDay, 'day') && count < maxCount) {
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

                // Verificar conflito com reservas existentes
                for (const existingReservation of allExistingReservations) {
                    const existingStart = moment(existingReservation.start_time);
                    const existingEnd = moment(existingReservation.end_time);

                    // Verificar se há sobreposição de horários
                    if (
                        (occurrenceStart.isBefore(existingEnd) && occurrenceEnd.isAfter(existingStart))
                    ) {
                        return `Conflito detectado! Já existe uma reserva nesta sala no período ${occurrenceStart.format('DD/MM/YYYY HH:mm')} - ${occurrenceEnd.format('HH:mm')}`;
                    }
                }

                // Incrementar
                if (recurrenceType === 'daily') {
                    currentDate.add(1, 'day');
                } else if (recurrenceType === 'weekly') {
                    currentDate.add(1, 'week');
                } else if (recurrenceType === 'monthly') {
                    currentDate.add(1, 'month');
                } else {
                    currentDate.add(1, 'week');
                }
                count++;
            }
        } else {
            // Reserva não recorrente - verificar conflito simples
            for (const existingReservation of allExistingReservations) {
                const existingStart = moment(existingReservation.start_time);
                const existingEnd = moment(existingReservation.end_time);

                // Verificar se há sobreposição de horários
                if (
                    (moment(startDateTime).isBefore(existingEnd) && moment(endDateTime).isAfter(existingStart))
                ) {
                    return `Conflito detectado! Já existe uma reserva nesta sala no período ${moment(startDateTime).format('DD/MM/YYYY HH:mm')} - ${moment(endDateTime).format('HH:mm')}`;
                }
            }
        }

        return null; // Sem conflitos
    } catch (err) {
        console.error('Erro ao validar conflitos:', err);
        return null;
    }
};

// Processar e filtrar reservas para o calendário
useEffect(() => {
    if (rooms.length === 0) {
        setRoomReservations([]);
        return;
    }

    let events = [];

    // Adicionar reservas salvas se houver
    if (allReservations.length > 0) {
        // Filtrar apenas reservas aprovadas
        let approvedReservations = allReservations.filter(reservation => 
            reservation.status === 'approved'
        );
        
        // Expandir reservas recorrentes
        let expandedReservations = [];
        approvedReservations.forEach(reservation => {
            const occurrences = expandRecurringReservations(reservation);
            expandedReservations.push(...occurrences);
        });
        
        // Filtrar por sala se selecionada
        if (selectedRoom) {
            expandedReservations = expandedReservations.filter(
                reservation => reservation.room_id.toString() === selectedRoom.id.toString()
            );
        }

        // Converter para eventos do calendário
        events = expandedReservations.map(reservation => {
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
                status: reservation.status,
                    description: reservation.description,
                    isPreview: false
            }
            };
        });
    }

    // Adicionar eventos de preview se os dados estiverem preenchidos (incluindo recorrências)
    const previewEvents = generatePreviewEvents();
    if (previewEvents.length > 0) {
        events.push(...previewEvents);
    }

    setRoomReservations(events);
}, [allReservations, selectedRoom, rooms, formData, users]);

// Validar conflitos e recorrência em tempo real
useEffect(() => {
    // Validar se a sala permite recorrência
    if (formData.is_recurring && formData.room_id) {
        const recurrenceError = validateRoomRecurrence();
        if (recurrenceError) {
            setError(recurrenceError);
            return;
        } else {
            // Limpar erro de recorrência se não houver mais problema
            setError(prev => prev && prev.includes('não permite reservas recorrentes') ? "" : prev);
        }
    } else {
        // Limpar erro de recorrência se não for recorrente
        setError(prev => prev && prev.includes('não permite reservas recorrentes') ? "" : prev);
    }

    // Validar conflitos apenas se os campos necessários estiverem preenchidos
    if (formData.room_id && formData.start_date && formData.start_time && formData.end_time) {
        const conflictError = validateReservationConflicts();
        if (conflictError) {
            setError(conflictError);
        } else {
            // Limpar erro de conflito se não houver mais conflito
            setError(prev => prev && prev.includes('Conflito detectado') ? "" : prev);
        }
    } else {
        // Limpar erro de conflito se campos não estiverem completos
        setError(prev => prev && prev.includes('Conflito detectado') ? "" : prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [formData.room_id, formData.start_date, formData.start_time, formData.end_time, formData.is_recurring, formData.recurrence_type, formData.recurrence_end_date, allReservations, rooms]);

// Selecionar sala (atualiza o filtro)
const handleRoomSelect = async (roomId) => {
    if (!roomId) {
        setSelectedRoom(null);
        setRoomSearchTerm("");
        setIsRoomDropdownOpen(false);
        setFormData(prev => ({
            ...prev,
            room_id: ""
        }));
        return;
    }

    const room = rooms.find(r => r.id === parseInt(roomId));
    setSelectedRoom(room);
    setRoomSearchTerm("");
    setIsRoomDropdownOpen(false);
    
    // Se a sala não permite recorrência, desmarcar checkbox de recorrência
    const isFixed = room && (room.is_fixed_reservation === true || room.is_fixed_reservation === 1);
    
    setFormData(prev => ({
        ...prev,
        room_id: roomId,
        ...(isFixed ? { is_recurring: false, recurrence_end_date: "" } : {})
    }));
    // processReservations será chamado automaticamente pelo useEffect
};

// Manipular mudanças no formulário
const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
    }));

    // Se mudou a sala no formulário, atualizar seleção
    if (name === 'room_id') {
        if (value) {
            const room = rooms.find(r => r.id === parseInt(value));
            setSelectedRoom(room);
            // Se a sala não permite recorrência, desmarcar checkbox de recorrência
            if (room && (room.is_fixed_reservation === true || room.is_fixed_reservation === 1)) {
                setFormData(prev => ({
                    ...prev,
                    is_recurring: false,
                    recurrence_end_date: ""
                }));
            }
        } else {
            setSelectedRoom(null);
        }
        // processReservations será chamado automaticamente pelo useEffect
    }

    // Se mudou a data, atualizar o calendário
    if (name === 'start_date' && value) {
        // Criar data no timezone local para evitar problemas de timezone
        const [year, month, day] = value.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        setCalendarDate(selectedDate);
    }

};

// Validar se a sala permite recorrência
const validateRoomRecurrence = () => {
    if (!formData.room_id || !formData.is_recurring) {
        return null;
    }

    const room = rooms.find(r => r.id === parseInt(formData.room_id));
    if (!room) {
        return null;
    }

    // Verificar se a sala é de reserva fixa (não permite recorrência)
    const isFixed = room.is_fixed_reservation === true || room.is_fixed_reservation === 1;
    if (isFixed) {
        return `Esta sala (${room.name}) não permite reservas recorrentes. Desmarque a opção "Reserva Recorrente" para continuar.`;
    }

    return null;
};

// Validar horários
const validateTimes = () => {
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.start_date}T${formData.end_time}`);
    const now = new Date();

    if (startDateTime <= now) {
    return "A data/hora de início deve ser no futuro";
    }

    if (endDateTime <= startDateTime) {
    return "A hora de fim deve ser posterior à hora de início";
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
        setFormLoading(false);
        return;
    }

    // Validar se a sala permite recorrência
    const recurrenceError = validateRoomRecurrence();
    if (recurrenceError) {
        setError(recurrenceError);
        setFormLoading(false);
        return;
    }

    // Validar conflitos com reservas existentes
    const conflictError = validateReservationConflicts();
    if (conflictError) {
        setError(conflictError);
        setFormLoading(false);
        return;
    }

    // Preparar dados da reserva
    const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
    const endDateTime = `${formData.start_date}T${formData.end_time}:00`;

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
        : null
    };

    const result = await createReservation(reservationData);
    
    setSuccessMessage(
        result.status === 'approved' 
        ? "Reserva criada e aprovada automaticamente!"
        : "Reserva criada com sucesso! Aguardando aprovação."
    );

    // Recarregar todas as reservas para atualizar o calendário
    try {
        const reservationsData = await getReservations({ status: 'approved' });
        setAllReservations(reservationsData || []);
    } catch (err) {
        console.error('Erro ao recarregar reservas:', err);
    }

    // Limpar formulário
    setFormData({
        user_id: user?.id || "",
        room_id: "",
        title: "",
        description: "",
        start_date: "",
        start_time: "",
        end_time: "",
        is_recurring: false,
        recurrence_type: "weekly",
        recurrence_end_date: ""
    });
    
    // Limpar seleção de sala e resetar calendário
    setSelectedRoom(null);
    setCalendarDate(new Date());

    } catch (err) {
    setError(err.message);
    } finally {
    setFormLoading(false);
    }
};

// Obter nome do usuário
const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === parseInt(userId));
    return foundUser ? `${foundUser.name} (${foundUser.role}) - ${foundUser.email}` : 'Usuário não encontrado';
};

// Obter nome completo do usuário para exibição
const getUserDisplayName = (userId) => {
    const foundUser = users.find(u => u.id === parseInt(userId));
    return foundUser ? `${foundUser.name} (${foundUser.role}) - ${foundUser.email}` : 'Usuário não encontrado';
};

// Obter nome da sala
const getRoomName = (roomId) => {
    const foundRoom = rooms.find(r => r.id === parseInt(roomId));
    return foundRoom ? `${foundRoom.name} - ${foundRoom.location}` : 'Sala não encontrada';
};

// Filtrar salas baseado no termo de busca
const filteredRooms = roomSearchTerm.trim() === "" 
    ? rooms 
    : rooms.filter(room => {
        const searchLower = roomSearchTerm.toLowerCase();
        const roomName = room.name.toLowerCase();
        const roomLocation = room.location.toLowerCase();
        return roomName.includes(searchLower) || roomLocation.includes(searchLower);
    });


// Limpar seleção de sala
const handleRoomClear = () => {
    setFormData(prev => ({
        ...prev,
        room_id: ""
    }));
    setRoomSearchTerm("");
    setIsRoomDropdownOpen(false);
    setSelectedRoom(null);
    // processReservations será chamado automaticamente pelo useEffect
};

// Filtrar usuários baseado no termo de busca
const filteredUsers = userSearchTerm.trim() === "" 
    ? users 
    : users.filter(user => {
        const searchLower = userSearchTerm.toLowerCase();
        const userName = user.name.toLowerCase();
        const userEmail = user.email.toLowerCase();
        const userRole = user.role.toLowerCase();
        return userName.includes(searchLower) || userEmail.includes(searchLower) || userRole.includes(searchLower);
    });

// Selecionar usuário
const handleUserSelect = (userId) => {
    setFormData(prev => ({
        ...prev,
        user_id: userId
    }));
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
};

// Limpar seleção de usuário
const handleUserClear = () => {
    setFormData(prev => ({
        ...prev,
        user_id: ""
    }));
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
};

if (loading) {
    const content = (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
    return embed ? content : (
      <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
        {content}
      </DashboardLayout>
    );
}

const content = (
    <div className="p-8">
        {/* Header */}

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
            <div className="relative user-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <UsersIcon size={16} className="inline mr-1" />
                Usuário
                </label>
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                        type="text"
                        value={formData.user_id ? getUserDisplayName(formData.user_id) : userSearchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (formData.user_id) {
                                // Se já tem um usuário selecionado e está digitando, limpar seleção
                                handleUserClear();
                                setUserSearchTerm(value);
                            } else {
                                setUserSearchTerm(value);
                            }
                            setIsUserDropdownOpen(true);
                        }}
                        onFocus={() => {
                            if (!formData.user_id) {
                                setIsUserDropdownOpen(true);
                            }
                        }}
                        placeholder={formData.user_id ? "" : "Digite para buscar um usuário..."}
                        required={!formData.user_id}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.user_id && (
                            <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleUserClear();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {isUserDropdownOpen && !formData.user_id && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => handleUserSelect(user.id)}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                    >
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-600">{user.role} - {user.email}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    Nenhum usuário encontrado
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative room-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <DoorClosed size={16} className="inline mr-1" />
                Sala
                </label>
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                        type="text"
                        value={formData.room_id ? getRoomName(formData.room_id) : roomSearchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (formData.room_id) {
                                // Se já tem uma sala selecionada e está digitando, limpar seleção
                                handleRoomClear();
                                setRoomSearchTerm(value);
                            } else {
                                setRoomSearchTerm(value);
                            }
                            setIsRoomDropdownOpen(true);
                        }}
                        onFocus={() => {
                            if (!formData.room_id) {
                                setIsRoomDropdownOpen(true);
                            }
                        }}
                        placeholder={formData.room_id ? "" : "Digite para buscar uma sala..."}
                        required={!formData.room_id}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.room_id && (
                            <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRoomClear();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {isRoomDropdownOpen && !formData.room_id && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map(room => (
                                    <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => handleRoomSelect(room.id)}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                    >
                                        <div className="font-medium text-gray-900">{room.name}</div>
                                        <div className="text-sm text-gray-600">{room.location} - Capacidade: {room.capacity}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    Nenhuma sala encontrada
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Título */}
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

            {/* Data e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Data
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
                onChange={(e) => {
                    // Verificar se a sala permite recorrência antes de permitir marcar
                    if (e.target.checked && selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1)) {
                        setError(`Esta sala (${selectedRoom.name}) não permite reservas recorrentes.`);
                        return;
                    }
                    handleInputChange(e);
                }}
                disabled={selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1)}
                className="mr-2"
                />
                <label className={`text-sm font-medium ${selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1) ? 'text-gray-400' : 'text-gray-700'}`}>
                <Repeat size={16} className="inline mr-1" />
                Reserva Recorrente
                </label>
            </div>
            {selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1) && (
                <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Esta sala não permite reservas recorrentes
                </p>
            )}

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
                    <option value="daily">Diária</option>
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
                    end_time: "",
                    is_recurring: false,
                    recurrence_type: "weekly",
                    recurrence_end_date: ""
                });
                setRoomReservations([]);
                setSelectedRoom(null);
                setCalendarDate(new Date());
                setRoomSearchTerm("");
                setIsRoomDropdownOpen(false);
                setUserSearchTerm("");
                setIsUserDropdownOpen(false);
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
                {selectedRoom ? `Agenda da Sala - ${selectedRoom.name}` : 'Calendário Geral - Todas as Salas'}
                </h3>
            </div>
            
            <div style={{ height: 'calc(100vh - 18rem)' }}>
                <BigCalendar
                localizer={localizer}
                events={roomReservations}
                startAccessor="start"
                endAccessor="end"
                date={calendarDate}
                onNavigate={setCalendarDate}
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
        
        </div>
    </div>
);

return embed ? content : (
  <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
    {content}
  </DashboardLayout>
);
};

export default NewReservation;
