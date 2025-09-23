import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getAvailableProjects,
  requestProjectAccess,
  getMyProjectRequests,
  getProjectStudents
} from "../../services/authService";
import { 
  FolderOpen,
  Users,
  User,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Search,
  Filter,
  Eye,
  UserPlus,
  MessageSquare
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";

const ProjetosAluno = () => {
  const { user } = useAuth();

  // Estados
  const [projects, setProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projectStudents, setProjectStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, requestsData] = await Promise.all([
        getAvailableProjects(),
        getMyProjectRequests()
      ]);
      setProjects(projectsData);
      setMyRequests(requestsData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Filtrar projetos
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.professor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obter cor do status da solicitação
  const getRequestStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Obter texto do status da solicitação
  const getRequestStatusText = (status) => {
    const texts = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Rejeitada"
    };
    return texts[status] || status;
  };

  // Abrir modal de solicitação
  const openRequestModal = (project) => {
    setSelectedProject(project);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  // Fechar modal de solicitação
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedProject(null);
    setRequestMessage("");
  };

  // Abrir modal de detalhes
  const openDetailsModal = async (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
    setLoadingStudents(true);
    
    try {
      const studentsData = await getProjectStudents(project.id);
      setProjectStudents(studentsData);
    } catch (err) {
      console.error('Erro ao carregar alunos do projeto:', err);
      setProjectStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fechar modal de detalhes
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProject(null);
    setProjectStudents([]);
  };

  // Submeter solicitação
  const handleSubmitRequest = async () => {
    if (!selectedProject) return;

    try {
      setSubmitting(true);
      await requestProjectAccess({
        project_id: selectedProject.id,
        message: requestMessage
      });

      setError("");
      closeRequestModal();
      loadData(); // Recarregar dados para atualizar status
    } catch (err) {
      setError("Erro ao enviar solicitação: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar se pode solicitar entrada no projeto
  const canRequestAccess = (project) => {
    return !project.is_participant && project.can_request;
  };

  // Obter status da solicitação para um projeto
  const getProjectRequestStatus = (projectId) => {
    const request = myRequests.find(r => r.project_id === projectId);
    return request ? request.status : null;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Projetos Disponíveis</h1>
            <p className="text-gray-700">Explore e solicite entrada em projetos de extensão</p>
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

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome do projeto, professor ou tipo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const requestStatus = getProjectRequestStatus(project.id);
            const canRequest = canRequestAccess(project);

            return (
              <div key={project.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
                {/* Header do Projeto */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.is_participant ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Participando
                      </span>
                    ) : requestStatus ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(requestStatus)} flex items-center gap-1`}>
                        {requestStatus === 'pending' && <Clock size={12} />}
                        {requestStatus === 'approved' && <CheckCircle size={12} />}
                        {requestStatus === 'rejected' && <X size={12} />}
                        {getRequestStatusText(requestStatus)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-800">
                        Disponível
                      </span>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {project.description || 'Sem descrição disponível'}
                </p>

                {/* Informações do Professor */}
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-blue-600" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{project.professor_name}</p>
                    <p className="text-xs text-gray-600">{project.professor_email}</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{project.current_students} aluno(s)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailsModal(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Eye size={16} />
                    Detalhes
                  </button>
                  
                  {project.is_participant ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      Participando
                    </button>
                  ) : canRequest ? (
                    <button
                      onClick={() => openRequestModal(project)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <UserPlus size={16} />
                      Solicitar
                    </button>
                  ) : requestStatus === 'pending' ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed"
                    >
                      <Clock size={16} />
                      Aguardando
                    </button>
                  ) : requestStatus === 'rejected' ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg cursor-not-allowed"
                    >
                      <X size={16} />
                      Rejeitado
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensagem quando não há projetos */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum projeto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Tente ajustar sua busca.' : 'Não há projetos disponíveis no momento.'}
            </p>
          </div>
        )}

        {/* Modal de Detalhes do Projeto */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
              <button onClick={closeDetailsModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Detalhes do Projeto</h2>
                {selectedProject.is_participant && (
                  <div className="mt-2 flex items-center gap-2 text-green-700">
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">Você está participando deste projeto!</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações do Projeto */}
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedProject.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tipo:</span>
                        <p className="text-gray-800">{selectedProject.type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Descrição:</span>
                        <p className="text-gray-800 mt-1">
                          {selectedProject.description || 'Sem descrição disponível'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Data de Criação:</span>
                        <p className="text-gray-800">{formatDate(selectedProject.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Professor */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="text-blue-600" size={20} />
                      Professor Responsável
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nome:</span>
                        <p className="text-gray-800">{selectedProject.professor_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">{selectedProject.professor_email}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Lista de Alunos */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="text-purple-600" size={20} />
                      Alunos Participantes ({projectStudents.length})
                    </h3>
                    
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : projectStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h4 className="mt-2 text-sm font-medium text-gray-900">Nenhum aluno participando</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Este projeto ainda não tem alunos participantes.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {projectStudents.map((student, index) => {
                          const isCurrentUser = student.student_id === user?.id;
                          return (
                            <div key={student.student_id || index} className={`flex items-center gap-3 p-3 rounded-lg ${isCurrentUser ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrentUser ? 'bg-green-200' : 'bg-blue-100'}`}>
                                {isCurrentUser ? (
                                  <CheckCircle className="text-green-600" size={16} />
                                ) : (
                                  <User className="text-blue-600" size={16} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium ${isCurrentUser ? 'text-green-800' : 'text-gray-800'}`}>
                                    {student.student_name}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-800">
                                      Você
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">{student.student_email}</p>
                                {student.student_matricula && (
                                  <p className="text-xs text-gray-500">Matrícula: {student.student_matricula}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className={`p-6 rounded-lg ${selectedProject.is_participant ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações</h3>
                    <div className="space-y-3">
                      {selectedProject.is_participant ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle className="text-green-600" size={24} />
                            <span className="text-lg font-semibold text-green-800">Você está participando!</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Você já faz parte deste projeto de extensão.
                          </p>
                        </div>
                      ) : canRequestAccess(selectedProject) ? (
                        <button
                          onClick={() => {
                            closeDetailsModal();
                            openRequestModal(selectedProject);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <UserPlus size={16} />
                          Solicitar Entrada no Projeto
                        </button>
                      ) : (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {selectedProject.request_status === 'pending' && <Clock className="text-yellow-600" size={24} />}
                            {selectedProject.request_status === 'rejected' && <X className="text-red-600" size={24} />}
                            <span className={`text-lg font-semibold ${selectedProject.request_status === 'pending' ? 'text-yellow-800' : 'text-red-800'}`}>
                              {getRequestStatusText(selectedProject.request_status)}
                            </span>
                          </div>
                          <p className={`text-sm ${selectedProject.request_status === 'pending' ? 'text-yellow-700' : 'text-red-700'}`}>
                            {selectedProject.request_status === 'pending' 
                              ? 'Sua solicitação está aguardando aprovação do professor.'
                              : 'Sua solicitação foi rejeitada. Você pode tentar novamente mais tarde.'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de fechar */}
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Solicitação */}
        {showRequestModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
              <button onClick={closeRequestModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Solicitar Entrada no Projeto</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedProject.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedProject.type}</p>
                <p className="text-sm text-gray-700">
                  <strong>Professor:</strong> {selectedProject.professor_name}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explique por que você gostaria de participar deste projeto..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={closeRequestModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ProjetosAluno;
