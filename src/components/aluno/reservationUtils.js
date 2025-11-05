// Funções utilitárias para verificação de recorrência e ocorrências futuras

/**
 * Calcular ocorrências futuras de uma reserva recorrente
 */
export const calculateFutureRecurrenceDates = (reservation) => {
  // Verificar se é recorrente e tem data de início
  if (!reservation?.recurrence_type) {
    return [];
  }

  // Obter data de início (pode ser start_time ou date)
  let startDateTime;
  if (reservation.start_time) {
    startDateTime = new Date(reservation.start_time);
  } else if (reservation.date) {
    // Se usar date, construir datetime com start_time ou início do dia
    const dateStr = reservation.date.includes('T') 
      ? reservation.date 
      : `${reservation.date}T00:00:00`;
    startDateTime = new Date(dateStr);
  } else {
    return [];
  }

  const now = new Date();
  const startDate = new Date(startDateTime);
  const endDate = reservation.recurrence_end_date ? new Date(reservation.recurrence_end_date) : null;
  
  // Normalizar endDate para fim do dia para comparação correta
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }
  
  // Obter horário de término da reserva original
  let originalEndTime;
  if (reservation.end_time) {
    originalEndTime = new Date(reservation.end_time);
  } else if (reservation.date && reservation.end_time) {
    // Construir end_time a partir de date + end_time
    const dateStr = reservation.date.includes('T') 
      ? reservation.date.split('T')[0]
      : reservation.date;
    originalEndTime = new Date(`${dateStr}T${reservation.end_time}`);
  } else {
    // Se não tem end_time, usar mesma data/hora (duração zero)
    originalEndTime = new Date(startDateTime);
  }
  
  // Calcular duração em milissegundos
  const duration = originalEndTime.getTime() - startDateTime.getTime();
  
  const interval = reservation.recurrence_interval || 1;
  const dates = [];

  // Limitar a 100 ocorrências para não sobrecarregar
  const maxOccurrences = 100;
  let currentDate = new Date(startDate);
  let count = 0;

  while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
    // Calcular o horário de término desta ocorrência
    const occurrenceEndTime = new Date(currentDate.getTime() + duration);
    
    // Se a ocorrência ainda não passou (incluindo hoje - verificar se o horário de término >= agora)
    if (occurrenceEndTime >= now) {
      dates.push(new Date(currentDate));
    }
    
    count++;

    // Calcular próxima data baseado no tipo
    switch (reservation.recurrence_type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      default:
        return dates; // Se tipo não reconhecido, retorna o que tem
    }

    // Se já passamos a data final, não precisa continuar
    if (endDate && currentDate > endDate) {
      break;
    }
  }

  return dates;
};

/**
 * Verificar se uma reserva tem ocorrências futuras
 */
export const hasFutureOccurrences = (reservation) => {
  const now = new Date();

  // Se for reserva recorrente, verificar ocorrências futuras
  if (reservation.is_recurring || reservation.recurrence_type) {
    const futureDates = calculateFutureRecurrenceDates(reservation);
    return futureDates.length > 0;
  }

  // Para reservas únicas, verificar se o horário final não passou
  if (reservation.start_time && reservation.end_time) {
    const endDateTime = new Date(reservation.end_time);
    return endDateTime >= now;
  }

  // Se usar date e end_time (formato antigo)
  if (reservation.date && reservation.end_time) {
    let reservationEndDateTime;
    
    if (reservation.date.includes('T')) {
      reservationEndDateTime = new Date(reservation.date);
    } else {
      reservationEndDateTime = new Date(`${reservation.date}T${reservation.end_time}`);
    }
    
    if (isNaN(reservationEndDateTime.getTime())) {
      return true; // Se data inválida, considerar como válida
    }
    
    return reservationEndDateTime >= now;
  }

  // Se não há data ou horário, considerar como válida
  return true;
};

