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
  Shield,
  X,
  GraduationCap
} from "lucide-react";
import ProfessorLayout from "../../layouts/ProfessorLayout";

// Hook para fechar modal com ESC
const useEscapeKey = (callback) => {
  useEffect(() => {
    if (!callback) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
};

const PerfilProfessor = () => {
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

  // Fechar modal com ESC
  const handleCloseModal = () => {
    setShowPasswordForm(false);
    resetPasswordForm();
  };

  // Ativar listener de ESC apenas quando o modal estiver aberto
  useEscapeKey(showPasswordForm ? handleCloseModal : null);

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
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
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
    <ProfessorLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="text-blue-600 w-6 h-6 md:w-8 md:h-8" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Meu Perfil</h1>
          </div>
          <p className="text-sm md:text-base text-gray-700">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Aviso de Primeiro Login */}
        {isFirstLogin && (
          <div className="mb-4 md:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs md:text-sm font-medium text-yellow-800 mb-1">Primeiro Acesso</h3>
                <p className="text-xs md:text-sm text-yellow-700 break-words">
                  Esta é sua primeira vez acessando o sistema. Recomendamos que você altere sua senha padrão por uma mais segura.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
              <AlertCircle className="text-white flex-shrink-0" size={20} />
              <span className="text-sm font-medium break-words">{error}</span>
            </div>
          </div>
        )}

        {/* Toast de Sucesso */}
        {success && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full md:min-w-[300px]">
              <CheckCircle className="text-white flex-shrink-0" size={20} />
              <span className="text-sm font-medium break-words">{success}</span>
            </div>
          </div>
        )}

        {/* Informações do Perfil */}
        <div className="bg-white rounded-lg shadow border p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">Informações Pessoais</h2>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <UserCheck className="text-green-600" size={14} />
              <span>Conta Ativa</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {/* Nome */}
            <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <User className="text-blue-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Nome Completo</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900 break-words">{user?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Mail className="text-green-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900 break-words">{user?.email}</p>
              </div>
            </div>

            {/* SIAPE */}
            {user?.siape && (
              <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <GraduationCap className="text-purple-600" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600">SIAPE</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900 break-words">{user.siape}</p>
                </div>
              </div>
            )}

            {/* Matrícula SIGAA */}
            {user?.matricula_sigaa && (
              <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Shield className="text-purple-600" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Matrícula SIGAA</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900 break-words">{user.matricula_sigaa}</p>
                </div>
              </div>
            )}

            {/* Data de Criação */}
            <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Calendar className="text-orange-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Membro desde</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900 break-words">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Segurança */}
        <div className="bg-white rounded-lg shadow border p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">Segurança</h2>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              <Key size={16} />
              Alterar Senha
            </button>
          </div>

          {/* Informações de Segurança */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Lock className="text-green-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Status da Senha</p>
                <p className="text-xs md:text-sm text-gray-900 break-words">
                  {isFirstLogin ? "Senha padrão - Recomendamos alterar" : "Senha personalizada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Shield className="text-blue-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">Nível de Acesso</p>
                <p className="text-xs md:text-sm text-gray-900 break-words">
                  {user?.role === 'servidor' ? 'Servidor - Acesso a projetos e reservas' : 'Professor - Acesso a projetos e reservas'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Alteração de Senha */}
        {showPasswordForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 md:p-6 transform transition-all max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                    <Key className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Alterar Senha</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  title="Fechar (ESC)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={handlePasswordSubmit} className="space-y-3 md:space-y-4">
                {/* Senha Atual */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${
                        passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Digite sua senha atual"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs md:text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${
                        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Digite sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs md:text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${
                        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirme sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs md:text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 md:px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 md:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
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
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

export default PerfilProfessor;

