import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  resetPassword
} from "../../services/authService";
import { 
  User,
  Mail,
  Calendar,
  Key,
  Edit,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  Shield
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";

const PerfilAluno = () => {
  const { user } = useAuth();

  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados do formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Estados de validação
  const [passwordErrors, setPasswordErrors] = useState({});

  // Verificar se é primeiro login
  const isFirstLogin = user?.first_login === true;

  // Manipular mudanças no formulário de senha
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validar formulário de senha
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 6 caracteres";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "Nova senha deve ser diferente da atual";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter alteração de senha
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await resetPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess("Senha alterada com sucesso!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);

    } catch (err) {
      setError("Erro ao alterar senha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário de senha
  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setError("");
    setSuccess("");
  };

  // Formatar data de criação da conta
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
          </div>
          <p className="text-gray-700">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Aviso de Primeiro Login */}
        {isFirstLogin && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Primeiro Acesso</h3>
                <p className="text-sm text-yellow-700">
                  Esta é sua primeira vez acessando o sistema. Recomendamos que você altere sua senha padrão por uma mais segura.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <AlertCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Toast de Sucesso */}
        {success && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <CheckCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Informações do Perfil */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Informações Pessoais</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UserCheck className="text-green-600" size={16} />
              <span>Conta Ativa</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Nome Completo</p>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            {/* Matrícula SIGAA */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Matrícula SIGAA</p>
                <p className="text-lg font-semibold text-gray-900">{user?.matricula_sigaa || 'Não informada'}</p>
              </div>
            </div>

            {/* Data de Criação */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Membro desde</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Segurança */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Segurança</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Key size={16} />
                Alterar Senha
              </button>
            )}
          </div>

          {/* Formulário de Alteração de Senha */}
          {showPasswordForm && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-800">Alterar Senha</h3>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    resetPasswordForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Senha Atual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Digite sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirme sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPasswordForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar Senha
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Informações de Segurança */}
          {!showPasswordForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status da Senha</p>
                  <p className="text-sm text-gray-900">
                    {isFirstLogin ? "Senha padrão - Recomendamos alterar" : "Senha personalizada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nível de Acesso</p>
                  <p className="text-sm text-gray-900">Aluno - Acesso básico ao sistema</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default PerfilAluno;
