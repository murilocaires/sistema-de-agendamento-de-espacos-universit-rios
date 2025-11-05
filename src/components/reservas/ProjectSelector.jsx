import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";

const ProjectSelector = ({
  showProjectSelection,
  formData,
  errors,
  searchProjectText,
  showProjectDropdown,
  filteredProjects,
  onProjectSearchChange,
  onProjectFieldFocus,
  onSelectProject,
  onClearProject,
  onToggleDropdown
}) => {
  const projectInputRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectInputRef.current && !projectInputRef.current.contains(event.target)) {
        onToggleDropdown(false);
      }
    };

    if (showProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProjectDropdown, onToggleDropdown]);

  if (!showProjectSelection) return null;

  return (
    <div className="relative" ref={projectInputRef}>
      <label 
        className="block mb-2"
        style={{
          fontFamily: "Lato, sans-serif",
          fontSize: "10px",
          fontWeight: "bold",
          color: "#535964",
        }}
      >
        PROJETO / TÍTULO
      </label>
      <div className="relative">
        {/* Campo de seleção - mostra o projeto selecionado ou permite buscar */}
        <div 
          className={`flex items-center w-full py-2 border-0 border-b focus-within:border-blue-500 cursor-pointer ${
            errors.project_text ? "border-red-500" : ""
          }`}
          style={{
            borderBottomColor: errors.project_text ? "#ef4444" : "#E3E5E8"
          }}
          onClick={() => onToggleDropdown(true)}
        >
          {formData.project_text ? (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-gray-900">{formData.project_text}</span>
              <button
                type="button"
                onClick={onClearProject}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Limpar seleção"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={searchProjectText}
              onChange={onProjectSearchChange}
              onFocus={onProjectFieldFocus}
              placeholder="Selecione um projeto..."
              className="flex-1 focus:outline-none bg-transparent"
              readOnly={false}
              autoComplete="off"
            />
          )}
        </div>
        
        {/* Dropdown de projetos */}
        {showProjectDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Lista de projetos */}
            <div className="max-h-60 overflow-y-auto">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                      formData.project_id === project.id 
                        ? "bg-blue-100 font-medium" 
                        : "text-gray-700"
                    }`}
                  >
                    {project.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Nenhum projeto encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {errors.project_text && <p className="mt-1 text-sm text-red-600">{errors.project_text}</p>}
    </div>
  );
};

export default ProjectSelector;





