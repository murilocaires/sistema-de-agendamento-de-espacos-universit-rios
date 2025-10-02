import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { getProjects, deleteProject } from '../../services/authService';
import { getAvailableStudents, getProjectStudents, getMyStudents } from '../../services/authService';
import { getProjectRequestNotifications, processProjectRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ProfessorLayout from '../../layouts/ProfessorLayout';

// Componentes
import CreateStudentModal from '../../components/professor/CreateStudentModal';
import CreateProjectModal from '../../components/professor/CreateProjectModal';
import ManageStudentsModal from '../../components/professor/ManageStudentsModal';
import StudentsView from '../../components/professor/StudentsView';
import ProjectsView from '../../components/professor/ProjectsView';

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

  // Estados para modais
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false);

  // Estados para visualização (Projetos x Alunos)
  const [viewMode, setViewMode] = useState('projects'); // 'projects' | 'students'
  const [selectedProjectForStudents, setSelectedProjectForStudents] = useState(null);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadPendingRequests();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects({ professor_id: user?.id }); // Mantém professor_id no backend
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

  // Carregar alunos quando trocar para a visão de alunos
  useEffect(() => {
    if (viewMode === 'students') {
      if (selectedProjectForStudents) {
        loadProjectStudents(selectedProjectForStudents.id);
      } else {
        loadAllProjectStudents();
        loadMyUnassignedStudents();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedProjectForStudents, projects]);

  const handleCreateProjectSuccess = () => {
    loadProjects();
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

  const loadMyUnassignedStudents = async () => {
    try {
      const data = await getMyStudents('', true); // unassignedOnly = true
      const normalized = (data || []).map((s) => ({ ...s, projects: [] }));
      // Adicionar alunos sem projeto à lista principal de alunos
      setStudents(prevStudents => {
        const existingIds = new Set(prevStudents.map(s => s.student_id || s.id));
        const newStudents = normalized.filter(s => !existingIds.has(s.student_id || s.id));
        return [...prevStudents, ...newStudents];
      });
    } catch (error) {
      console.error('Erro ao buscar meus alunos sem projeto:', error);
    }
  };

  const loadProjectStudents = async (projectId) => {
    try {
      console.log('Carregando alunos do projeto:', projectId);
      const data = await getProjectStudents(projectId);
      console.log('Alunos carregados:', data);
      // Se estiver na aba de alunos com um projeto selecionado, anotar o nome do projeto
      const annotated = (selectedProjectForStudents && projects?.length)
        ? data.map((s) => ({ ...s, projects: [selectedProjectForStudents?.name].filter(Boolean) }))
        : data;
      setStudents(annotated);
    } catch (error) {
      console.error('Erro ao carregar alunos do projeto:', error);
      setStudents([]);
    }
  };

  const loadAllProjectStudents = async () => {
    try {
      if (!projects || projects.length === 0) {
        setStudents([]);
        return;
      }
      const results = await Promise.all(
        projects.map((p) => getProjectStudents(p.id)
          .then(list => ({ project: p, list }))
          .catch(() => ({ project: p, list: [] })))
      );

      // Combinar por aluno, agregando os nomes dos projetos do professor
      const studentIdToData = new Map();
      for (const { project, list } of results) {
        for (const s of list) {
          // Usar student_id como chave principal, pois é mais confiável
          const sid = s.student_id || s.id;
          if (!sid) continue;
          
          if (!studentIdToData.has(sid)) {
            studentIdToData.set(sid, {
              ...s,
              projects: [],
            });
          }
          
          const entry = studentIdToData.get(sid);
          // Adicionar projeto apenas se não existir
          if (!entry.projects.some(p => p === project.name)) {
            entry.projects.push(project.name);
          }
        }
      }
      
      const finalStudents = Array.from(studentIdToData.values());
      setStudents(finalStudents);
    } catch (error) {
      console.error('Erro ao carregar alunos de todos os projetos:', error);
      setStudents([]);
    }
  };

  const handleShowStudents = async (project) => {
    setSelectedProject(project);
    setShowManageStudentsModal(true);
    await loadAvailableStudents(project.id);
    await loadProjectStudents(project.id);
  };

  const handleManageStudentsChange = async () => {
    if (selectedProject) {
      await loadAvailableStudents(selectedProject.id);
      await loadProjectStudents(selectedProject.id);
    }
  };

  const handleCreateStudentSuccess = async () => {
    // Recarregar listas se estiver na visão de alunos
    if (viewMode === 'students' && selectedProjectForStudents) {
      await loadProjectStudents(selectedProjectForStudents.id);
    }
  };

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
      {/* Header com ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Projetos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateStudentModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Cadastrar Aluno
          </button>
        <button
              onClick={() => setShowCreateProjectModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>
          </div>

      {/* Alternador de visualização */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm border border-gray-200" role="group">
          <button
            type="button"
            onClick={() => setViewMode('projects')}
            className={`px-4 py-2 text-sm font-medium ${viewMode === 'projects' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-md`}
          >
            Projetos
          </button>
                  <button
            type="button"
            onClick={() => setViewMode('students')}
            className={`px-4 py-2 text-sm font-medium ${viewMode === 'students' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-md`}
          >
            Alunos
                  </button>
                </div>
              </div>
              
        {/* Layout: se Projetos, mostra grid; se Alunos, mostra lista por projeto */}
        {viewMode === 'projects' ? (
          <ProjectsView
            projects={projects}
            pendingRequests={pendingRequests}
            onShowStudents={handleShowStudents}
            onDeleteProject={handleDeleteProject}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            formatDate={formatDate}
          />
        ) : (
          <StudentsView
            projects={projects}
            selectedProject={selectedProjectForStudents}
            onProjectChange={setSelectedProjectForStudents}
            students={students}
          />
        )}

        {/* Modais */}
        <CreateProjectModal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          onSuccess={handleCreateProjectSuccess}
        />

        <ManageStudentsModal
          isOpen={showManageStudentsModal}
          onClose={() => setShowManageStudentsModal(false)}
          project={selectedProject}
          students={students}
          availableStudents={availableStudents}
          onStudentsChange={handleManageStudentsChange}
        />

        <CreateStudentModal
          isOpen={showCreateStudentModal}
          onClose={() => setShowCreateStudentModal(false)}
          onSuccess={handleCreateStudentSuccess}
          projects={projects}
        />
      </div>
    </ProfessorLayout>
  );
};

export default Projetos;
