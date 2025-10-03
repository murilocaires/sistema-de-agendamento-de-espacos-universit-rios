import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProjectRequestNotifications, getReservationNotifications, getAdminReservationNotifications, processProjectRequest, processReservation } from '../services/authService';

const NotificationIcon = () => {
  const { user } = useAuth();
  const [projectNotifications, setProjectNotifications] = useState([]);
  const [reservationNotifications, setReservationNotifications] = useState([]);
  const [adminReservationNotifications, setAdminReservationNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user || !['professor', 'admin'].includes(user.role)) return;
    
    try {
      if (user.role === 'professor') {
        const [projectData, reservationData] = await Promise.all([
          getProjectRequestNotifications('pending'),
          getReservationNotifications()
        ]);
        
        setProjectNotifications(projectData || []);
        setReservationNotifications(reservationData || []);
        setAdminReservationNotifications([]);
        setUnreadCount((projectData || []).length + (reservationData || []).length);
      } else if (user.role === 'admin') {
        const [projectData, adminReservationData] = await Promise.all([
          getProjectRequestNotifications('pending'),
          getReservationNotifications()
        ]);
        
        setProjectNotifications(projectData || []);
        setReservationNotifications([]);
        setAdminReservationNotifications(adminReservationData || []);
        setUnreadCount((projectData || []).length + (adminReservationData || []).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setProjectNotifications([]);
      setReservationNotifications([]);
      setAdminReservationNotifications([]);
      setUnreadCount(0);
    }
  };

  // Carregar notificações quando o componente monta
  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Recarregar notificações a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Abrir modal de notificações
  const handleOpenModal = () => {
    setShowModal(true);
    setUnreadCount(0); // Marcar como lidas
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funções para processar solicitações
  const handleApproveRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'approve');
      await loadNotifications(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'reject');
      await loadNotifications(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  // Funções para processar reservas
  const handleApproveReservation = async (reservationId) => {
    try {
      await processReservation(reservationId, 'approve');
      await loadNotifications(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    try {
      const rejectionReason = prompt('Motivo da rejeição (opcional):') || 'Reserva rejeitada pelo professor';
      await processReservation(reservationId, 'reject', rejectionReason);
      await loadNotifications(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao rejeitar reserva:', error);
    }
  };

  // Se não for professor ou admin, não mostrar o ícone
  if (!user || !['professor', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <>
      {/* Ícone de Notificações Flutuante */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleOpenModal}
          className="relative bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Notificações"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal de Notificações */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="text-blue-600" size={24} />
                Notificações
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(projectNotifications.length === 0 && reservationNotifications.length === 0 && adminReservationNotifications.length === 0) ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma notificação
                  </h3>
                  <p className="text-gray-500">
                    Você não tem solicitações pendentes no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notificações de Projetos */}
                  {projectNotifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="text-blue-600" size={20} />
                        Solicitações de Projetos ({projectNotifications.length})
                      </h3>
                      <div className="space-y-4">
                        {projectNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-1">
                              Nova solicitação de projeto
                            </h4>
                            <p className="text-blue-800 mb-2">
                              <strong>{notification.student_name}</strong> solicitou entrada no projeto{' '}
                              <strong>{notification.project_name}</strong>
                            </p>
                            {notification.message && (
                              <p className="text-blue-700 text-sm mb-2 italic">
                                "{notification.message}"
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-blue-600">
                              <span>Matrícula: {notification.student_matricula}</span>
                              <span>Email: {notification.student_email}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-500">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="flex gap-2 pt-2 border-t border-blue-200">
                          <button
                            onClick={() => handleApproveRequest(notification.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="Aprovar solicitação"
                          >
                            <CheckCircle size={16} />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(notification.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            title="Rejeitar solicitação"
                          >
                            <XCircle size={16} />
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                    </div>
                  )}

                  {/* Notificações de Reservas */}
                  {reservationNotifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Bell className="text-orange-600" size={20} />
                        Reservas Pendentes ({reservationNotifications.length})
                      </h3>
                      <div className="space-y-4">
                        {reservationNotifications.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-orange-900 mb-1">
                                    Nova reserva de espaço
                                  </h4>
                                  <p className="text-orange-800 mb-2">
                                    <strong>{reservation.student_name}</strong> solicitou reserva da{' '}
                                    <strong>{reservation.room_name}</strong>
                                  </p>
                                  <p className="text-orange-700 text-sm mb-2">
                                    <strong>Projeto:</strong> {reservation.project_name} - {reservation.project_type}
                                  </p>
                                  <p className="text-orange-700 text-sm mb-2">
                                    <strong>Evento:</strong> {reservation.title}
                                  </p>
                                  {reservation.description && (
                                    <p className="text-orange-700 text-sm mb-2 italic">
                                      "{reservation.description}"
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-orange-600">
                                    <span>Data: {new Date(reservation.start_time).toLocaleDateString('pt-BR')}</span>
                                    <span>Hora: {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-orange-500">
                                    {formatDate(reservation.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Botões de Ação para Reservas */}
                              <div className="flex gap-2 pt-2 border-t border-orange-200">
                                <button
                                  onClick={() => handleApproveReservation(reservation.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  title="Aprovar reserva"
                                >
                                  <CheckCircle size={16} />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleRejectReservation(reservation.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  title="Rejeitar reserva"
                                >
                                  <XCircle size={16} />
                                  Rejeitar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notificações de Admin - Reservas Pendentes */}
                  {adminReservationNotifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="text-orange-600" size={20} />
                        Reservas Pendentes ({adminReservationNotifications.length})
                      </h3>
                      <div className="space-y-4">
                        {adminReservationNotifications.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-orange-900 mb-1">
                                    Nova reserva pendente
                                  </h4>
                                  <p className="text-orange-800 mb-2">
                                    <strong>{reservation.student_name}</strong> - <strong>{reservation.room_name}</strong>
                                  </p>
                                  <p className="text-orange-700 text-sm mb-2">
                                    <strong>Projeto:</strong> {reservation.project_name} - {reservation.project_type}
                                  </p>
                                  <p className="text-orange-700 text-sm mb-2">
                                    <strong>Evento:</strong> {reservation.title}
                                  </p>
                                  <p className="text-orange-700 text-sm mb-2">
                                    <strong>Pessoas:</strong> {reservation.people_count} (Capacidade: {reservation.room_capacity})
                                  </p>
                                  {reservation.description && (
                                    <p className="text-orange-700 text-sm mb-2 italic">
                                      "{reservation.description}"
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-orange-600">
                                    <span>Data: {new Date(reservation.start_time).toLocaleDateString('pt-BR')}</span>
                                    <span>Hora: {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - {new Date(reservation.end_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-purple-500">
                                    {formatDate(reservation.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Botões de Ação para Admin */}
                              <div className="flex gap-2 pt-2 border-t border-purple-200">
                                <button
                                  onClick={() => handleApproveReservation(reservation.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  title="Aprovar reserva"
                                >
                                  <CheckCircle size={16} />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleRejectReservation(reservation.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  title="Rejeitar reserva"
                                >
                                  <XCircle size={16} />
                                  Rejeitar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationIcon;
