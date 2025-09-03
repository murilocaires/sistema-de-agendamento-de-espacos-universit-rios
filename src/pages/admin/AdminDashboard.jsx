import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations,
  getRooms,
  getUsers 
} from "../../services/authService";
import { 
  Calendar,
  CalendarPlus,
  CheckSquare,
  Users,
  DoorClosed,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ArrowRight,
  BarChart3,
  MapPin,
  User
} from "lucide-react";
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados dos dados
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Estados das estatísticas
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [roomStats, setRoomStats] = useState({
    total: 0,
    active: 0,
    mostUsed: []
  });
  const [quickStats, setQuickStats] = useState({
    totalUsers: 0,
    todayReservations: 0,
    thisWeekReservations: 0
  });

  // Carregar todos os dados
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [reservationsData, roomsData, usersData] = await Promise.all([
        getReservations(),
        getRooms(),
        getUsers()
      ]);
      
      setReservations(reservationsData || []);
      setRooms(roomsData || []);
      setUsers(usersData || []);
      
      // Processar estatísticas
      processStatistics(reservationsData || [], roomsData || [], usersData || []);
      
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Erro ao carregar dados: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  // Processar estatísticas
  const processStatistics = (reservationsData, roomsData, usersData) => {
    // Estatísticas do mês atual
    const currentMonth = moment().format('YYYY-MM');
    const monthlyReservations = reservationsData.filter(reservation => 
      moment(reservation.created_at).format('YYYY-MM') === currentMonth
    );
    
    const monthlyStatsData = {
      total: monthlyReservations.length,
      approved: monthlyReservations.filter(r => r.status === 'approved').length,
      pending: monthlyReservations.filter(r => r.status === 'pending').length,
      rejected: monthlyReservations.filter(r => r.status === 'rejected').length
    };
    setMonthlyStats(monthlyStatsData);

    // Estatísticas das salas
    const activeRooms = roomsData.filter(room => room.is_active);
    
    // Contar uso das salas
    const roomUsage = {};
    reservationsData.filter(r => r.status === 'approved').forEach(reservation => {
      const roomId = reservation.room_id;
      roomUsage[roomId] = (roomUsage[roomId] || 0) + 1;
    });
    
    // Salas mais utilizadas (top 5)
    const mostUsedRooms = Object.entries(roomUsage)
      .map(([roomId, count]) => {
        const room = roomsData.find(r => r.id.toString() === roomId);
        return {
          room: room || { name: 'Sala não encontrada', location: '' },
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setRoomStats({
      total: roomsData.length,
      active: activeRooms.length,
      mostUsed: mostUsedRooms
    });

    // Estatísticas rápidas
    const today = moment().format('YYYY-MM-DD');
    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
    
    const todayReservations = reservationsData.filter(r => 
      moment(r.start_time).format('YYYY-MM-DD') === today && r.status === 'approved'
    ).length;
    
    const thisWeekReservations = reservationsData.filter(r => {
      const reservationDate = moment(r.start_time).format('YYYY-MM-DD');
      return reservationDate >= startOfWeek && reservationDate <= endOfWeek && r.status === 'approved';
    }).length;
    
    setQuickStats({
      totalUsers: usersData.length,
      todayReservations,
      thisWeekReservations
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Ações rápidas
  const quickActions = [
    {
      title: "Calendário Geral",
      description: "Visualizar todas as reservas",
      icon: Calendar,
      color: "bg-blue-500 hover:bg-blue-600",
      path: "/admin/calendario-geral"
    },
    {
      title: "Nova Reserva",
      description: "Criar nova reserva",
      icon: CalendarPlus,
      color: "bg-green-500 hover:bg-green-600",
      path: "/admin/nova-reserva"
    },
    {
      title: "Aprovar Reservas",
      description: "Gerenciar aprovações",
      icon: CheckSquare,
      color: "bg-orange-500 hover:bg-orange-600",
      path: "/admin/aprovar-reservas"
    },
    {
      title: "Gerenciar Usuários",
      description: "Administrar usuários",
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600",
      path: "/admin/usuarios"
    },
    {
      title: "Gerenciar Salas",
      description: "Administrar salas",
      icon: DoorClosed,
      color: "bg-indigo-500 hover:bg-indigo-600",
      path: "/admin/salas"
    },
    {
      title: "Logs do Sistema",
      description: "Auditoria e logs",
      icon: FileText,
      color: "bg-gray-700 hover:bg-gray-800",
      path: "/admin/logs"
    }
  ];

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Painel de Gestão
          </h1>
          <p className="text-gray-700 text-sm">
            Bem-vindo, {user?.name}! Aqui está um resumo do sistema de agendamentos.
          </p>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <AlertCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{error}</span>
                <button
                    onClick={() => setError("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Toast de Sucesso */}
        {successMessage && (
        <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
            error ? 'top-20' : 'top-4'
        }`}>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <CheckCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-700 text-sm">Carregando dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estatísticas Principais */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 size={18} />
                Estatísticas do Mês - {moment().format('MMMM YYYY')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Total de Reservas</p>
                      <p className="text-2xl font-bold text-blue-600">{monthlyStats.total}</p>
                    </div>
                    <Calendar className="text-blue-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Confirmadas</p>
                      <p className="text-2xl font-bold text-green-600">{monthlyStats.approved}</p>
                    </div>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Aguardando</p>
                      <p className="text-2xl font-bold text-orange-600">{monthlyStats.pending}</p>
                    </div>
                    <Clock className="text-orange-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Reprovadas</p>
                      <p className="text-2xl font-bold text-red-600">{monthlyStats.rejected}</p>
                    </div>
                    <XCircle className="text-red-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Visão Geral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Salas Cadastradas</p>
                      <p className="text-xl font-bold text-gray-800">{roomStats.total}</p>
                      <p className="text-xs text-green-600">{roomStats.active} ativas</p>
                    </div>
                    <DoorClosed className="text-gray-700" size={22} />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Usuários Total</p>
                      <p className="text-xl font-bold text-gray-800">{quickStats.totalUsers}</p>
                      <p className="text-xs text-blue-600">Cadastrados no sistema</p>
                    </div>
                    <Users className="text-gray-700" size={22} />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Reservas Hoje</p>
                      <p className="text-xl font-bold text-gray-800">{quickStats.todayReservations}</p>
                      <p className="text-xs text-purple-600">{quickStats.thisWeekReservations} esta semana</p>
                    </div>
                    <Calendar className="text-gray-700" size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Salas Mais Utilizadas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Salas Mais Utilizadas
              </h2>
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4">
                  {roomStats.mostUsed.length > 0 ? (
                    <div className="space-y-3">
                      {roomStats.mostUsed.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs
                              ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'}
                            `}>
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800 text-sm">{item.room.name}</h3>
                              <div className="flex items-center gap-1 text-xs text-gray-700">
                                <MapPin size={10} />
                                {item.room.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-gray-800">{item.count}</p>
                            <p className="text-xs text-gray-700">reservas</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <DoorClosed className="mx-auto h-8 w-8 text-gray-700" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
                      <p className="mt-1 text-xs text-gray-700">
                        As estatísticas aparecerão quando houver reservas aprovadas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ArrowRight size={18} />
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.path)}
                    className={`
                      ${action.color} text-white p-4 rounded-lg shadow 
                      transition-all duration-200 transform hover:scale-105 
                      hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-base font-semibold mb-1">{action.title}</h3>
                        <p className="text-xs opacity-90">{action.description}</p>
                      </div>
                      <action.icon size={24} className="opacity-80" />
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <ArrowRight size={14} className="opacity-80" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
