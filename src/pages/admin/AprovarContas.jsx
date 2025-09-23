import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import { getPendingUsers, approveUser } from '../../services/authService';

const AprovarContas = () => {
  const { user } = useAuth();
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (err) {
      setError('Erro ao carregar usuários pendentes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, action) => {
    try {
      setProcessing(prev => ({ ...prev, [userId]: true }));
      setError('');
      setSuccess('');

      await approveUser(userId, action);
      
      const actionText = action === 'approve' ? 'aprovado' : 'rejeitado';
      setSuccess(`Usuário ${actionText} com sucesso!`);
      
      // Remover usuário da lista
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
    } catch (err) {
      setError('Erro ao processar: ' + err.message);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplay = (role) => {
    const roles = {
      'admin': 'Administrador',
      'professor': 'Professor',
      'coordenador': 'Coordenador',
      'portaria': 'Portaria',
      'aluno': 'Aluno',
      'servidor': 'Servidor'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Aprovar Contas</h1>
                <p className="text-gray-700">
                  Gerencie as solicitações de criação de conta
                </p>
              </div>
            </div>
            <button
              onClick={loadPendingUsers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Lista de usuários pendentes */}
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta pendente
            </h3>
            <p className="text-gray-500">
              Todas as contas foram processadas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Contas Aguardando Aprovação ({pendingUsers.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Clock className="text-yellow-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {pendingUser.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getRoleDisplay(pendingUser.role)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-11 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Email:</span>
                          <span>{pendingUser.email}</span>
                        </div>
                        
                        {pendingUser.siape && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">SIAPE:</span>
                            <span>{pendingUser.siape}</span>
                          </div>
                        )}
                        
                        {pendingUser.matricula_sigaa && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Matrícula SIGAA:</span>
                            <span>{pendingUser.matricula_sigaa}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">Solicitado em:</span>
                          <span>{formatDate(pendingUser.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => handleApprove(pendingUser.id, 'approve')}
                        disabled={processing[pendingUser.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing[pendingUser.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle size={20} />
                        )}
                        Aprovar
                      </button>
                      
                      <button
                        onClick={() => handleApprove(pendingUser.id, 'reject')}
                        disabled={processing[pendingUser.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing[pendingUser.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <XCircle size={20} />
                        )}
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Informações importantes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Aprovar: O usuário poderá fazer login normalmente</li>
            <li>• Rejeitar: O usuário não poderá acessar o sistema</li>
            <li>• Todas as ações são registradas no log de auditoria</li>
            <li>• Usuários rejeitados podem solicitar nova aprovação</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AprovarContas;
