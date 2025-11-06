import React from 'react';
import { Search, MapPin, CheckCircle, X, ChevronDown } from 'lucide-react';

export const RoomFilter = ({
    searchTerm,
    selectedRoom,
    selectedRoomData,
    filteredRooms,
    showRoomSuggestions,
    onSearchChange,
    onRoomSelect,
    onClearSelection,
    onFocus
}) => {
    return (
        <div className="bg-white rounded-lg shadow border p-4 mb-6 room-filter-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar e Filtrar por Sala
            </label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Digite para buscar sala ou localização..."
                        value={searchTerm}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            if (e.target.value === '') {
                                onRoomSelect('');
                            }
                        }}
                        onFocus={onFocus}
                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {selectedRoom && (
                        <button
                            onClick={onClearSelection}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Limpar seleção"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <ChevronDown 
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform ${showRoomSuggestions ? 'rotate-180' : ''}`}
                        size={16}
                    />
                </div>
                
                {/* Dropdown de Sugestões */}
                {showRoomSuggestions && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Opção "Todas as salas" */}
                        <button
                            onClick={() => onRoomSelect('')}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100/10 transition-colors text-sm ${
                                selectedRoom === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span>Todas as salas</span>
                            </div>
                        </button>
                        
                        {/* Lista de salas filtradas */}
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => onRoomSelect(room.id)}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100/10 transition-colors text-sm border-t border-gray-100 ${
                                        selectedRoom === room.id.toString() ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" />
                                        <div>
                                            <div className="font-medium">{room.name}</div>
                                            <div className="text-xs text-gray-500">{room.location}</div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Nenhuma sala encontrada
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Sala selecionada (feedback visual) */}
            {selectedRoom && selectedRoomData && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle size={14} />
                    <span>Filtrando por: <strong>{selectedRoomData.name} - {selectedRoomData.location}</strong></span>
                </div>
            )}
        </div>
    );
};

