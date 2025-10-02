import React, { useState } from 'react';
import StudentInfoModal from './StudentInfoModal';

const StudentsView = ({ 
projects, 
selectedProject, 
onProjectChange, 
students
}) => {
const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
const [selectedStudent, setSelectedStudent] = useState(null);
const [showStudentModal, setShowStudentModal] = useState(false);

const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
};


return (
    <div className="space-y-4">
    {/* Seleção de projeto para listar alunos */}
    <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Projeto:</label>
        <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        value={selectedProject?.id || ''}
        onChange={(e) => {
            const proj = projects.find(p => p.id.toString() === e.target.value);
            onProjectChange(proj || null);
        }}
        >
        <option value="">Todos</option>
        {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
        ))}
        </select>
    </div>


    {/* Listas separadas */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Cadastrados por mim</h3>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {students.filter(s => {
            const studentCreatedBy = s.created_by_user_id || s.created_by;
            const currentUserId = currentUser?.id;
            return studentCreatedBy && currentUserId && parseInt(studentCreatedBy) === parseInt(currentUserId);
            }).map((student) => (
            <div 
                key={student.id || student.student_id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100/10 transition-colors"
                onClick={() => handleStudentClick(student)}
            >
                <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate max-w-[220px]">{student.student_name || student.name}</p>
                    {!!student.projects?.length && (
                    <div className="flex items-center gap-1 flex-wrap">
                        {student.projects.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{p}</span>
                        ))}
                    </div>
                    )}
                </div>
                <p className="text-xs text-gray-600 truncate max-w-[240px]">{student.student_email || student.email}</p>
                </div>
            </div>
            ))}
            {students.filter(s => {
            const studentCreatedBy = s.created_by_user_id || s.created_by;
            const currentUserId = currentUser?.id;
            return studentCreatedBy && currentUserId && parseInt(studentCreatedBy) === parseInt(currentUserId);
            }).length === 0 && (
            <p className="text-sm text-gray-500">Nenhum aluno encontrado</p>
            )}
        </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Alunos cadastrados por outros professores</h3>
            <p className="text-xs text-gray-600">Inclui alunos sem informação de criador</p>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {students.filter(s => {
            const studentCreatedBy = s.created_by_user_id || s.created_by;
            const currentUserId = currentUser?.id;
            // Incluir alunos que não foram criados pelo usuário atual OU que não têm informação de criador
            return !studentCreatedBy || !currentUserId || parseInt(studentCreatedBy) !== parseInt(currentUserId);
            }).map((student) => (
            <div 
                key={student.id || student.student_id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100/10 transition-colors"
                onClick={() => handleStudentClick(student)}
            >
                <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate max-w-[220px]">{student.student_name || student.name}</p>
                    {!!student.projects?.length && (
                    <div className="flex items-center gap-1 flex-wrap">
                        {student.projects.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{p}</span>
                        ))}
                    </div>
                    )}
                </div>
                <p className="text-xs text-gray-600 truncate max-w-[240px]">{student.student_email || student.email}</p>
                </div>
            </div>
            ))}
            {students.filter(s => {
            const studentCreatedBy = s.created_by_user_id || s.created_by;
            const currentUserId = currentUser?.id;
            return !studentCreatedBy || !currentUserId || parseInt(studentCreatedBy) !== parseInt(currentUserId);
            }).length === 0 && (
            <p className="text-sm text-gray-500">Nenhum aluno encontrado</p>
            )}
        </div>
        </div>
    </div>

    {/* Modal de informações do aluno */}
    <StudentInfoModal
        isOpen={showStudentModal}
        onClose={() => {
        setShowStudentModal(false);
        setSelectedStudent(null);
        }}
        student={selectedStudent}
    />
    </div>
);
};

export default StudentsView;
