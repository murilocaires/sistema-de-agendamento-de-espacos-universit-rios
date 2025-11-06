import { useState, useEffect } from 'react';

export const useCalendarFilters = (rooms) => {
    const [selectedRoom, setSelectedRoom] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);

    // Filtrar salas por busca
    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obter sala selecionada para exibição
    const selectedRoomData = rooms.find(room => room.id.toString() === selectedRoom);

    // Selecionar sala
    const handleRoomSelect = (roomId) => {
        if (roomId === '') {
            setSelectedRoom('');
            setSearchTerm('');
        } else {
            const room = rooms.find(r => r.id.toString() === roomId.toString());
            setSelectedRoom(roomId.toString());
            setSearchTerm(room ? `${room.name} - ${room.location}` : '');
        }
        setShowRoomSuggestions(false);
    };

    // Limpar seleção
    const handleClearSelection = () => {
        setSelectedRoom('');
        setSearchTerm('');
        setShowRoomSuggestions(false);
    };

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showRoomSuggestions && !event.target.closest('.room-filter-container')) {
                setShowRoomSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRoomSuggestions]);

    return {
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
    };
};

