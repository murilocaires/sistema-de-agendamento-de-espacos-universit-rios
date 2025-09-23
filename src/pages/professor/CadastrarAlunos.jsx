import React, { useState } from 'react';
import { Plus, Users, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfessorLayout from '../../layouts/ProfessorLayout';
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

      const response = await createStudent({
        name: formData.name,
        email: formData.email,
        matricula_sigaa: formData.matricula_sigaa,
        password: formData.password || undefined // Se vazio, não enviar
      });

      setSuccess(response.message);
      
      // Limpar formulário
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
    <ProfessorLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Cadastrar Alunos</h1>
            </div>
            <p className="text-gray-700">
              Cadastre novos alunos no sistema. Eles receberão acesso com a matrícula do SIGAA.
            </p>
          </div>

          {/* Alertas */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome completo do aluno"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="aluno@universidade.edu"
                  required
                />
              </div>

              {/* Matrícula SIGAA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrícula do SIGAA *
                </label>
                <input
                  type="text"
                  name="matricula_sigaa"
                  value={formData.matricula_sigaa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Digite exatamente 6 dígitos da matrícula do SIGAA
                </p>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha (Opcional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deixe vazio para usar a matrícula como senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ℹ️ Informações sobre a senha
                  </button>
                  {showPasswordInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Se você não definir uma senha:</strong><br />
                        • O aluno usará a matrícula do SIGAA como senha<br />
                        • Exemplo: matrícula "123456" = senha "123456"<br />
                        • O aluno será obrigado a redefinir a senha no primeiro acesso
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Cadastrar Aluno
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      matricula_sigaa: '',
                      password: ''
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Informações importantes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• O aluno receberá um email com as instruções de acesso</li>
              <li>• A matrícula do SIGAA é obrigatória e deve ter 6 dígitos</li>
              <li>• Se não definir senha, a matrícula será usada como senha padrão</li>
              <li>• O aluno será obrigado a redefinir a senha no primeiro acesso</li>
              <li>• Cada aluno pode ser associado a um ou mais projetos</li>
            </ul>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default CadastrarAlunos;
