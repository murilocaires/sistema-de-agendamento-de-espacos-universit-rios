import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, Search, UserPlus, UserMinus, X, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import { getProjects, createProject, deleteProject } from '../../services/authService';
import { getAvailableStudents, addStudentToProject, removeStudentFromProject, getProjectStudents } from '../../services/authService';
import { getProjectRequestNotifications, processProjectRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

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
      setPendingRequests(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        name: newProject.name,
        type: newProject.type,
        professor_id: user.id
      });
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

  const openStudentsModal = async (project) => {
    setSelectedProject(project);
    try {
      const [availableData, studentsData] = await Promise.all([
        getAvailableStudents(),
        getProjectStudents(project.id)
      ]);
      setAvailableStudents(availableData);
      setStudents(studentsData);
      setShowStudentsModal(true);
    } catch (error) {
      console.error('Erro ao carregar dados dos alunos:', error);
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      await addStudentToProject(selectedProject.id, studentId);
      const [availableData, studentsData] = await Promise.all([
        getAvailableStudents(),
        getProjectStudents(selectedProject.id)
      ]);
      setAvailableStudents(availableData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromProject(selectedProject.id, studentId);
      const [availableData, studentsData] = await Promise.all([
        getAvailableStudents(),
        getProjectStudents(selectedProject.id)
      ]);
      setAvailableStudents(availableData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'approve');
      loadPendingRequests();
      loadProjects(); // Recarregar para atualizar contadores
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await processProjectRequest(requestId, 'reject');
      loadPendingRequests();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Projetos</h1>
            <p className="text-gray-600">Gerencie seus projetos de extensão</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        {/* Solicitações Pendentes */}
        {pendingRequests.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-orange-600" size={20} />
              <h3 className="text-lg font-semibold text-orange-800">
                Solicitações Pendentes ({pendingRequests.length})
              </h3>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {request.student_name} quer participar do projeto "{request.project_name}"
                      </p>
                      <p className="text-sm text-gray-600">{request.student_email}</p>
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-1 italic">"{request.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
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

        {/* Lista de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Nenhum projeto encontrado</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openStudentsModal(project)}
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
                        openStudentsModal(project);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Gerenciar alunos"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir projeto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {project.student_count || 0} aluno(s)
                  </span>
                  <span className="text-xs text-gray-500">
                    Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Clique para gerenciar alunos
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Criar Projeto */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Projeto
                  </label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="extensao">Extensão</option>
                    <option value="pesquisa">Pesquisa</option>
                    <option value="ensino">Ensino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Criar Projeto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Gerenciar Alunos */}
        {showStudentsModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Gerenciar Alunos - {selectedProject.name}
                </h2>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alunos no Projeto */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Alunos no Projeto ({students.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remover do projeto"
                        >
                          <UserMinus size={20} />
                        </button>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Nenhum aluno no projeto</p>
                    )}
                  </div>
                </div>

                {/* Alunos Disponíveis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Alunos Disponíveis</h3>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Buscar alunos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Adicionar ao projeto"
                        >
                          <UserPlus size={20} />
                        </button>
                      </div>
                    ))}
                    {filteredStudents.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Nenhum aluno disponível</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Projetos;
