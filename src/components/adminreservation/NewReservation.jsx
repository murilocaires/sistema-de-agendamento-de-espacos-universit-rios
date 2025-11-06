import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, CheckCircle } from "lucide-react";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../Calendar.css';

// Hooks
import { useReservationData } from './hooks/useReservationData';
import { useReservationForm } from './hooks/useReservationForm';
import { useReservationCalendar } from './hooks/useReservationCalendar';
import { useReservationValidation } from './hooks/useReservationValidation';

// Components
import { ReservationForm } from './components/ReservationForm';
import { ReservationCalendar } from './components/ReservationCalendar';

const NewReservation = ({ embed = false }) => {
    const { user } = useAuth();
    const userType = user?.role || "admin";
    const menuItems = getUserMenu(userType);
    const userTypeDisplay = getUserTypeDisplay(userType);

    // Estados locais
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Hooks de dados
    const { 
        rooms, 
        users, 
        loading, 
        allReservations, 
        error: dataError, 
        setError: setDataError,
        refreshReservations 
    } = useReservationData();

    // Hook do formulário
    const {
        formData,
        setFormData,
        formLoading,
        error: formError,
        setError: setFormError,
        successMessage,
        handleInputChange,
        handleSubmit: handleFormSubmit,
        resetForm
    } = useReservationForm(
        user, 
        rooms, 
        allReservations, 
        selectedRoom, 
        setSelectedRoom
    );

    // Hook do calendário
    const {
        roomReservations,
        calendarDate,
        setCalendarDate
    } = useReservationCalendar(
        allReservations, 
        selectedRoom, 
        rooms, 
        formData, 
        users
    );

    // Atualizar setCalendarDate no hook do formulário
    const handleInputChangeWithCalendar = (e) => {
        handleInputChange(e);
        // Se mudou a data, atualizar o calendário
        if (e.target.name === 'start_date' && e.target.value) {
            const [year, month, day] = e.target.value.split('-').map(Number);
            const selectedDate = new Date(year, month - 1, day);
            setCalendarDate(selectedDate);
        }
    };

    // Validação em tempo real
    useReservationValidation(formData, rooms, allReservations, setFormError);

    // Selecionar sala (atualiza o filtro)
    const handleRoomSelect = (roomId) => {
        if (!roomId) {
            setSelectedRoom(null);
            setFormData(prev => ({
                ...prev,
                room_id: ""
            }));
            return;
        }

        const room = rooms.find(r => r.id === parseInt(roomId));
        setSelectedRoom(room);
        
        // Se a sala não permite recorrência, desmarcar checkbox de recorrência
        const isFixed = room && (room.is_fixed_reservation === true || room.is_fixed_reservation === 1);
        
        setFormData(prev => ({
            ...prev,
            room_id: roomId,
            ...(isFixed ? { is_recurring: false, recurrence_end_date: "" } : {})
        }));
    };

    // Limpar seleção de sala
    const handleRoomClear = () => {
        setFormData(prev => ({
            ...prev,
            room_id: ""
        }));
        setSelectedRoom(null);
    };

    // Selecionar usuário
    const handleUserSelect = (userId) => {
        setFormData(prev => ({
            ...prev,
            user_id: userId
        }));
    };

    // Limpar seleção de usuário
    const handleUserClear = () => {
        setFormData(prev => ({
            ...prev,
            user_id: user?.id || ""
        }));
    };

    // Submit handler
    const handleSubmit = (e) => {
        handleFormSubmit(e, refreshReservations);
    };

    // Reset handler
    const handleReset = () => {
        resetForm();
        setSelectedRoom(null);
        setCalendarDate(new Date());
    };

    // Combinar erros
    const error = formError || dataError;

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
                <ReservationForm
                    formData={formData}
                    selectedRoom={selectedRoom}
                    users={users}
                    rooms={rooms}
                    formLoading={formLoading}
                    onInputChange={handleInputChangeWithCalendar}
                    onUserSelect={handleUserSelect}
                    onUserClear={handleUserClear}
                    onRoomSelect={handleRoomSelect}
                    onRoomClear={handleRoomClear}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                />
                
                {/* Calendário */}
                <ReservationCalendar
                    events={roomReservations}
                    calendarDate={calendarDate}
                    onNavigate={setCalendarDate}
                    selectedRoom={selectedRoom}
                />
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
