import React, { useState } from 'react';
import { Plus, Users, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import { createStudent } from '../../services/authService';

const CadastrarAlunos = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricula_sigaa: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagens de erro/sucesso ao digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar matrícula (6 dígitos)
      if (!/^\d{6}$/.test(formData.matricula_sigaa)) {
        throw new Error('A matrícula do SIGAA deve conter exatamente 6 dígitos');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Validar senha
      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      await createStudent({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        matricula_sigaa: formData.matricula_sigaa,
        password: formData.password
      });

      setSuccess('Aluno cadastrado com sucesso!');
      setFormData({
        name: '',
        email: '',
        matricula_sigaa: '',
        password: ''
      });

    } catch (err) {
      setError(err.message || 'Erro ao cadastrar aluno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-600" size={28} />
              Cadastrar Alunos
            </h1>
            <p className="text-gray-600 mt-2">
              Cadastre novos alunos no sistema para que possam participar dos projetos
            </p>
          </div>

          {/* Mensagens de Feedback */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800">{success}</span>
            </div>
          )}

          {/* Formulário */}
          <div className="bg-white rounded-lg shadow border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome completo do aluno"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="aluno@universidade.edu"
                />
              </div>

              {/* Matrícula SIGAA */}
              <div>
                <label htmlFor="matricula_sigaa" className="block text-sm font-medium text-gray-700 mb-2">
                  Matrícula SIGAA *
                </label>
                <input
                  type="text"
                  id="matricula_sigaa"
                  name="matricula_sigaa"
                  value={formData.matricula_sigaa}
                  onChange={handleInputChange}
                  required
                  maxLength="6"
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Digite apenas números (6 dígitos)
                </p>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Temporária *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite uma senha temporária"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    Informações sobre a senha
                  </button>
                  {showPasswordInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <p className="font-medium mb-1">Sobre a senha temporária:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>O aluno será obrigado a alterar a senha no primeiro login</li>
                        <li>Use uma senha simples e temporária (ex: "123456")</li>
                        <li>O aluno receberá instruções por email</li>
                        <li>Mínimo de 6 caracteres</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setFormData({
                    name: '',
                    email: '',
                    matricula_sigaa: '',
                    password: ''
                  })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Cadastrar Aluno
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Informações Importantes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• O aluno receberá um email com as credenciais de acesso</li>
              <li>• No primeiro login, será obrigado a alterar a senha</li>
              <li>• A matrícula deve ser única no sistema</li>
              <li>• O aluno poderá solicitar participação em projetos após o cadastro</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CadastrarAlunos;
