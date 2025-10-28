import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
    getReservations,
    getRooms 
} from "../../services/authService";
import { AlertCircle, X } from "lucide-react";
import moment from 'moment';
import 'moment/locale/pt-br';

// Componentes
import CalendarWidget from "../../components/portaria/CalendarWidget";
import TodayReservations from "../../components/portaria/TodayReservations";
import ReservationsList from "../../components/portaria/ReservationsList";
import FiltersSection from "../../components/portaria/FiltersSection";
import ReservationModal from "../../components/portaria/ReservationModal";

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

const ReservasPortaria = () => {
    const { user } = useAuth();
    const userType = user?.role || "portaria";
    const menuItems = getUserMenu(userType);
    const userTypeDisplay = getUserTypeDisplay(userType);

    // Estados principais
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Estados do calendário
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedRoom, setSelectedRoom] = useState('');

    // Estados dos dados filtrados
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [todayReservations, setTodayReservations] = useState([]);
    const [daysWithReservations, setDaysWithReservations] = useState(new Set());
    const [reservationsPerDay, setReservationsPerDay] = useState(new Map());

    // Estados do modal
    const [showModal, setShowModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [modalCalendarEvents, setModalCalendarEvents] = useState([]);

    // Estados da paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

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

    // Processar dados quando reservations ou filtros mudam
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

        while (currentDate.isSameOrBefore(endDate, 'day') && weekCount < maxWeeks) {
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
        try {
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
                } else {
                    console.log(`Reserva normal "${reservation.title}": ${occurrences.length} ocorrência`);
                }
            });

            console.log('Reservas expandidas:', expandedReservations.length);
            console.log('Primeiras 3 reservas expandidas:', expandedReservations.slice(0, 3).map(r => ({
                title: r.title,
                start_time: r.start_time,
                is_recurrence_instance: r.is_recurrence_instance
            })));

            // Filtrar por sala se selecionada
            if (selectedRoom) {
                expandedReservations = expandedReservations.filter(
                    reservation => reservation.room_id.toString() === selectedRoom
                );
            }

            // Filtrar por data se selecionada
            if (selectedDate) {
                const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
                console.log('Filtrando por data selecionada:', selectedDateStr);
                console.log('Reservas antes do filtro de data:', expandedReservations.length);
                expandedReservations = expandedReservations.filter(reservation => 
                    moment(reservation.start_time).format('YYYY-MM-DD') === selectedDateStr
                );
                console.log('Reservas depois do filtro de data:', expandedReservations.length);
            }

            // Ordenar por data de início
            expandedReservations.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

            setFilteredReservations(expandedReservations);

            // Para o calendário e reservas do dia, usar todas as reservas expandidas (ANTES dos filtros)
            const daysSet = new Set();
            const dayCountMap = new Map();
            
            // Usar todas as reservas expandidas, não as filtradas
            let allExpandedReservations = [];
            approvedReservations.forEach(reservation => {
                const occurrences = expandRecurringReservations(reservation);
                allExpandedReservations.push(...occurrences);
            });

            // Reservas do dia selecionado (usar todas as reservas expandidas, não as filtradas)
            const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
            const selectedDayEvents = allExpandedReservations.filter(reservation => 
                moment(reservation.start_time).format('YYYY-MM-DD') === selectedDateStr
            );
            setTodayReservations(selectedDayEvents);
            
            allExpandedReservations.forEach(reservation => {
                const eventDate = moment(reservation.start_time).format('YYYY-MM-DD');
                
                // Adicionar ao set se estiver no mês atual
                if (moment(reservation.start_time).isSame(currentMonth, 'month')) {
                    daysSet.add(eventDate);
                }
                
                // Contar reservas por dia (para todo o período, não só o mês atual)
                const currentCount = dayCountMap.get(eventDate) || 0;
                dayCountMap.set(eventDate, currentCount + 1);
            });
            
            console.log('Dados do calendário:', {
                daysWithReservations: Array.from(daysSet),
                reservationsPerDay: Object.fromEntries(dayCountMap),
                currentMonth: currentMonth.format('YYYY-MM')
            });
            
            setDaysWithReservations(daysSet);
            setReservationsPerDay(dayCountMap);
            
            console.log('Processamento concluído com sucesso');
        } catch (error) {
            console.error('Erro no processamento dos dados:', error);
            setError('Erro ao processar dados das reservas: ' + error.message);
            
            // Fallback: usar reservas originais
            const fallbackReservations = reservations.filter(reservation => 
                reservation.status === 'approved'
            );
            setFilteredReservations(fallbackReservations);
            setTodayReservations([]);
            setDaysWithReservations(new Set());
            setReservationsPerDay(new Map());
        }
    };

    // Todas as salas disponíveis para o dropdown
    const filteredRooms = rooms;

    // Navegar mês anterior/próximo
    const navigateMonth = (direction) => {
        const newMonth = moment(currentMonth).add(direction, 'month');
        setCurrentMonth(newMonth);
    };

    // Selecionar data
    const selectDate = (date) => {
        const selectedDateObj = date.toDate();
        setSelectedDate(selectedDateObj);
        setCurrentPage(1); // Reset paginação
    };

    // Abrir modal com detalhes da reserva
    const openReservationModal = (event) => {
        const reservation = event.resource?.reservation || event;
        const room = rooms.find(r => r.id === reservation.room_id);
        
        setSelectedReservation({
            ...reservation,
            room: room
        });

        // Filtrar eventos apenas da sala selecionada
        const roomEvents = filteredReservations
            .filter(res => res.room_id === reservation.room_id)
            .map(res => ({
                id: res.id,
                title: res.title,
                start: new Date(res.start_time),
                end: new Date(res.end_time),
                resource: {
                    user: res.user_name || 'Usuário',
                    room: res.room_name || 'Sala não encontrada',
                    room_id: res.room_id,
                    description: res.description,
                    reservation: res
                }
            }));
        
        setModalCalendarEvents(roomEvents);
        setShowModal(true);
    };

    // Fechar modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedReservation(null);
        setModalCalendarEvents([]);
    };

    // Calcular paginação
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReservations = filteredReservations.slice(startIndex, endIndex);

    return (
        <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Visualização de Reservas
                        </h1>
                        <p className="text-gray-700">
                            Painel de visualização para a portaria - apenas leitura
                        </p>
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

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-800">Carregando reservas...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Filtros */}
                        <FiltersSection
                            selectedRoom={selectedRoom}
                            onRoomChange={(value) => {
                                setSelectedRoom(value);
                                setCurrentPage(1);
                            }}
                            filteredRooms={filteredRooms}
                            selectedDate={selectedDate}
                            onDateChange={(date) => {
                                setSelectedDate(date);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* Coluna Esquerda - Calendário e Reservas de Hoje */}
                            <div className="xl:col-span-1 space-y-6">
                                <CalendarWidget
                                    currentMonth={currentMonth}
                                    onNavigateMonth={navigateMonth}
                                    selectedDate={selectedDate}
                                    onSelectDate={selectDate}
                                    daysWithReservations={daysWithReservations}
                                    reservationsPerDay={reservationsPerDay}
                                />

                                <TodayReservations
                                    todayReservations={todayReservations.map(reservation => ({
                                        id: reservation.id,
                                        title: reservation.title,
                                        start: new Date(reservation.start_time),
                                        end: new Date(reservation.end_time),
                                        resource: {
                                            user: reservation.user_name || 'Usuário',
                                            room: reservation.room_name || 'Sala não encontrada',
                                            room_id: reservation.room_id,
                                            description: reservation.description,
                                            reservation: reservation
                                        }
                                    }))}
                                    onReservationClick={openReservationModal}
                                    selectedDate={selectedDate}
                                />
                            </div>

                            {/* Coluna Direita - Lista de Reservas */}
                            <div className="xl:col-span-3">
                                <ReservationsList
                                    reservations={paginatedReservations}
                                    onReservationClick={openReservationModal}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    totalPages={totalPages}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes da Reserva */}
                <ReservationModal
                    showModal={showModal}
                    selectedReservation={selectedReservation}
                    modalCalendarEvents={modalCalendarEvents}
                    onClose={closeModal}
                />
            </div>
        </DashboardLayout>
    );
};

export default ReservasPortaria;