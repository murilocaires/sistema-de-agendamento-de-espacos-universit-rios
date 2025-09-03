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

  // Redirecionar admin para dashboard específico
  useEffect(() => {
    if (userType === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userType, navigate]);

  // Se for admin, não renderizar nada (será redirecionado)
  if (userType === "admin") {
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
