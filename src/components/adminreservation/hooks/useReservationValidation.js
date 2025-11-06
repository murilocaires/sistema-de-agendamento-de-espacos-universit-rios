import { useEffect } from 'react';
import { validateRoomRecurrence, validateReservationConflicts } from '../utils/reservationUtils';
import { expandRecurringReservations } from '../utils/reservationUtils';

export const useReservationValidation = (formData, rooms, allReservations, setError) => {
    useEffect(() => {
        // Validar se a sala permite recorrência
        if (formData.is_recurring && formData.room_id) {
            const room = rooms.find(r => r.id === parseInt(formData.room_id));
            const recurrenceError = validateRoomRecurrence(room, formData.is_recurring);
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
            const conflictError = validateReservationConflicts(formData, allReservations, expandRecurringReservations);
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
};

