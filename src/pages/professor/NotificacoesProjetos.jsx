import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getProjectRequestNotifications,
  processProjectRequest
} from "../../services/authService";
import { 
  Bell,
  Users,
  User,
  Mail,
  Calendar,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  MessageSquare,
  UserPlus,
  UserMinus
} from "lucide-react";
import ProfessorLayout from "../../layouts/ProfessorLayout";

const NotificacoesProjetos = () => {
  const { user } = useAuth();

  // Estados
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const requestsData = await getProjectRequestNotifications('pending');
      setRequests(requestsData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar notificações: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

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

  // Processar solicitação (aprovar/rejeitar)
  const handleProcessRequest = async (requestId, action) => {
    try {
      setProcessing(prev => ({ ...prev, [requestId]: true }));
      
      await processProjectRequest(requestId, action);
      
      // Remover a solicitação da lista
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      setError("");
    } catch (err) {
      setError(`Erro ao ${action === 'approved' ? 'aprovar' : 'rejeitar'} solicitação: ${err.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Abrir modal de detalhes
  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Fechar modal de detalhes
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <ProfessorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notificações de Projetos</h1>
            <p className="text-gray-700">Gerencie solicitações de entrada em seus projetos</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bell className="text-blue-600" size={20} />
            <span>{requests.length} solicitação(ões) pendente(s)</span>
          </div>
        </div>

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <AlertCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Lista de Solicitações */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma notificação</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há solicitações pendentes para seus projetos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header da Solicitação */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserPlus className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Solicitação de Entrada no Projeto
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.project_name} - {request.project_type}
                        </p>
                      </div>
                    </div>

                    {/* Informações do Aluno */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="text-gray-500" size={16} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{request.student_name}</p>
                          <p className="text-xs text-gray-600">Aluno</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-800">{request.student_email}</p>
                          <p className="text-xs text-gray-600">Email</p>
                        </div>
                      </div>
                    </div>

                    {/* Matrícula e Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {request.student_matricula && (
                        <div className="flex items-center gap-2">
                          <Users className="text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-800">{request.student_matricula}</p>
                            <p className="text-xs text-gray-600">Matrícula SIGAA</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-800">{formatDate(request.created_at)}</p>
                          <p className="text-xs text-gray-600">Data da Solicitação</p>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem do Aluno */}
                    {request.message && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="text-gray-500" size={16} />
                          <span className="text-sm font-medium text-gray-700">Mensagem do Aluno:</span>
                        </div>
                        <p className="text-sm text-gray-600">{request.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => openDetailsModal(request)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye size={16} />
                      Detalhes
                    </button>
                    
                    <button
                      onClick={() => handleProcessRequest(request.id, 'approved')}
                      disabled={processing[request.id]}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {processing[request.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Aprovar
                    </button>
                    
                    <button
                      onClick={() => handleProcessRequest(request.id, 'rejected')}
                      disabled={processing[request.id]}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {processing[request.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <X size={16} />
                      )}
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalhes */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full relative">
              <button onClick={closeDetailsModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Detalhes da Solicitação</h2>
              
              <div className="space-y-6">
                {/* Informações do Projeto */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Projeto</h3>
                  <p className="text-gray-700"><strong>Nome:</strong> {selectedRequest.project_name}</p>
                  <p className="text-gray-700"><strong>Tipo:</strong> {selectedRequest.project_type}</p>
                </div>

                {/* Informações do Aluno */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Aluno</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700"><strong>Nome:</strong> {selectedRequest.student_name}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {selectedRequest.student_email}</p>
                    </div>
                    <div>
                      {selectedRequest.student_matricula && (
                        <p className="text-gray-700"><strong>Matrícula:</strong> {selectedRequest.student_matricula}</p>
                      )}
                      <p className="text-gray-700"><strong>Data da Solicitação:</strong> {formatDate(selectedRequest.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Mensagem */}
                {selectedRequest.message && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Mensagem do Aluno</h3>
                    <p className="text-gray-700">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              {/* Ações no Modal */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    handleProcessRequest(selectedRequest.id, 'rejected');
                    closeDetailsModal();
                  }}
                  disabled={processing[selectedRequest.id]}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <X size={16} />
                  Rejeitar
                </button>
                <button
                  onClick={() => {
                    handleProcessRequest(selectedRequest.id, 'approved');
                    closeDetailsModal();
                  }}
                  disabled={processing[selectedRequest.id]}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

export default NotificacoesProjetos;
