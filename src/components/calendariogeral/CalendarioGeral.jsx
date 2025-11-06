import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import moment from 'moment';
import 'moment/locale/pt-br';
import '../Calendar.css';
import ReservationDetailsModal from "../admin/ReservationDetailsModal";

// Hooks
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarFilters } from './hooks/useCalendarFilters';

// Components
import { MiniCalendar } from './components/MiniCalendar';
import { TodayReservations } from './components/TodayReservations';
import { RoomFilter } from './components/RoomFilter';
import { MainCalendar } from './components/MainCalendar';
import { ToastNotifications } from './components/ToastNotifications';

// Utils
import { formatDateTime } from './utils/calendarUtils';

const CalendarioGeral = () => {
    const { user } = useAuth();
    const userType = user?.role || "admin";
    const menuItems = getUserMenu(userType);
    const userTypeDisplay = getUserTypeDisplay(userType);

    // Estados do calendário
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [successMessage, setSuccessMessage] = useState("");

    // Estados do modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Hooks
    const { reservations, rooms, loading, error, setError } = useCalendarData();
    
    const {
        selectedRoom,
        setSelectedRoom,
        searchTerm,
        setSearchTerm,
        showRoomSuggestions,
        setShowRoomSuggestions,
        filteredRooms,
        selectedRoomData,
        handleRoomSelect,
        handleClearSelection
    } = useCalendarFilters(rooms);

    const {
        calendarEvents,
        todayReservations,
        daysWithReservations,
        reservationsPerDay
    } = useCalendarEvents(reservations, rooms, selectedRoom, currentMonth);

    // Navegar mês anterior/próximo
    const navigateMonth = (direction) => {
        const newMonth = moment(currentMonth).add(direction, 'month').toDate();
        console.log('🗓️  Navegando para:', moment(newMonth).format('MMMM YYYY'));
        setCurrentMonth(newMonth);
    };

    // Selecionar data e navegar calendário principal
    const selectDate = (date) => {
        const selectedDateObj = date.toDate();
        setSelectedDate(selectedDateObj);
    };

    // Abrir sala específica no calendário
    const openRoomCalendar = (roomId) => {
        setSelectedRoom(roomId.toString());
    };

    // Abrir modal de detalhes
    const openDetailsModal = (event) => {
        setSelectedReservation(event.resource.reservation);
        setShowDetailsModal(true);
    };

    return (
        <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Calendário Geral
                        </h1>
                        <p className="text-gray-700">
                            Visualização completa de todas as reservas confirmadas
                        </p>
                    </div>
                </div>

                {/* Toast Notifications */}
                <ToastNotifications
                    error={error}
                    successMessage={successMessage}
                    onCloseError={() => setError("")}
                    onCloseSuccess={() => setSuccessMessage("")}
                />

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-800">Carregando calendário...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Coluna Esquerda - Calendário Pequeno e Reservas de Hoje */}
                        <div className="xl:col-span-1 space-y-6">
                            <MiniCalendar
                                currentMonth={currentMonth}
                                selectedDate={selectedDate}
                                daysWithReservations={daysWithReservations}
                                reservationsPerDay={reservationsPerDay}
                                onNavigateMonth={navigateMonth}
                                onSelectDate={selectDate}
                            />

                            <TodayReservations
                                todayReservations={todayReservations}
                                onRoomClick={openRoomCalendar}
                            />
                        </div>

                        {/* Coluna Direita - Calendário Principal */}
                        <div className="xl:col-span-3">
                            <RoomFilter
                                searchTerm={searchTerm}
                                selectedRoom={selectedRoom}
                                selectedRoomData={selectedRoomData}
                                filteredRooms={filteredRooms}
                                showRoomSuggestions={showRoomSuggestions}
                                onSearchChange={setSearchTerm}
                                onRoomSelect={handleRoomSelect}
                                onClearSelection={handleClearSelection}
                                onFocus={() => setShowRoomSuggestions(true)}
                            />

                            <MainCalendar
                                events={calendarEvents}
                                selectedDate={selectedDate}
                                onNavigate={setSelectedDate}
                                onSelectEvent={openDetailsModal}
                            />
                        </div>
                    </div>
                )}

                {/* Overlay para fechar dropdown quando clicar fora */}
                {showRoomSuggestions && (
                    <div
                        className="fixed inset-0 z-[90]"
                        onClick={() => setShowRoomSuggestions(false)}
                    />
                )}

                {/* Modal de Detalhes da Reserva */}
                <ReservationDetailsModal
                    open={showDetailsModal}
                    reservation={selectedReservation}
                    onClose={() => setShowDetailsModal(false)}
                    onApprove={() => {}} // Apenas visualização
                    onReject={() => {}} // Apenas visualização
                    formatDateTime={formatDateTime}
                    user={user}
                />
            </div>
        </DashboardLayout>
    );
};

export default CalendarioGeral;

