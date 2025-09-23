import React, { useState } from 'react';
import { Settings, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfessorLayout from '../../layouts/ProfessorLayout';
import { resetPassword } from '../../services/authService';

const Configuracoes = () => {
  const { user } = useAuth();
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagens ao digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações
      if (passwordData.new_password !== passwordData.confirm_password) {
        throw new Error('A nova senha e confirmação não coincidem');
      }

      if (passwordData.new_password.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      if (passwordData.current_password === passwordData.new_password) {
        throw new Error('A nova senha deve ser diferente da senha atual');
      }

      await resetPassword(passwordData);
      setSuccess('Senha redefinida com sucesso!');
      
      // Limpar formulário
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfessorLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            </div>
            <p className="text-gray-700">
              Gerencie suas configurações pessoais e de segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações do Usuário */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  
                  {user?.siape && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">SIAPE</p>
                        <p className="font-medium text-gray-800">{user.siape}</p>
                      </div>
                    </div>
                  )}
                  
                  {user?.matricula_sigaa && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Matrícula SIGAA</p>
                        <p className="font-medium text-gray-800">{user.matricula_sigaa}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Redefinir Senha */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="text-blue-600" size={24} />
                  <h2 className="text-lg font-semibold text-gray-800">Redefinir Senha</h2>
                </div>

                {/* Aviso para primeiro acesso */}
                {user?.first_login && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-yellow-600" size={20} />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Primeiro Acesso</h3>
                        <p className="text-sm text-yellow-700">
                          Para sua segurança, recomendamos que você redefina sua senha padrão.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alertas */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={16} />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="text-green-800 text-sm">{success}</span>
                  </div>
                )}

                {/* Formulário */}
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {/* Senha atual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite sua senha atual"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {user?.first_login && user?.matricula_sigaa && (
                      <p className="mt-1 text-xs text-gray-500">
                        Dica: Sua senha atual é sua matrícula: {user.matricula_sigaa}
                      </p>
                    )}
                  </div>

                  {/* Nova senha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite sua nova senha"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  {/* Confirmar nova senha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirme sua nova senha"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Botão */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Redefinindo...
                        </>
                      ) : (
                        'Redefinir Senha'
                      )}
                    </button>
                  </div>
                </form>

                {/* Dicas de segurança */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Dicas de segurança:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Use uma senha única e segura</li>
                    <li>• Combine letras, números e símbolos</li>
                    <li>• Evite informações pessoais óbvias</li>
                    <li>• Não compartilhe sua senha com ninguém</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default Configuracoes;
