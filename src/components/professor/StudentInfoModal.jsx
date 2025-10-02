import React from 'react';
import { X, User, Mail, Hash, Calendar, BookOpen } from 'lucide-react';

const StudentInfoModal = ({ 
isOpen, 
onClose, 
student 
}) => {
if (!isOpen || !student) return null;

const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
    }
};

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6" />
            Informações do Aluno
        </h2>
        <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
        >
            <X className="w-6 h-6" />
        </button>
        </div>

        <div className="space-y-6">
        {/* Informações Pessoais */}
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
                <p className="text-gray-800 font-medium">{student.student_name || student.name || 'Não informado'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-800 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {student.student_email || student.email || 'Não informado'}
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Matrícula SIGAA</label>
                <p className="text-gray-800 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                {student.matricula_sigaa || 'Não informado'}
                </p>
            </div>
            {student.student_siape || student.siape ? (
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">SIAPE</label>
                <p className="text-gray-800">{student.student_siape || student.siape}</p>
                </div>
            ) : null}
            </div>
        </div>

        {/* Informações de Cadastro */}
        <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Informações de Cadastro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data de Cadastro</label>
                <p className="text-gray-800">{formatDate(student.created_at)}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Cadastrado por</label>
                <p className="text-gray-800">
                {student.created_by_name || (student.created_by ? `Servidor ID: ${student.created_by}` : 'Sistema/Admin')}
                </p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <p className="text-gray-800">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Ativo
                </span>
                </p>
            </div>
            </div>
        </div>

        {/* Projetos */}
        {student.projects && student.projects.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Projetos Vinculados
            </h3>
            <div className="flex flex-wrap gap-2">
                {student.projects.map((project, index) => (
                <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                    {project}
                </span>
                ))}
            </div>
            </div>
        )}


        </div>

        <div className="flex justify-end mt-6 pt-4">
        <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
            Fechar
        </button>
        </div>
    </div>
    </div>
);
};

export default StudentInfoModal;
