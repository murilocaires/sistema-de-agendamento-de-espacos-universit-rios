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

// Formatar hora para exibição
export const formatTime = (date) => {
    return moment(date).format('HH:mm');
};

// Formatar data e hora
export const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return moment(dateTime).format('DD/MM/YYYY [às] HH:mm');
};

// Gerar dias do calendário pequeno
export const generateCalendarDays = (currentMonth) => {
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

