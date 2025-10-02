import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { addStudentToProject, removeStudentFromProject, getAvailableStudents } from '../../services/authService';

const ManageStudentsModal = ({ 
  isOpen, 
  onClose, 
  project, 
  students, 
  availableStudents, 
  onStudentsChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Debounce para busca no backend
  const debouncedSearch = useCallback(
    debounce(async (term, projectId) => {
      if (!projectId) return;
      
      setLoadingSearch(true);
      try {
        const data = await getAvailableStudents(projectId, term);
        setFilteredAvailableStudents(data || []);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setFilteredAvailableStudents([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300),
    []
  );

  // Função debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Buscar alunos quando o termo de busca mudar
  useEffect(() => {
    if (project?.id) {
      debouncedSearch(searchTerm, project.id);
    }
  }, [searchTerm, project?.id, debouncedSearch]);

  // Carregar alunos iniciais quando o modal abrir
  useEffect(() => {
    if (isOpen && project?.id && !searchTerm) {
      setLoadingSearch(true);
      getAvailableStudents(project.id, '')
        .then(data => {
          setFilteredAvailableStudents(data || []);
        })
        .catch(error => {
          console.error('Erro ao carregar alunos iniciais:', error);
          setFilteredAvailableStudents([]);
        })
        .finally(() => {
          setLoadingSearch(false);
        });
    }
  }, [isOpen, project?.id, searchTerm]);

  const handleAddStudent = async (studentId) => {
    try {
      await addStudentToProject(project.id, studentId);
      // Atualizar lista de alunos disponíveis (remover o aluno adicionado)
      setFilteredAvailableStudents(prev => 
        prev.filter(student => student.id !== studentId)
      );
      if (onStudentsChange) {
        onStudentsChange();
      }
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromProject(project.id, studentId);
      // Buscar dados do aluno removido para adicionar de volta à lista disponível
      const removedStudent = students.find(s => s.student_id === studentId);
      if (removedStudent) {
        setFilteredAvailableStudents(prev => [
          ...prev,
          {
            id: removedStudent.student_id,
            name: removedStudent.student_name,
            email: removedStudent.student_email
          }
        ]);
      }
      if (onStudentsChange) {
        onStudentsChange();
      }
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl lg:h-[60vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gerenciar Alunos - {project.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alunos do projeto */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Alunos no Projeto ({students.length})</h3>
            <div className="space-y-1 max-h-auto overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{student.student_name}</p>
                    <p className="text-xs text-gray-600">{student.student_email}</p>
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
            <div className="space-y-1 max-h-auto overflow-y-auto">
              {loadingSearch ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                </div>
              ) : (
                <>
                  {filteredAvailableStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.email}</p>
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
                  {filteredAvailableStudents.length === 0 && !loadingSearch && (
                    <p className="text-gray-500 text-center py-4">
                      {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno disponível'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudentsModal;
