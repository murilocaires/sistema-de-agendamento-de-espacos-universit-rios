import React from 'react';
import { Users, Trash2 } from 'lucide-react';

const ProjectsView = ({ 
  projects, 
  pendingRequests, 
  onShowStudents, 
  onDeleteProject, 
  onApproveRequest, 
  onRejectRequest, 
  formatDate 
}) => {
  return (
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="group bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                onClick={() => onShowStudents(project)}
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
                        onShowStudents(project);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Gerenciar Alunos"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
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
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
              </svg>
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
                        onClick={() => onApproveRequest(request.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        title="Aprovar solicitação"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Aprovar
                      </button>
                      <button
                        onClick={() => onRejectRequest(request.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        title="Rejeitar solicitação"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
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
  );
};

export default ProjectsView;
