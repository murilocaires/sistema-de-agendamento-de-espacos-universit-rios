import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createStudent, addStudentToProject } from '../../services/authService';
import ToastNotification from '../aluno/ToastNotification';

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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          setToast({
            show: true,
            message: 'Aluno cadastrado e vinculado ao projeto com sucesso',
            type: 'success'
          });
        } catch (linkErr) {
          console.error('Erro ao vincular aluno ao projeto:', linkErr);
          setToast({
            show: true,
            message: 'Aluno cadastrado. Não foi possível vincular ao projeto automaticamente. Tente gerenciar alunos.',
            type: 'success'
          });
        }
      } else {
        setToast({
          show: true,
          message: response.message || 'Aluno cadastrado com sucesso',
          type: 'success'
        });
      }
      setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
      setSelectedProjectId('');
      
      // Auto-hide toast após 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setToast({
        show: true,
        message: err.message || 'Erro ao cadastrar aluno',
        type: 'error'
      });
      
      // Auto-hide toast após 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
    setShowPassword(false);
    setSelectedProjectId('');
    setToast({ show: false, message: "", type: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header com gradiente */}
          <div className="bg-blue-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Cadastrar Aluno</h2>
              <button 
                onClick={handleClose} 
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Barra de progresso animada */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Conteúdo do formulário */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Projeto *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" disabled>Selecione um projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite o nome completo do aluno"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="aluno@universidade.edu"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula do SIGAA *</label>
                <input
                  type="text"
                  name="matricula_sigaa"
                  value={formData.matricula_sigaa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="123456"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">Digite exatamente 6 dígitos da matrícula do SIGAA</p>
              </motion.div>

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
          </div>

              {/* Botões com animação */}
              <motion.div 
                className="flex gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {submitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', email: '', matricula_sigaa: '', password: '' });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Limpar
                </button>
              </motion.div>
            </form>
          </div>

        </motion.div>
      </motion.div>
      
      {/* Toast de notificação */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </AnimatePresence>
  );
};

export default CreateStudentModal;
