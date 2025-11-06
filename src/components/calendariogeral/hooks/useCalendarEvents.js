import { useState, useEffect } from 'react';
import moment from 'moment';
import { expandRecurringReservations } from '../utils/calendarUtils';

export const useCalendarEvents = (reservations, rooms, selectedRoom, currentMonth) => {
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [todayReservations, setTodayReservations] = useState([]);
    const [daysWithReservations, setDaysWithReservations] = useState(new Set());
    const [reservationsPerDay, setReservationsPerDay] = useState(new Map());

    useEffect(() => {
        if (reservations.length === 0) {
            setCalendarEvents([]);
            setTodayReservations([]);
            setDaysWithReservations(new Set());
            setReservationsPerDay(new Map());
            return;
        }

        console.log('📅 Processando dados das reservas para o mês:', moment(currentMonth).format('MMMM YYYY'));
        console.log('Total de reservas:', reservations.length);
        
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
        
        console.log('🔍 Verificando eventos para o mês:', moment(currentMonth).format('MMMM YYYY'));
        
        events.forEach(event => {
            const eventDate = moment(event.start).format('YYYY-MM-DD');
            
            if (moment(event.start).isSame(currentMonth, 'month')) {
                daysSet.add(eventDate);
                console.log('✅ Dia com reserva no mês atual:', eventDate);
            }
            
            // Contar reservas por dia (para todo o período, não só o mês atual)
            const currentCount = dayCountMap.get(eventDate) || 0;
            dayCountMap.set(eventDate, currentCount + 1);
        });
        
        console.log('📊 Total de dias com reservas no mês:', daysSet.size);
        console.log('📋 Dias:', Array.from(daysSet));
        
        setDaysWithReservations(daysSet);
        setReservationsPerDay(dayCountMap);
        
        console.log('✔️ Processamento concluído com sucesso');
    }, [reservations, rooms, selectedRoom, currentMonth]);

    return {
        calendarEvents,
        todayReservations,
        daysWithReservations,
        reservationsPerDay
    };
};

