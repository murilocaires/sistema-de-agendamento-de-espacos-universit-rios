import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar, MapPin, ChevronDown, X } from "lucide-react";

const FiltersSection = ({ 
    searchTerm, 
    onSearchChange, 
    selectedRoom, 
    onRoomChange, 
    filteredRooms,
    selectedDate,
    onDateChange 
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const dropdownRef = useRef(null);

    // Encontrar a sala selecionada
    const selectedRoomData = filteredRooms.find(room => room.id.toString() === selectedRoom);

    // Atualizar inputValue quando selectedRoom muda
    useEffect(() => {
        if (selectedRoomData) {
            setInputValue(`${selectedRoomData.name} - ${selectedRoomData.location}`);
        } else {
            setInputValue("");
        }
    }, [selectedRoom, selectedRoomData]);

    // Filtrar salas baseado no input
    const filteredRoomsForDropdown = filteredRooms.filter(room => 
        room.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        room.location.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Fechar dropdown quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setIsDropdownOpen(true);
        
        // Se limpar o input, limpar a seleção
        if (value === "") {
            onRoomChange("");
        }
    };

    const handleRoomSelect = (room) => {
        setInputValue(`${room.name} - ${room.location}`);
        onRoomChange(room.id.toString());
        setIsDropdownOpen(false);
    };

    const handleClearSelection = () => {
        setInputValue("");
        onRoomChange("");
        setIsDropdownOpen(false);
    };

    return (
        <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Campo de Busca/Filtro de Sala */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar e Filtrar por Sala
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Digite o nome ou localização da sala..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full pl-9 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        
                        {/* Botões de ação */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                            {selectedRoom && (
                                <button
                                    onClick={handleClearSelection}
                                    className="p-1 hover:bg-gray-100/20 rounded text-gray-400 hover:text-gray-200"
                                    title="Limpar seleção"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="p-1 hover:bg-gray-100/20 rounded text-gray-400 hover:text-gray-200"
                            >
                                <ChevronDown 
                                    size={14} 
                                    className={` transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                />
                            </button>
                        </div>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredRoomsForDropdown.length > 0 ? (
                                    filteredRoomsForDropdown.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => handleRoomSelect(room)}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100/10 transition-colors ${
                                                selectedRoom === room.id.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                            }`}
                                        >
                                            <div className="font-medium">{room.name}<span className="text-gray-700 text-sm ml-2">-<span className="ml-2">{room.location}</span></span></div>
                                        
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-300 text-sm">
                                        Nenhuma sala encontrada
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Seletor de Data */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filtrar por Data
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="date"
                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => onDateChange(e.target.value ? new Date(e.target.value) : null)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersSection;
