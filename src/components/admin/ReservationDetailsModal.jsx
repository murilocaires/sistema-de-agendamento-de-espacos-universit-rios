import React from "react";
import { X, AlertTriangle, Clock, Info, DoorClosed, Calendar, User } from "lucide-react";

const ReservationDetailsModal = ({
  open,
  reservation,
  onClose,
  onApprove,
  onReject,
  formatDateTime,
  getPriorityColor,
  getPriorityText,
  user,
}) => {
  if (!open || !reservation) return null;
  const detailsReservation = reservation;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalhes da Reserva</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <p className="text-sm text-gray-900">{detailsReservation.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prioridade</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(detailsReservation.priority)}`}>
                {getPriorityText(detailsReservation.priority)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Solicitante</label>
              <p className="text-sm text-gray-900">{detailsReservation.user_name}</p>
              <p className="text-xs text-gray-700">{detailsReservation.user_email} ({detailsReservation.user_role})</p>
              {detailsReservation.user_matricula && (
                <p className="text-xs text-gray-600">Matrícula: {detailsReservation.user_matricula}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sala</label>
              <p className="text-sm text-gray-900">{detailsReservation.room_name}</p>
              <p className="text-xs text-gray-700">{detailsReservation.room_location} (Cap: {detailsReservation.room_capacity})</p>
              {detailsReservation.room_description && (
                <p className="text-xs text-gray-600">{detailsReservation.room_description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data/Hora Início</label>
              <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.start_time)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data/Hora Fim</label>
              <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.end_time)}</p>
            </div>
          </div>

          {detailsReservation.project_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projeto Associado</label>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-medium text-blue-900">{detailsReservation.project_name}</p>
                <p className="text-xs text-blue-700">Tipo: {detailsReservation.project_type}</p>
                {(detailsReservation.project_professor_name || detailsReservation.project_professor_email) && (
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Responsável:</strong> {detailsReservation.project_professor_name}
                    {detailsReservation.project_professor_email && <span> ({detailsReservation.project_professor_email})</span>}
                  </p>
                )}
                {detailsReservation.project_description && (
                  <p className="text-xs text-blue-600 mt-1">{detailsReservation.project_description}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recursos da Sala</label>
            <div className="flex flex-wrap gap-2">
              {detailsReservation.has_projector && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Projetor</span>
              )}
              {detailsReservation.has_internet && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Internet</span>
              )}
              {detailsReservation.has_air_conditioning && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Ar Condicionado</span>
              )}
              {!detailsReservation.has_projector && !detailsReservation.has_internet && !detailsReservation.has_air_conditioning && (
                <span className="px-2 py-1 text-xs bg-gray-100/10 text-gray-600 rounded-full">Recursos básicos</span>
              )}
            </div>
          </div>

          {detailsReservation.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{detailsReservation.description}</p>
            </div>
          )}

          {detailsReservation.is_recurring && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Tipo:</strong> {detailsReservation.recurrence_type}
                </p>
                {detailsReservation.recurrence_interval && (
                  <p className="text-sm text-blue-700">
                    <strong>Intervalo:</strong> {detailsReservation.recurrence_interval}
                  </p>
                )}
                {detailsReservation.recurrence_end_date && (
                  <p className="text-sm text-blue-600">
                    <strong>Até:</strong> {formatDateTime(detailsReservation.recurrence_end_date)}
                  </p>
                )}
                <p className="text-xs text-blue-500 mt-2">Esta reserva se repete automaticamente conforme a configuração acima.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Duração</label>
            <p className="text-sm text-gray-900">
              {Math.round((new Date(detailsReservation.end_time) - new Date(detailsReservation.start_time)) / (1000 * 60))} minutos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantidade de Pessoas</label>
            <p className="text-sm text-gray-900">
              {detailsReservation.people_count} pessoa{detailsReservation.people_count !== 1 ? 's' : ''}
            </p>
            {detailsReservation.room_capacity && (
              <p className="text-xs text-gray-600">Capacidade da sala: {detailsReservation.room_capacity} pessoas</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status Atual</label>
            <div className="flex items-center gap-2">
              {detailsReservation.status === 'pending' && (
                <span className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">⏳ Pendente</span>
              )}
              {detailsReservation.status === 'professor_approved' && (
                <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">👨‍🏫 Aprovada pelo Professor</span>
              )}
              {detailsReservation.status === 'approved' && (
                <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">✅ Aprovada</span>
              )}
              {detailsReservation.status === 'rejected' && (
                <span className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">❌ Rejeitada</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Solicitado em</label>
            <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.created_at)}</p>
          </div>

          {detailsReservation.status === 'approved' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Aprovada em</label>
              <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.approved_at)}</p>
              {detailsReservation.approved_by_name && (
                <p className="text-xs text-gray-600">por {detailsReservation.approved_by_name}</p>
              )}
            </div>
          )}

          {detailsReservation.status === 'professor_approved' && detailsReservation.professor_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Aprovada pelo Professor</label>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-900">{detailsReservation.professor_name}</p>
                {detailsReservation.professor_email && <p className="text-xs text-gray-600">{detailsReservation.professor_email}</p>}
                <p className="text-xs text-gray-600">{formatDateTime(detailsReservation.professor_approved_at)}</p>
              </div>
            </div>
          )}

          {detailsReservation.status === 'rejected' && detailsReservation.rejection_reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
              <p className="text-sm text-gray-900 bg-red-50 p-3 rounded">{detailsReservation.rejection_reason}</p>
            </div>
          )}

          {detailsReservation.updated_at && detailsReservation.updated_at !== detailsReservation.created_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
              <p className="text-sm text-gray-900">{formatDateTime(detailsReservation.updated_at)}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">ID da Reserva</label>
            <p className="text-sm text-gray-500 font-mono">#{detailsReservation.id}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Fechar</button>
          {(detailsReservation.status === 'pending' || detailsReservation.status === 'professor_approved') ? (
            <>
              <button onClick={() => onReject(detailsReservation)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">Rejeitar</button>
              <button onClick={() => onApprove(detailsReservation.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700">{detailsReservation.status === 'professor_approved' ? 'Aprovar Final' : 'Aprovar'}</button>
            </>
          ) : detailsReservation.status === 'approved' ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">✓ Já Aprovada</span>
              {user?.role === 'admin' && (
                <button onClick={() => onReject(detailsReservation)} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100" title="Revogar aprovação">Revogar</button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">✗ Rejeitada</span>
              <button onClick={() => onApprove(detailsReservation.id)} className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700" title="Aprovar reserva rejeitada">Aprovar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;


