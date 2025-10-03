import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import DebugUsers from "../../components/DebugUsers";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  // Redirecionar usuários para dashboards específicos
  useEffect(() => {
    const getDashboardPath = (role) => {
      switch (role) {
        case 'admin':
          return '/admin/dashboard';
        case 'professor':
        case 'servidor':
          return '/professor/projetos';
        case 'coordenador':
          return '/coordenador/dashboard';
        case 'portaria':
          return '/portaria/reservas';
        case 'aluno':
          return '/aluno/dashboard';
        default:
          return null; // Não redirecionar se não for um tipo específico
      }
    };

    const dashboardPath = getDashboardPath(userType);
    if (dashboardPath) {
      navigate(dashboardPath, { replace: true });
    }
  }, [userType, navigate]);

  // Se for um tipo específico, não renderizar nada (será redirecionado)
  if (['admin', 'professor', 'coordenador', 'portaria', 'aluno', 'servidor'].includes(userType)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard - Sistema de Agendamentos
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao sistema de agendamentos de espaços universitários!
        </p>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Usuário:</strong> {user.name} ({userTypeDisplay})
            </p>
          </div>
        )}
      </div>
      <DebugUsers />
    </DashboardLayout>
  );
};

export default Dashboard;
