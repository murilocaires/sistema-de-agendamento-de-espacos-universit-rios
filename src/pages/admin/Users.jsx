import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
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
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.siape.includes(searchTerm) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        password: "",
        role: "professor"
      });
    } else if (mode === "edit" && userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        siape: userData.siape,
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
        await createUser(formData);
        setSuccessMessage("Usuário criado com sucesso!");
      } else if (modalMode === "edit") {
        // No modo de edição, se a senha estiver vazia, não enviar ela
        const updateData = { ...formData };
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }
        await updateUser(selectedUser.id, updateData);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Gerenciar Usuários
            </h1>
            <p className="text-xs md:text-sm text-gray-700">
              Visualize e gerencie todos os usuários do sistema
            </p>
          </div>
          <button
            onClick={() => openModal("create")}
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Novo Usuário</span>
          </button>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-20 md:top-4 left-4 right-4 md:left-auto md:right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
                <AlertCircle className="text-white flex-shrink-0 w-5 h-5" />
                <span className="text-xs md:text-sm font-medium flex-1">{error}</span>
                <button
                    onClick={() => setError("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
        <div className={`fixed left-4 right-4 md:left-auto md:right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-32 md:top-20' : 'top-20 md:top-4'
        }`}>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
                <CheckCircle className="text-white flex-shrink-0 w-5 h-5" />
                <span className="text-xs md:text-sm font-medium flex-1">{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
        )}

        {/* Barra de busca */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-2 md:left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email, SIAPE ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabela de usuários */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <>
            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider max-w-[200px]">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      SIAPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider min-w-[120px]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                            {u.id === user?.id && (
                              <div className="text-xs text-blue-600">(Você)</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.siape}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center min-w-[100px]">
                          <button
                            onClick={() => openModal("edit", u)}
                            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 p-2 rounded transition-all flex-shrink-0"
                            title="Editar usuário"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 p-2 rounded transition-all flex-shrink-0"
                              title="Deletar usuário"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando um novo usuário."}
                  </p>
                </div>
              )}
            </div>

            {/* Versão Mobile - Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <UserCheck className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando um novo usuário."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="bg-white rounded-lg shadow p-4">
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{u.name}</h3>
                            {u.id === user?.id && (
                              <span className="text-xs text-blue-600 whitespace-nowrap">(Você)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => openModal("edit", u)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">SIAPE</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">{u.siape}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Tipo</p>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full mt-0.5 ${getRoleBadgeColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Criado em</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md my-4">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-medium text-gray-900">
                  {modalMode === "create" ? "Novo Usuário" : "Editar Usuário"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-800 flex-shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Toast de Erro do Formulário */}
              {formError && (
                <div className="fixed top-20 md:top-4 left-4 right-4 md:left-auto md:right-4 z-[60] animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
                        <AlertCircle className="text-white flex-shrink-0 w-5 h-5" />
                        <span className="text-xs md:text-sm font-medium flex-1">{formError}</span>
                        <button
                            onClick={() => setFormError("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              )}

              {/* Toast de Sucesso do Formulário */}
              {successMessage && (
                <div className={`fixed left-4 right-4 md:left-auto md:right-4 z-[60] animate-in slide-in-from-top-2 duration-300 ${
                    formError ? 'top-32 md:top-20' : 'top-20 md:top-4'
                }`}>
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
                        <CheckCircle className="text-white flex-shrink-0 w-5 h-5" />
                        <span className="text-xs md:text-sm font-medium flex-1">{successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
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
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SIAPE */}
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
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                      minLength={modalMode === "create" ? 6 : 0}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 pr-8 md:pr-10 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 md:right-3 top-1.5 md:top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {modalMode === "edit" && (
                    <p className="mt-1 text-[10px] md:text-xs text-gray-500">
                      Deixe em branco para manter a senha atual
                    </p>
                  )}
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
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-3 md:pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
                  >
                    {formLoading ? "Salvando..." : modalMode === "create" ? "Criar Usuário" : "Salvar Alterações"}
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
