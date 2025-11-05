import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAvailableProjects,
} from "../../services/authService";
import {
  FolderOpen,
  User,
  CheckCircle,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";

const ProjetosAluno = () => {
  const { user } = useAuth();

  // Estados
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const projectsData = await getAvailableProjects();
      // Filtrar apenas projetos aos quais o aluno pertence
      const myProjects = projectsData.filter(
        (project) => project.is_participant
      );
      setProjects(myProjects);
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

  // Usar todos os projetos (já filtrados para mostrar apenas os do aluno)
  const filteredProjects = projects;


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
      <div className="px-4 md:px-12 mt-4 md:mt-12 pb-6" style={{ backgroundColor: "#FFFFFF" }}>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1
            className="font-bold text-lg md:text-2xl"
            style={{
              fontFamily: "Lato, sans-serif",
              lineHeight: "140%",
              letterSpacing: "0%",
              color: "#2E3DA3",
            }}
          >
            Meus Projetos
          </h1>
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

        {/* Lista de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => {
            return (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow"
              >
                {/* Nome do Projeto */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {project.name}
                  </h3>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                    <CheckCircle size={12} />
                    Participando
                  </span>
                </div>

                {/* Responsável */}
                <div className="flex items-center gap-2">
                  <User className="text-blue-600" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {project.professor_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {project.professor_email}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Mensagem quando não há projetos */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum projeto encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não participa de nenhum projeto de extensão.
            </p>
          </div>
        )}

      </div>
    </StudentLayout>
  );
};

export default ProjetosAluno;
