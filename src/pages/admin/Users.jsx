import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  createStudent
} from "../../services/authService";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

const Users = () => {
  const { user } = useAuth();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    siape: "",
    matricula_sigaa: "",
    password: "",
    role: "professor"
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tipos de usuário disponíveis
  const userRoles = [
    { value: "admin", label: "Administrador" },
    { value: "professor", label: "Professor" },
    { value: "servidor", label: "Servidor" },
    { value: "coordenador", label: "Coordenador" },
    { value: "aluno", label: "Aluno" },
    { value: "portaria", label: "Portaria" },
  ];

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários
  const filteredUsers = users.filter(u => {
    // Se não há termo de busca, retorna todos
    if (!searchTerm || !searchTerm.trim()) return true;
    
    // Verificar se o usuário existe
    if (!u) return false;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Verificar nome (com segurança)
    const nameMatch = u.name?.toLowerCase().includes(searchLower) || false;
    
    // Verificar email (com segurança)
    const emailMatch = u.email?.toLowerCase().includes(searchLower) || false;
    
    // Verificar SIAPE ou Matrícula SIGAA (com segurança)
    const siapeMatch = (u.siape && u.siape.toString().includes(searchTerm.trim())) || false;
    const matriculaMatch = (u.matricula_sigaa && u.matricula_sigaa.toString().includes(searchTerm.trim())) || false;
    
    // Verificar role (com segurança)
    const roleMatch = u.role?.toLowerCase().includes(searchLower) || false;
    
    return nameMatch || emailMatch || siapeMatch || matriculaMatch || roleMatch;
  });

  // Abrir modal
  const openModal = (mode, userData = null) => {
    setModalMode(mode);
    setSelectedUser(userData);
    setFormError("");
    setSuccessMessage("");
    
    if (mode === "create") {
      setFormData({
        name: "",
        email: "",
        siape: "",
        matricula_sigaa: "",
        password: "",
        role: "professor"
      });
    } else if (mode === "edit" && userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        siape: userData.siape,
        matricula_sigaa: userData.matricula_sigaa || "",
        password: "",
        role: userData.role
      });
    }
    
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      siape: "",
      password: "",
      role: "professor"
    });
    setFormError("");
    setSuccessMessage("");
    setShowPassword(false);
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Salvar usuário
  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      if (modalMode === "create") {
        if (formData.role === "aluno") {
          // validação básica de matrícula
          if (!/^\d{6}$/.test(formData.matricula_sigaa || "")) {
            throw new Error("A matrícula do SIGAA deve conter exatamente 6 dígitos");
          }
          await createStudent({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            matricula_sigaa: formData.matricula_sigaa,
            password: formData.password
          });
        } else {
          await createUser({
            name: formData.name,
            email: formData.email,
            siape: formData.siape,
            password: formData.password,
            role: formData.role
          });
        }
        setSuccessMessage("Usuário criado com sucesso!");
      } else if (modalMode === "edit") {
        // Para edição, envia também matricula_sigaa se for aluno (se o backend aceitar)
        await updateUser(selectedUser.id, {
          name: formData.name,
          email: formData.email,
          siape: formData.role === 'aluno' ? '' : formData.siape,
          matricula_sigaa: formData.role === 'aluno' ? formData.matricula_sigaa : undefined,
          password: formData.password,
          role: formData.role
        });
        setSuccessMessage("Usuário atualizado com sucesso!");
      }
      
      await loadUsers();
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Deletar usuário
  const handleDelete = async (userId, userName) => {
    if (userId === user?.id) {
      alert("Você não pode deletar seu próprio usuário!");
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      try {
        await deleteUser(userId);
        await loadUsers();
        setSuccessMessage("Usuário deletado com sucesso!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Erro ao deletar usuário: " + err.message);
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  // Obter label do role
  const getRoleLabel = (role) => {
    const roleObj = userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  // Obter cor do badge do role
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      professor: "bg-blue-100 text-blue-800",
      servidor: "bg-cyan-100 text-cyan-800",
      coordenador: "bg-purple-100 text-purple-800",
      aluno: "bg-green-100 text-green-800",
      portaria: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 mb-4 md:mb-6">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Gerenciar Usuários
            </h1>
            <p className="text-xs md:text-sm text-gray-700">
              Visualize e gerencie todos os usuários do sistema
            </p>
          </div>
          <button
            onClick={() => openModal("create")}
            className="w-full sm:w-auto bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Novo Usuário</span>
          </button>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
                <AlertCircle className="text-white flex-shrink-0" size={18} />
                <span className="text-xs md:text-sm font-medium break-words flex-1">{error}</span>
                <button
                    onClick={() => setError("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
        <div className={`fixed left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20 md:top-20' : 'top-4'
        }`}>
            <div className="bg-green-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
                <CheckCircle className="text-white flex-shrink-0" size={18} />
                <span className="text-xs md:text-sm font-medium break-words flex-1">{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Barra de busca */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-2 md:left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email, SIAPE ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Tabela de usuários */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        SIAPE
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center min-w-0">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                              {u.id === user?.id && (
                                <div className="text-xs text-blue-600">(Você)</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 min-w-0">
                          <div className="truncate max-w-[200px]" title={u.email}>
                            {u.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {u.siape || u.matricula_sigaa || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-black whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openModal("edit", u)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded flex-shrink-0"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                className="text-red-600 hover:text-red-900 p-1 rounded flex-shrink-0"
                                title="Deletar"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando um novo usuário."}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow border p-6 text-center">
                  <UserCheck className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando um novo usuário."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                  >
                    {/* Header: Avatar, Nome e Tipo */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 break-words">
                            {u.name}
                          </h3>
                          {u.id === user?.id && (
                            <div className="text-xs text-blue-600">(Você)</div>
                          )}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </div>

                    {/* Informações principais */}
                    <div className="space-y-1.5 mb-3">
                      {/* Email */}
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[60px]">Email:</span>
                        <span className="text-xs text-gray-900 break-words flex-1">{u.email}</span>
                      </div>

                      {/* SIAPE/Matrícula */}
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[60px]">
                          {u.role === 'aluno' ? 'Matrícula:' : 'SIAPE:'}
                        </span>
                        <span className="text-xs text-gray-900 break-words flex-1">
                          {u.siape || u.matricula_sigaa || '-'}
                        </span>
                      </div>

                      {/* Criado em */}
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 min-w-[60px]">Criado em:</span>
                        <span className="text-xs text-gray-900">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openModal("edit", u)}
                        className="flex items-center justify-center focus:outline-none"
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: "#E3E5E8",
                          borderRadius: "5px",
                          padding: "6px",
                        }}
                        title="Editar"
                      >
                        <Edit size={14} style={{ color: "#1E2024" }} />
                      </button>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="flex items-center justify-center focus:outline-none"
                          style={{
                            width: "28px",
                            height: "28px",
                            backgroundColor: "#FFE4E1",
                            borderRadius: "5px",
                            padding: "6px",
                          }}
                          title="Deletar"
                        >
                          <Trash2 size={14} style={{ color: "#D03E3E" }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-medium text-gray-900">
                  {modalMode === "create" ? "Novo Usuário" : "Editar Usuário"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-800 flex-shrink-0"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              {/* Toast de Erro do Formulário */}
              {formError && (
                <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[60] animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
                        <AlertCircle className="text-white flex-shrink-0" size={18} />
                        <span className="text-xs md:text-sm font-medium break-words flex-1">{formError}</span>
                        <button
                            onClick={() => setFormError("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Toast de Sucesso do Formulário */}
              {successMessage && (
                <div className={`fixed left-4 right-4 md:left-auto md:right-4 md:w-auto z-[60] animate-in slide-in-from-top-2 duration-300 ${
                    formError ? 'top-20 md:top-20' : 'top-4'
                }`}>
                    <div className="bg-green-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 md:gap-3 w-full md:min-w-[300px]">
                        <CheckCircle className="text-white flex-shrink-0" size={18} />
                        <span className="text-xs md:text-sm font-medium break-words flex-1">{successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSave} className="space-y-3 md:space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              {/* Documento institucional: SIAPE (demais papéis) ou Matrícula SIGAA (aluno) */}
                {formData.role === 'aluno' ? (
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Matrícula SIGAA
                    </label>
                    <input
                      type="text"
                      name="matricula_sigaa"
                      value={formData.matricula_sigaa}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456"
                    />
                    <p className="mt-1 text-xs text-gray-500">Digite 6 dígitos</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      SIAPE
                    </label>
                    <input
                      type="text"
                      name="siape"
                      value={formData.siape}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Senha */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {modalMode === "create" ? "Senha" : "Nova Senha (deixe vazio para manter)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === "create"}
                      minLength={6}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Tipo de Usuário */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuário
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
