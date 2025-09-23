import React, { useState, useEffect } from "react";
import ProfessorLayout from "../../layouts/ProfessorLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations,
  getRooms,
  getUsers,
  getProjects
} from "../../services/authService";
import { 
  LayoutDashboard,
  ClipboardList,
  CalendarPlus,
  Clock,
  Users,
  DoorClosed,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react";

const DashboardProfessor = () => {
  const { user } = useAuth();

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalReservations: 0,
    myReservations: 0,
    pendingReservations: 0,
    approvedReservations: 0,
    totalRooms: 0,
    totalUsers: 0,
    totalProjects: 0,
    totalStudents: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [myRecentReservations, setMyRecentReservations] = useState([]);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [allReservations, myReservations, roomsData, usersData, projectsData] = await Promise.all([
        getReservations(),
        getReservations({ user_id: user?.id }),
        getRooms(),
        getUsers(),
        getProjects()
      ]);

      // Calcular estatísticas
      const totalReservations = allReservations.length;
      const myReservationsCount = myReservations.length;
      const pendingReservations = myReservations.filter(r => r.status === 'pending').length;
      const approvedReservations = myReservations.filter(r => r.status === 'approved').length;

      setStats({
        totalReservations,
        myReservations: myReservationsCount,
        pendingReservations,
        approvedReservations,
        totalRooms: roomsData.length,
        totalUsers: usersData.length,
        totalProjects: projectsData.length,
        totalStudents: projectsData.reduce((sum, project) => sum + (project.student_count || 0), 0)
      });

      // Reservas recentes do sistema (últimas 5)
      const recent = allReservations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentReservations(recent);

      // Minhas reservas recentes (últimas 3)
      const myRecent = myReservations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
      setMyRecentReservations(myRecent);

    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

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

  if (loading) {
    return (
      <ProfessorLayout>
        <div className="p-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Professor
            </h1>
          </div>
          <p className="text-gray-700">
            Bem-vindo, {user?.name}! Aqui você pode gerenciar suas reservas e visualizar o sistema.
          </p>
        </div>

        {/* Toast de Erro */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
              <AlertCircle className="text-white" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Reservas do Sistema */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ClipboardList className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Minhas Reservas */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Minhas Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myReservations}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Reservas Pendentes */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReservations}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {/* Reservas Aprovadas */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedReservations}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total de Projetos */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meus Projetos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total de Alunos */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos nos Projetos</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Minhas Reservas Recentes */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Minhas Reservas Recentes</h2>
              </div>
            </div>
            <div className="p-6">
              {myRecentReservations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Você ainda não fez nenhuma reserva.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRecentReservations.map((reservation) => (
                    <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{reservation.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <DoorClosed size={14} />
                          <span>{reservation.room_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatDate(reservation.start_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reservas Recentes do Sistema */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Reservas Recentes do Sistema</h2>
              </div>
            </div>
            <div className="p-6">
              {recentReservations.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ainda não há reservas no sistema.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReservations.map((reservation) => (
                    <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{reservation.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{reservation.user_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DoorClosed size={14} />
                          <span>{reservation.room_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatDate(reservation.start_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href="/professor/nova-reserva"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarPlus className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Nova Reserva</h3>
                <p className="text-xs text-gray-600">Criar uma nova reserva</p>
              </div>
            </a>

            <a
              href="/professor/reservas-sistema"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <ClipboardList className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ver Reservas</h3>
                <p className="text-xs text-gray-600">Visualizar todas as reservas</p>
              </div>
            </a>

            <a
              href="/professor/minhas-reservas"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Minhas Reservas</h3>
                <p className="text-xs text-gray-600">Gerenciar minhas reservas</p>
              </div>
            </a>

            <a
              href="/professor/projetos"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Meus Projetos</h3>
                <p className="text-xs text-gray-600">Gerenciar projetos de extensão</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default DashboardProfessor;
