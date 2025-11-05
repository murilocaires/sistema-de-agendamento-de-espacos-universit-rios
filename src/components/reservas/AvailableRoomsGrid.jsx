import React from "react";

const AvailableRoomsGrid = ({
  availableRooms,
  selectedRoom,
  onSelectRoom,
  formData,
  showProjectSelection
}) => {
  if (availableRooms.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
        <h3 className="font-medium text-gray-900 mb-4">Salas Disponíveis</h3>
        
        {/* Grid de Salas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableRooms.map(room => (
            <div
              key={room.id}
              className={`px-1 py-2 rounded-lg text-center text-[10px] font-medium cursor-pointer transition-colors flex items-center justify-center min-h-[40px] max-h-[40px] overflow-hidden focus:outline-none ${
                selectedRoom?.id === room.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onClick={() => onSelectRoom(room)}
              tabIndex={0}
            >
              <span className="break-words leading-tight text-center w-full">{room.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {formData.is_recurring && formData.date && formData.start_time && formData.end_time && formData.people_count
            ? "Nenhuma sala disponível"
            : "Preencha todos os campos obrigatórios"
          }
        </h3>
        <p className="text-sm text-gray-500">
          {formData.is_recurring && formData.date && formData.start_time && formData.end_time && formData.people_count ? (
            <>
              Não há salas disponíveis para reserva recorrente neste horário.
              <br />
              <span className="text-xs mt-2 block text-gray-400">
                • Salas com "Reserva Fixa" ativada não aparecem em reservas recorrentes<br />
                • Algumas salas podem estar ocupadas em uma ou mais datas da recorrência<br />
                • Tente ajustar o horário, frequência ou período da recorrência
              </span>
            </>
          ) : (
            <>
              Para ver as salas disponíveis, preencha: {showProjectSelection && "projeto, "}descrição, data, horários e quantidade de participantes.
              {formData.is_recurring && " Se for recorrente, também selecione a frequência e data final."}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AvailableRoomsGrid;

