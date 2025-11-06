import moment from 'moment';

// Função para expandir reservas recorrentes
export const expandRecurringReservations = (reservation) => {
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

// Validar horários
export const validateTimes = (startDate, startTime, endTime) => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);
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

// Validar se a sala permite recorrência
export const validateRoomRecurrence = (room, isRecurring) => {
    if (!room || !isRecurring) {
        return null;
    }

    // Verificar se a sala é de reserva fixa (não permite recorrência)
    const isFixed = room.is_fixed_reservation === true || room.is_fixed_reservation === 1;
    if (isFixed) {
        return `Esta sala (${room.name}) não permite reservas recorrentes. Desmarque a opção "Reserva Recorrente" para continuar.`;
    }

    return null;
};

// Validar conflitos com reservas existentes
export const validateReservationConflicts = (formData, allReservations, expandRecurringReservationsFn) => {
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
                const occurrences = expandRecurringReservationsFn(reservation);
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

