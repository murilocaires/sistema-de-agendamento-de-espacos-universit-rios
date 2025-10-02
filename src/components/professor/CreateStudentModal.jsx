import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { createStudent, addStudentToProject } from '../../services/authService';

const CreateStudentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  projects = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricula_sigaa: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (!selectedProjectId) {
        throw new Error('Selecione um projeto para vincular o aluno');
      }
      if (!/^\d{6}$/.test(formData.matricula_sigaa)) {
        throw new Error('A matrícula do SIGAA deve conter exatamente 6 dígitos');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await createStudent({
        name: formData.name,
        email: formData.email,
        matricula_sigaa: formData.matricula_sigaa,
        password: formData.password || undefined
      });

      const createdStudentId = response?.student?.id || response?.id || response?.student_id;

      // Vincular ao projeto selecionado
      if (createdStudentId && selectedProjectId) {
        try {
          await addStudentToProject(selectedProjectId, createdStudentId);
          setSuccess('Aluno cadastrado e vinculado ao projeto com sucesso');
        } catch (linkErr) {
          console.error('Erro ao vincular aluno ao projeto:', linkErr);
          setSuccess('Aluno cadastrado. Não foi possível vincular ao projeto automaticamente. Tente gerenciar alunos.');
        }
      } else {
        setSuccess(response.message || 'Aluno cadastrado com sucesso');
      }
      setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
      setSelectedProjectId('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar aluno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowPasswordInfo(false);
    setSelectedProjectId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Cadastrar Aluno</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Selecione um projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula do SIGAA *</label>
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
            <p className="mt-1 text-xs text-gray-500">Digite exatamente 6 dígitos da matrícula do SIGAA</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha (Opcional)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deixe vazio para usar a matrícula como senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  <p>
                    <strong>Se você não definir uma senha:</strong><br />
                    • O aluno usará a matrícula do SIGAA como senha<br />
                    • Exemplo: matrícula "123456" = senha "123456"<br />
                    • O aluno será obrigado a redefinir a senha no primeiro acesso
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
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
    </div>
  );
};

export default CreateStudentModal;
