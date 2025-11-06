import { useState, useEffect } from 'react';
import { createReservation } from '../../../services/authService';
import { validateTimes, validateRoomRecurrence, validateReservationConflicts } from '../utils/reservationUtils';
import { expandRecurringReservations } from '../utils/reservationUtils';

export const useReservationForm = (user, rooms, allReservations, selectedRoom, setSelectedRoom) => {
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

    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Manipular mudanças no formulário
    const handleInputChange = async (e) => {
        const { name, value, type, checked } = e.target;
        
        // Verificar se está tentando marcar recorrência em sala que não permite
        if (name === 'is_recurring' && checked && selectedRoom && 
            (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1)) {
            setError(`Esta sala (${selectedRoom.name}) não permite reservas recorrentes.`);
            return;
        }
        
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
        }

    };

    // Submeter formulário
    const handleSubmit = async (e, refreshReservations) => {
        e.preventDefault();
        setFormLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Validações
            const timeError = validateTimes(formData.start_date, formData.start_time, formData.end_time);
            if (timeError) {
                setError(timeError);
                setFormLoading(false);
                return;
            }

            // Validar se a sala permite recorrência
            const room = rooms.find(r => r.id === parseInt(formData.room_id));
            const recurrenceError = validateRoomRecurrence(room, formData.is_recurring);
            if (recurrenceError) {
                setError(recurrenceError);
                setFormLoading(false);
                return;
            }

            // Validar conflitos com reservas existentes
            const conflictError = validateReservationConflicts(formData, allReservations, expandRecurringReservations);
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
            if (refreshReservations) {
                await refreshReservations();
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
            
            // Limpar seleção de sala
            setSelectedRoom(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
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
        setError("");
        setSuccessMessage("");
    };

    return {
        formData,
        setFormData,
        formLoading,
        error,
        setError,
        successMessage,
        handleInputChange,
        handleSubmit,
        resetForm
    };
};

