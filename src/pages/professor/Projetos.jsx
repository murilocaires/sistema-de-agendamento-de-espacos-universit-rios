import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, Search, UserPlus, UserMinus, X, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import { getProjects, createProject, deleteProject } from '../../services/authService';
import { getAvailableStudents, addStudentToProject, removeStudentFromProject, getProjectStudents } from '../../services/authService';
import { getProjectRequestNotifications, processProjectRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ProfessorLayout from '../../layouts/ProfessorLayout';

const Projetos = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para solicitações
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Estados para criar projeto
  const [newProject, setNewProject] = useState({
    name: '',
    type: ''
  });

  useEffect(() => {
    if (user) {
      loadProjects();
      loadPendingRequests();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects({ professor_id: user?.id });
      setProjects(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await getProjectRequestNotifications('pending');
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setNewProject({ name: '', type: '' });
      setShowCreateModal(false);
      loadProjects();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProject(projectId);
        loadProjects();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
      }
    }
  };

  const loadAvailableStudents = async (projectId) => {
    try {
      const data = await getAvailableStudents(projectId);
      setAvailableStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos disponíveis:', error);
    }
  };

  const loadProjectStudents = async (projectId) => {
    try {
      console.log('Carregando alunos do projeto:', projectId);
      const data = await getProjectStudents(projectId);
      console.log('Alunos carregados:', data);
      setStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos do projeto:', error);
      setStudents([]);
    }
  };

  const handleShowStudents = async (project) => {
    setSelectedProject(project);
    setShowStudentsModal(true);
    await loadAvailableStudents(project.id);
    await loadProjectStudents(project.id);
  };

  const handleAddStudent = async (studentId) => {
    try {
      await addStudentToProject(selectedProject.id, studentId);
      await loadAvailableStudents(selectedProject.id);
      await loadProjectStudents(selectedProject.id);
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm('Tem certeza que deseja remover este aluno do projeto?')) {
      try {
        await removeStudentFromProject(selectedProject.id, studentId);
        await loadAvailableStudents(selectedProject.id);
        await loadProjectStudents(selectedProject.id);
      } catch (error) {
        console.error('Erro ao remover aluno:', error);
      }
    }
  };

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções para gerenciar solicitações
  const handleApproveRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'approve');
      await loadPendingRequests();
      await loadProjects(); // Recarregar projetos para atualizar contadores
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'reject');
      await loadPendingRequests();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
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
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Projetos de Extensão</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Layout com grid para projetos e solicitações */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Projetos - ocupa 3 colunas */}
        <div className="xl:col-span-3">

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
          <p className="text-gray-500 mb-4">Crie seu primeiro projeto de extensão para começar.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="group bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
              onClick={() => handleShowStudents(project)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowStudents(project);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Gerenciar Alunos"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir Projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{project.student_count || 0} aluno(s)</span>
                <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Clique para gerenciar alunos
              </div>
            </div>
          ))}
        </div>
      )}
        </div>

        {/* Seção de Solicitações Pendentes - ocupa 1 coluna */}
        {pendingRequests.length > 0 && (
          <div className="xl:col-span-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="text-yellow-600" size={20} />
                <h2 className="text-lg font-bold text-yellow-800">
                  Solicitações ({pendingRequests.length})
                </h2>
              </div>
              
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-yellow-200 rounded-lg p-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {request.student_name}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        <strong>Projeto:</strong> {request.project_name}
                      </p>
                      {request.message && (
                        <p className="text-gray-600 text-xs italic">
                          "{request.message}"
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        <p>Matrícula: {request.student_matricula}</p>
                        <p>Data: {formatDate(request.created_at)}</p>
                      </div>
                      
                      <div className="flex gap-1 pt-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                          title="Aprovar solicitação"
                        >
                          <CheckCircle size={12} />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                          title="Rejeitar solicitação"
                        >
                          <XCircle size={12} />
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para criar projeto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Projeto</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo do Projeto
                </label>
                <input
                  type="text"
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Extensão, Pesquisa, Ensino"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para gerenciar alunos */}
      {showStudentsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gerenciar Alunos - {selectedProject.name}</h2>
              <button
                onClick={() => setShowStudentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alunos do projeto */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Alunos no Projeto ({students.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.student_name}</p>
                        <p className="text-sm text-gray-600">{student.student_email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.student_id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remover do projeto"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum aluno no projeto</p>
                  )}
                </div>
              </div>

              {/* Alunos disponíveis */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Alunos Disponíveis</h3>
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar alunos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredAvailableStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Adicionar ao projeto"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {filteredAvailableStudents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno disponível'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProfessorLayout>
  );
};

export default Projetos;
