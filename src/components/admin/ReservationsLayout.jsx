import React from "react";
import { CheckCircle, Clock, X, Filter, DoorClosed, Calendar, User, AlertTriangle, Info, Check } from "lucide-react";

const ReservationsLayout = ({
  reservations,
  approvedReservations,
  rejectedReservations,
  rooms,
  selectedRoom,
  setSelectedRoom,
  loading,
  error,
  successMessage,
  viewType,
  setViewType,
  isMinimized,
  setIsMinimized,
  filterType,
  setFilterType,
  getFilteredReservations,
  selectRoomFromReservation,
  formatDateTime,
  getPriorityColor,
  getPriorityText,
  openDetailsModal,
  openRejectModal,
  handleApprove,
  processingIds,
  getSelectedRoomName,
  getWeekDays,
  getReservationsForDay,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-700">Pendentes</p>
                <p className="text-xl font-bold text-orange-600">{reservations.length}</p>
              </div>
              <Clock className="text-orange-400" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-700">Aprovadas</p>
                <p className="text-xl font-bold text-green-600">{approvedReservations.length}</p>
              </div>
              <CheckCircle className="text-green-400" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-700">Reprovadas</p>
                <p className="text-xl font-bold text-red-600">{rejectedReservations.length}</p>
              </div>
              <X className="text-red-400" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-700">Total</p>
                <p className="text-xl font-bold text-blue-600">{reservations.length + approvedReservations.length + rejectedReservations.length}</p>
              </div>
              <Filter className="text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {viewType === 'approved' ? 'Reservas Aprovadas' : viewType === 'rejected' ? 'Reservas Reprovadas' : 'Reservas Pendentes'}
            </h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={isMinimized} onChange={(e) => setIsMinimized(e.target.checked)} className="sr-only peer" />
                  <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                    {isMinimized && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700">Minimizar</span>
              </label>

              <div className="flex rounded-lg p-1">
                <button onClick={() => setViewType('pending')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewType === 'pending' ? 'bg-gray-500/20 text-black shadow-sm font-medium' : 'text-gray-700 hover:text-gray-900'}`}>Pendentes</button>
                <button onClick={() => setViewType('approved')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewType === 'approved' ? 'bg-gray-500/20 text-black shadow-sm font-medium' : 'text-gray-700 hover:text-gray-900'}`}>Aprovadas</button>
                <button onClick={() => setViewType('rejected')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewType === 'rejected' ? 'bg-gray-500/20 text-black font-medium' : 'text-gray-700 hover:text-gray-900'}`}>Reprovadas</button>
              </div>

              <div className="relative">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">Todas</option>
                  <option value="today">Hoje</option>
                  <option value="upcoming">Futuras</option>
                  <option value="past">Passadas</option>
                  <option value="oldest">Mais Antigas</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-600">Carregando...</p>
          </div>
        ) : getFilteredReservations(viewType === 'approved' ? approvedReservations : viewType === 'rejected' ? rejectedReservations : reservations).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow border">
            <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{viewType === 'approved' ? 'Nenhuma reserva aprovada' : viewType === 'rejected' ? 'Nenhuma reserva reprovada' : 'Nenhuma reserva pendente'}</h3>
            <p className="mt-1 text-xs text-gray-500">{viewType === 'approved' ? 'Ainda não há reservas aprovadas' : viewType === 'rejected' ? 'Ainda não há reservas reprovadas' : 'Todas as reservas foram processadas!'}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-screen overflow-y-auto pr-2">
            {getFilteredReservations(viewType === 'approved' ? approvedReservations : viewType === 'rejected' ? rejectedReservations : reservations).map((reservation) => (
              isMinimized ? (
                <div key={reservation.id} className="bg-white rounded-lg shadow border p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => selectRoomFromReservation(reservation)}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <DoorClosed size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{reservation.room_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{formatDateTime(reservation.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{reservation.user_name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{reservation.title}</span>
                    {reservation.status === 'approved' && (<span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Aprovada</span>)}
                    {reservation.status === 'professor_approved' && (<span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Aprovada pelo Professor</span>)}
                    {reservation.status === 'pending' && (<span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">Pendente</span>)}
                    {reservation.status === 'rejected' && (<span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Reprovada</span>)}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openDetailsModal(reservation); }} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">Ver detalhes</button>
                </div>
              ) : (
                <div key={reservation.id} className="bg-white rounded-lg shadow border p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => selectRoomFromReservation(reservation)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">{reservation.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(reservation.priority)}`}>{getPriorityText(reservation.priority)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatDateTime(reservation.created_at)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openDetailsModal(reservation); }} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Ver detalhes">
                      <Info size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-500" size={14} />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{reservation.user_name}</p>
                        <p className="text-xs text-gray-700">{reservation.user_role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DoorClosed className="text-gray-700" size={14} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">{reservation.room_name}</p>
                        <p className="text-xs text-gray-700">{reservation.room_location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-700" size={14} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">{new Date(reservation.start_time).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-700">{new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-700" size={14} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">{new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                        <p className="text-xs text-gray-700">{Math.round((new Date(reservation.end_time) - new Date(reservation.start_time)) / (1000 * 60))}min</p>
                      </div>
                    </div>
                  </div>

                  {reservation.is_recurring && (
                    <div className="mb-3 p-2 bg-blue-50 rounded flex items-center gap-2">
                      <AlertTriangle className="text-blue-600" size={14} />
                      <p className="text-xs text-blue-800">Recorrente ({reservation.recurrence_type})</p>
                    </div>
                  )}

                  {viewType === 'pending' && (
                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button onClick={(e) => { e.stopPropagation(); openRejectModal(reservation); }} disabled={processingIds.has(reservation.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 flex items-center gap-1">
                        {processingIds.has(reservation.id) ? (<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>) : (<X size={14} />)}
                        Rejeitar
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(reservation.id); }} disabled={processingIds.has(reservation.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                        {processingIds.has(reservation.id) ? (<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>) : (<Check size={14} />)}
                        {reservation.status === 'professor_approved' ? 'Aprovar Final' : 'Aprovar'}
                      </button>
                    </div>
                  )}

                  {viewType === 'approved' && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Aprovada</span>
                        {reservation.approved_by_name && (<span className="text-xs text-gray-700">por {reservation.approved_by_name}</span>)}
                      </div>
                    </div>
                  )}

                  {viewType === 'rejected' && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">✗ Reprovada</span>
                        {reservation.rejection_reason && (<span className="text-xs text-gray-700">{reservation.rejection_reason}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Agenda Semanal</h3>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione uma sala</option>
              {rooms.map(room => (<option key={room.id} value={room.id}>{room.name} - {room.location}</option>))}
            </select>
          </div>

          {selectedRoom ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{getSelectedRoomName()}</h4>
              <div className="space-y-2">
                {getWeekDays().map((day, index) => {
                  const dayReservations = getReservationsForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                  return (
                    <div key={index} className={`p-2 rounded-lg border ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-medium ${isToday ? 'text-blue-800' : 'text-gray-700'}`}>{dayNames[day.getDay()]} {day.getDate().toString().padStart(2, '0')}/{(day.getMonth() + 1).toString().padStart(2, '0')}</span>
                        <span className="text-xs text-gray-600">{dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-1">
                        {dayReservations.length === 0 ? (
                          <p className="text-xs text-gray-700 italic">Nenhuma reserva</p>
                        ) : (
                          dayReservations.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map((reservation) => (
                            <div key={reservation.id} className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => openDetailsModal(reservation)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-800 truncate">{reservation.title}</p>
                                  <p className="text-xs text-gray-700">{reservation.user_name}</p>
                                </div>
                                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${getPriorityColor(reservation.priority)}`}>{getPriorityText(reservation.priority)[0]}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <Clock className="text-gray-700" size={10} />
                                <span className="text-xs text-gray-700">{new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DoorClosed className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Selecione uma sala para ver a agenda semanal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsLayout;


