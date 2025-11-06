import React from 'react';
import { 
    Users as UsersIcon, 
    DoorClosed, 
    Calendar, 
    Clock, 
    Repeat, 
    AlertCircle, 
    Save 
} from 'lucide-react';
import { SearchableUserInput } from './SearchableUserInput';
import { SearchableRoomInput } from './SearchableRoomInput';

export const ReservationForm = ({
    formData,
    selectedRoom,
    users,
    rooms,
    formLoading,
    onInputChange,
    onUserSelect,
    onUserClear,
    onRoomSelect,
    onRoomClear,
    onSubmit,
    onReset
}) => {
    return (
        <div className="bg-white rounded-lg shadow border p-4 max-h-[calc(100vh-12rem)] overflow-y-auto form-scroll form-container">
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Usuário e Sala */}
                <div className="grid grid-cols-1 gap-4">
                    <SearchableUserInput
                        users={users}
                        selectedUserId={formData.user_id}
                        onSelect={onUserSelect}
                        onClear={onUserClear}
                        required={true}
                    />

                    <SearchableRoomInput
                        rooms={rooms}
                        selectedRoomId={formData.room_id}
                        onSelect={onRoomSelect}
                        onClear={onRoomClear}
                        required={true}
                    />
                </div>

                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título da Reserva
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={onInputChange}
                        required
                        placeholder="Ex: Reunião de Coordenação"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onInputChange}
                        rows={2}
                        placeholder="Detalhes adicionais sobre a reserva..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Quantidade de Pessoas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UsersIcon size={16} className="inline mr-1" />
                        Quantidade de Pessoas
                    </label>
                    <input
                        type="number"
                        name="people_count"
                        value={formData.people_count}
                        onChange={onInputChange}
                        min="1"
                        max={selectedRoom ? selectedRoom.capacity : 100}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite a quantidade de pessoas"
                    />
                    {selectedRoom && (
                        <p className="mt-1 text-sm text-gray-600">
                            Capacidade da sala: {selectedRoom.capacity} pessoas
                        </p>
                    )}
                </div>

                {/* Data e Horários */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-1" />
                            Data
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={onInputChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock size={16} className="inline mr-1" />
                            Hora de Início
                        </label>
                        <input
                            type="time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock size={16} className="inline mr-1" />
                            Hora de Fim
                        </label>
                        <input
                            type="time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Recorrência */}
                <div className="border-t pt-4">
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={onInputChange}
                            disabled={selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1)}
                            className="mr-2"
                        />
                        <label className={`text-sm font-medium ${selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1) ? 'text-gray-400' : 'text-gray-700'}`}>
                            <Repeat size={16} className="inline mr-1" />
                            Reserva Recorrente
                        </label>
                    </div>
                    {selectedRoom && (selectedRoom.is_fixed_reservation === true || selectedRoom.is_fixed_reservation === 1) && (
                        <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                            <AlertCircle size={14} />
                            Esta sala não permite reservas recorrentes
                        </p>
                    )}

                    {formData.is_recurring && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Recorrência
                                </label>
                                <select
                                    name="recurrence_type"
                                    value={formData.recurrence_type}
                                    onChange={onInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="daily">Diária</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Data Limite da Recorrência
                                </label>
                                <input
                                    type="date"
                                    name="recurrence_end_date"
                                    value={formData.recurrence_end_date}
                                    onChange={onInputChange}
                                    min={formData.start_date}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Limpar
                    </button>
                    <button
                        type="submit"
                        disabled={formLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {formLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Criando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Criar Reserva
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

