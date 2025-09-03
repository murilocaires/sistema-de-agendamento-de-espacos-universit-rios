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
    { value: "direcao", label: "Direção" }
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
        await updateUser(selectedUser.id, formData);
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
      direcao: "bg-indigo-100 text-indigo-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-700">
              Visualize e gerencie todos os usuários do sistema
            </p>
          </div>
          <button
            onClick={() => openModal("create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Usuário
          </button>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <AlertCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{error}</span>
                <button
                    onClick={() => setError("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
        <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20' : 'top-4'
        }`}>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <CheckCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Barra de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email, SIAPE ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabela de usuários */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal("edit", u)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
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
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === "create" ? "Novo Usuário" : "Editar Usuário"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Toast de Erro do Formulário */}
              {formError && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <AlertCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{formError}</span>
                        <button
                            onClick={() => setFormError("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Toast de Sucesso do Formulário */}
              {successMessage && (
                <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
                    formError ? 'top-20' : 'top-4'
                }`}>
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <CheckCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SIAPE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIAPE
                  </label>
                  <input
                    type="text"
                    name="siape"
                    value={formData.siape}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuário
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
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
