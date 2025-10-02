import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';

const ReservationDetailsModal = ({ 
isOpen, 
onClose, 
reservation 
}) => {
if (!isOpen || !reservation) return null;


// Formatar data
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
    });
};

// Formatar data e hora separadamente
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
    date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }),
    time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })
    };
};

// Obter texto do tipo de recorrência
const getRecurrenceTypeText = (type) => {
    const types = {
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal'
    };
    return types[type] || type;
};

// Calcular próximas datas de recorrência
const calculateRecurrenceDates = () => {
    if (!reservation.start_time || !reservation.recurrence_type) {
        return [];
    }

    const startDate = new Date(reservation.start_time);
    const endDate = reservation.recurrence_end_date ? new Date(reservation.recurrence_end_date) : null;
    const interval = reservation.recurrence_interval || 1;
    const dates = [];

    // Limitar a 10 ocorrências para não sobrecarregar a interface
    const maxOccurrences = 10;
    let currentDate = new Date(startDate);
    let count = 0;

    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
        dates.push(new Date(currentDate));
        count++;

        // Calcular próxima data baseado no tipo
        switch (reservation.recurrence_type) {
        case 'daily':
            currentDate.setDate(currentDate.getDate() + interval);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() + (7 * interval));
            break;
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + interval);
            break;
        default:
            return dates; // Se tipo não reconhecido, retorna o que tem
        }
    }

    return dates;
};

// Formatar data para exibição
const formatDateOnly = (date) => {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Obter cor do status
const getStatusColor = (status) => {
    const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

// Obter texto do status
const getStatusText = (status) => {
    const texts = {
    pending: "Pendente",
    approved: "Aprovada",
    rejected: "Rejeitada"
    };
    return texts[status] || status;
};

// Obter ícone do status
const getStatusIcon = (status) => {
    switch (status) {
    case 'approved':
        return <CheckCircle className="text-green-600" size={16} />;
    case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
    case 'rejected':
        return <X className="text-red-600" size={16} />;
    default:
        return <Clock className="text-gray-600" size={16} />;
    }
};

return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, padding: 0 }}>
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
            Detalhes da Reserva
        </h3>
        <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
        >
            <X size={24} />
        </button>
        </div>

        <div className="space-y-4">
        {/* Informações Básicas */}
        <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Título</label>
                <p className="text-sm text-gray-900">{reservation.title}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <div className="flex items-center">
                {getStatusIcon(reservation.status)}
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                </span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sala</label>
                <p className="text-sm text-gray-900">{reservation.room_name}</p>
                <p className="text-xs text-gray-500">{reservation.room_location}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Capacidade</label>
                <p className="text-sm text-gray-900">{reservation.room_capacity || 'Não informado'} pessoas</p>
            </div>
            </div>
        </div>

        {/* Informações de Data e Hora */}
        <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Data e Hora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data/Hora Início</label>
                <p className="text-sm text-gray-900">{formatDate(reservation.start_time)}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data/Hora Fim</label>
                <p className="text-sm text-gray-900">{formatDate(reservation.end_time)}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Criada em</label>
                <p className="text-sm text-gray-900">{formatDate(reservation.created_at)}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Número de Pessoas</label>
                <p className="text-sm text-gray-900">{reservation.people_count || 1} pessoa(s)</p>
            </div>
            </div>
        </div>

        {/* Informações do Usuário */}
        <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Usuário que Fez a Reserva</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                <p className="text-sm text-gray-900">{reservation.user_name || 'Não informado'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-sm text-gray-900">{reservation.user_email || 'Não informado'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Papel</label>
                <p className="text-sm text-gray-900">{reservation.user_role || 'Não informado'}</p>
            </div>
            </div>
        </div>

        {/* Informações do Projeto */}
        {reservation.project_name && (
            <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Projeto Vinculado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Projeto</label>
                <p className="text-sm text-gray-900">{reservation.project_name}</p>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tipo do Projeto</label>
                <p className="text-sm text-gray-900">{reservation.project_type || 'Não informado'}</p>
                </div>
            </div>
            </div>
        )}

        {/* Informações de Recorrência */}
        {(reservation.is_recurring || reservation.recurrence_type) && (
            <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recorrência</h3>
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Recorrência</label>
                    <p className="text-sm text-gray-900">{getRecurrenceTypeText(reservation.recurrence_type)}</p>
                    </div>
                    {reservation.recurrence_end_date && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data de Fim</label>
                        <p className="text-sm text-gray-900">{formatDate(reservation.recurrence_end_date)}</p>
                    </div>
                    )}
                    {reservation.recurrence_interval && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Intervalo</label>
                        <p className="text-sm text-gray-900">A cada {reservation.recurrence_interval} {reservation.recurrence_type}</p>
                    </div>
                    )}
                </div>
                
                {/* Datas de Recorrência */}
                {(() => {
                    const recurrenceDates = calculateRecurrenceDates();
                    if (recurrenceDates.length > 0) {
                        return (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Datas da Recorrência</label>
                                <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {recurrenceDates.map((date, index) => (
                                            <span 
                                                key={index}
                                                className="px-2 py-1 bg-gray-200/10 text-gray-700 text-xs rounded"
                                            >
                                                {formatDateOnly(date)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
            </div>
        )}

        {/* Informações de Aprovação */}
        {reservation.approved_by_name && (
            <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Aprovação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Aprovado por</label>
                <p className="text-sm text-gray-900">{reservation.approved_by_name}</p>
                </div>
                {reservation.approved_at && (
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data de Aprovação</label>
                    <p className="text-sm text-gray-900">{formatDate(reservation.approved_at)}</p>
                </div>
                )}
            </div>
            </div>
        )}

        {/* Descrição */}
        {reservation.description && (
            <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Descrição</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{reservation.description}</p>
            </div>
        )}

        {/* Motivo da Rejeição */}
        {reservation.status === 'rejected' && reservation.rejection_reason && (
            <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Motivo da Rejeição</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{reservation.rejection_reason}</p>
            </div>
        )}
        </div>

        <div className="flex justify-end gap-3 mt-6 ">
        <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
            Fechar
        </button>
        </div>
    </div>
    </div>
);
};

export default ReservationDetailsModal;
