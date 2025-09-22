import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
FileText, 
Search, 
Filter, 
ChevronLeft, 
ChevronRight,
Eye,
Calendar,
User,
Activity,
AlertCircle,
CheckCircle,
X,
RefreshCw
} from "lucide-react";

const Logs = () => {
const { user } = useAuth();
const userType = user?.role || "admin";
const menuItems = getUserMenu(userType);
const userTypeDisplay = getUserTypeDisplay(userType);

// Estados
const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    limit: 50,
    has_next: false,
    has_prev: false
});

// Filtros
const [filters, setFilters] = useState({
    table_name: "",
    action: "",
    user_id: "",
    start_date: "",
    end_date: ""
});

const [showFilters, setShowFilters] = useState(false);
const [selectedLog, setSelectedLog] = useState(null);
const [showModal, setShowModal] = useState(false);

// Opções de filtro
const tableOptions = [
    { value: "", label: "Todas as tabelas" },
    { value: "users", label: "Usuários" },
    { value: "rooms", label: "Salas" },
    { value: "reservations", label: "Reservas" },
    { value: "auth", label: "Autenticação" }
];

const actionOptions = [
    { value: "", label: "Todas as ações" },
    { value: "CREATE", label: "Criar" },
    { value: "UPDATE", label: "Atualizar" },
    { value: "DELETE", label: "Deletar" },
    { value: "LOGIN_SUCCESS", label: "Login Sucesso" },
    { value: "LOGIN_FAILED", label: "Login Falhou" },
    { value: "LOGOUT", label: "Logout" }
];

// Carregar logs
const loadLogs = async (page = 1, currentFilters = filters) => {
    try {
    setLoading(true);
    
    const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value !== "")
        )
    });

    const response = await fetch(`http://localhost:3001/api/audit/logs?${params}`, {
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Erro ao carregar logs');
    }

    const data = await response.json();
    setLogs(data.data.logs);
    setPagination(data.data.pagination);
    setError("");
    } catch (err) {
    setError("Erro ao carregar logs: " + err.message);
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    loadLogs();
}, []);

// Aplicar filtros
const applyFilters = () => {
    loadLogs(1, filters);
};

// Limpar filtros
const clearFilters = () => {
    const emptyFilters = {
    table_name: "",
    action: "",
    user_id: "",
    start_date: "",
    end_date: ""
    };
    setFilters(emptyFilters);
    loadLogs(1, emptyFilters);
};

// Mudar página
const changePage = (page) => {
    loadLogs(page);
};

// Obter cor da ação
const getActionColor = (action) => {
    const colors = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    LOGIN_SUCCESS: "bg-emerald-100 text-emerald-800",
    LOGIN_FAILED: "bg-orange-100 text-orange-800",
    LOGOUT: "bg-gray-100 text-gray-800"
    };
    return colors[action] || "bg-gray-100 text-gray-800";
};

// Obter ícone da ação
const getActionIcon = (action) => {
    switch (action) {
    case 'CREATE': return <CheckCircle size={16} />;
    case 'UPDATE': return <Activity size={16} />;
    case 'DELETE': return <AlertCircle size={16} />;
    case 'LOGIN_SUCCESS': return <User size={16} />;
    case 'LOGIN_FAILED': return <AlertCircle size={16} />;
    case 'LOGOUT': return <User size={16} />;
    default: return <FileText size={16} />;
    }
};

// Formatar data
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
};

// Abrir modal de detalhes
const openLogDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
};

return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
    <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">
            Logs de Auditoria
            </h1>
            <p className="text-gray-700">
            Visualize todas as alterações realizadas no sistema
            </p>
        </div>
        <div className="flex gap-2">
            <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
            <Filter size={20} />
            Filtros
            </button>
            <button
            onClick={() => loadLogs(pagination.current_page)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
            <RefreshCw size={20} />
            Atualizar
            </button>
        </div>
        </div>

        {/* Mensagens */}
        {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
        </div>
        )}

        {/* Filtros */}
        {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Tabela */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Tabela
                </label>
                <select
                value={filters.table_name}
                onChange={(e) => setFilters({...filters, table_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {tableOptions.map(option => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
            </div>

            {/* Ação */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
                </label>
                <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {actionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
            </div>

            {/* Data início */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
                </label>
                <input
                type="datetime-local"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Data fim */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
                </label>
                <input
                type="datetime-local"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Ações
                </label>
                <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                Aplicar
                </button>
                <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                >
                Limpar
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Estatísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-700">Total de Logs</p>
                <p className="text-2xl font-bold text-gray-800">{pagination.total_records}</p>
            </div>
            <FileText className="text-gray-700" size={24} />
            </div>
        </div>
        </div>

        {/* Tabela de logs */}
        {loading ? (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Carregando logs...</p>
        </div>
        ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Tabela
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Registro ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    IP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Ações
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                        {log.user_name || 'Sistema'}
                        </div>
                        <div className="text-sm text-gray-700">
                        {log.user_email || 'N/A'}
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.table_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        onClick={() => openLogDetails(log)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalhes"
                    >
                        <Eye size={16} />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>

            {logs.length === 0 && (
            <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-700" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                Não há logs que correspondam aos filtros aplicados.
                </p>
            </div>
            )}
        </div>
        )}

        {/* Paginação */}
        {pagination.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
            Mostrando página {pagination.current_page} de {pagination.total_pages} 
            ({pagination.total_records} registros no total)
            </div>
            <div className="flex gap-2">
            <button
                onClick={() => changePage(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                <ChevronLeft size={16} />
                Anterior
            </button>
            <button
                onClick={() => changePage(pagination.current_page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                Próxima
                <ChevronRight size={16} />
            </button>
            </div>
        </div>
        )}

        {/* Modal de detalhes */}
        {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                Detalhes do Log #{selectedLog.id}
                </h3>
                <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700"
                >
                <X size={24} />
                </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="space-y-4">
                {/* Informações básicas */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data/Hora</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ação</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    {selectedLog.action}
                    </span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tabela</label>
                    <p className="text-sm text-gray-900">{selectedLog.table_name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID do Registro</label>
                    <p className="text-sm text-gray-900">{selectedLog.record_id}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Usuário</label>
                    <p className="text-sm text-gray-900">{selectedLog.user_name || 'Sistema'}</p>
                    <p className="text-xs text-gray-500">{selectedLog.user_email || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                </div>

                {/* Valores antigos */}
                {selectedLog.old_values && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valores Antigos</label>
                    <pre className="bg-red-50 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                </div>
                )}

                {/* Valores novos */}
                {selectedLog.new_values && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valores Novos</label>
                    <pre className="bg-green-50 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                </div>
                )}

                {/* User Agent */}
                {selectedLog.user_agent && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="text-xs text-gray-700 break-all">{selectedLog.user_agent}</p>
                </div>
                )}
            </div>
            </div>
        </div>
        )}
    </div>
    </DashboardLayout>
);
};

export default Logs;
