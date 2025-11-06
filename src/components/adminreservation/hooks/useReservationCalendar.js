import { useState, useEffect } from 'react';
import moment from 'moment';
import { expandRecurringReservations } from '../utils/reservationUtils';

export const useReservationCalendar = (allReservations, selectedRoom, rooms, formData, users) => {
    const [roomReservations, setRoomReservations] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());

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

    return {
        roomReservations,
        calendarDate,
        setCalendarDate
    };
};

