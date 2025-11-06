import React, { useState, useEffect } from 'react';
import { DoorClosed, Search, X } from 'lucide-react';

export const SearchableRoomInput = ({ rooms, selectedRoomId, onSelect, onClear, required = false }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.room-search-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const getRoomName = (roomId) => {
        const foundRoom = rooms.find(r => r.id === parseInt(roomId));
        return foundRoom ? `${foundRoom.name} - ${foundRoom.location}` : 'Sala não encontrada';
    };

    const filteredRooms = searchTerm.trim() === "" 
        ? rooms 
        : rooms.filter(room => {
            const searchLower = searchTerm.toLowerCase();
            const roomName = room.name.toLowerCase();
            const roomLocation = room.location.toLowerCase();
            return roomName.includes(searchLower) || roomLocation.includes(searchLower);
        });

    const handleClear = () => {
        setSearchTerm("");
        setIsDropdownOpen(false);
        if (onClear) onClear();
    };

    return (
        <div className="relative room-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <DoorClosed size={16} className="inline mr-1" />
                Sala
            </label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={selectedRoomId ? getRoomName(selectedRoomId) : searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (selectedRoomId) {
                                handleClear();
                                setSearchTerm(value);
                            } else {
                                setSearchTerm(value);
                            }
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => {
                            if (!selectedRoomId) {
                                setIsDropdownOpen(true);
                            }
                        }}
                        placeholder={selectedRoomId ? "" : "Digite para buscar uma sala..."}
                        required={required && !selectedRoomId}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedRoomId && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClear();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                {isDropdownOpen && !selectedRoomId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map(room => (
                                <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(room.id);
                                        setSearchTerm("");
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                >
                                    <div className="font-medium text-gray-900">{room.name}</div>
                                    <div className="text-sm text-gray-600">{room.location} - Capacidade: {room.capacity}</div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                                Nenhuma sala encontrada
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

